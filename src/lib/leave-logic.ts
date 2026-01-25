import { differenceInMonths, differenceInYears } from 'date-fns';
import { UserProfile, LeaveBalance, LeaveType, LeaveRequest, LeaveUnit } from '@/types';

export const HOURS_PER_DAY = 8;

export const LEAVE_CONFIG: Record<LeaveType, { maxDays?: number; allowHourly: boolean; name: string }> = {
    annual: { allowHourly: true, name: 'Annual Leave' },
    sick: { maxDays: 30, allowHourly: true, name: 'Sick Leave' },
    personal: { maxDays: 14, allowHourly: true, name: 'Personal Leave' },
    'family-care': { maxDays: 7, allowHourly: true, name: 'Family Care Leave' },
    parental: { allowHourly: true, name: 'Parental Leave' }, // Changed to allow hourly
    menstrual: { maxDays: 12, allowHourly: true, name: 'Menstrual Leave' },
};

// 2026 Rules Specifics:
// Family Care: 7 days, merge with Personal. 2026 allows hourly.
// Parental: 30 days flexible (daily), rest monthly.

export function calculateAnnualLeaveEntitlement(onboardDateStr: string, now: Date = new Date()): number {
    const onboardDate = new Date(onboardDateStr);
    const years = differenceInYears(now, onboardDate);
    const months = differenceInMonths(now, onboardDate);

    if (months < 6) return 0;
    if (months < 12) return 3;
    if (years < 2) return 7;
    if (years < 3) return 10;
    if (years < 5) return 14;
    if (years < 10) return 15;

    const additionalDays = years - 10;
    // 10 years starts at 16 days (15 + 1). Use 15 + 1 + additionalDays
    return Math.min(30, 16 + additionalDays);
}

export function validateLeaveRequest(request: LeaveRequest, balances: LeaveBalance[]): { valid: boolean; error?: string } {
    // Simple validation based on balance
    const balance = balances.find(b => b.type === request.type);
    if (!balance) return { valid: false, error: 'Invalid leave type' };

    if (request.type === 'parental') {
        // 2026 Rule: Flexible up to 30 days. Now allowed hourly per user request.
        // Removed unit check.
    }

    const requestedAmount = request.totalQuantity;
    const remaining = balance.entitlement - balance.used;

    if (requestedAmount > remaining) {
        return { valid: false, error: `Insufficient balance. Remaining: ${remaining} ${balance.unit}` };
    }

    return { valid: true };
}

export function calculateDuration(start: Date, end: Date, unit: LeaveUnit): number {
    if (start >= end) return 0;

    // Work Schedule Settings
    const WORK_START_HOUR = 8;
    const WORK_START_MIN = 30;
    const LUNCH_START_HOUR = 12;
    const LUNCH_START_MIN = 0;
    const LUNCH_END_HOUR = 13;
    const LUNCH_END_MIN = 0;
    const WORK_END_HOUR = 17;
    const WORK_END_MIN = 30;

    const workStartMins = WORK_START_HOUR * 60 + WORK_START_MIN;
    const lunchStartMins = LUNCH_START_HOUR * 60 + LUNCH_START_MIN;
    const lunchEndMins = LUNCH_END_HOUR * 60 + LUNCH_END_MIN;
    const workEndMins = WORK_END_HOUR * 60 + WORK_END_MIN;

    let totalWorkMinutes = 0;

    let current = new Date(start);

    // Loop through each day
    while (current < end) {
        const dayStart = new Date(current);
        dayStart.setHours(0, 0, 0, 0);

        const dayWorkStart = new Date(dayStart); dayWorkStart.setMinutes(workStartMins);
        const dayLunchStart = new Date(dayStart); dayLunchStart.setMinutes(lunchStartMins);
        const dayLunchEnd = new Date(dayStart); dayLunchEnd.setMinutes(lunchEndMins);
        const dayWorkEnd = new Date(dayStart); dayWorkEnd.setMinutes(workEndMins);

        // End of this analysis window (either request end or end of day)
        const dayEndLimit = new Date(dayStart); dayEndLimit.setHours(24, 0, 0, 0);
        const windowEnd = end < dayEndLimit ? end : dayEndLimit;

        // Morning Session Overlap (08:30 - 12:00)
        const morningStart = current > dayWorkStart ? current : dayWorkStart;
        const morningEnd = windowEnd < dayLunchStart ? windowEnd : dayLunchStart;

        if (morningStart < morningEnd) {
            const overlap = morningEnd.getTime() - morningStart.getTime();
            if (overlap > 0) totalWorkMinutes += overlap / (1000 * 60);
        }

        // Afternoon Session Overlap (13:00 - 17:30)
        // Ensure we don't count time before lunch end if 'current' started earlier
        const afternoonStart = current > dayLunchEnd ? current : dayLunchEnd;
        const afternoonEnd = windowEnd < dayWorkEnd ? windowEnd : dayWorkEnd;

        if (afternoonStart < afternoonEnd) {
            const overlap = afternoonEnd.getTime() - afternoonStart.getTime();
            if (overlap > 0) totalWorkMinutes += overlap / (1000 * 60);
        }

        current = dayEndLimit;
    }

    const totalHours = totalWorkMinutes / 60;

    if (unit === 'hours') {
        return Math.max(0, Number(totalHours.toFixed(1)));
    } else {
        // unit === 'days', assuming 8 hours = 1 day
        const days = totalHours / 8;
        return Math.max(0, Number(days.toFixed(2)));
    }
}

export function isUserOnLeave(userId: string, date: Date, leaveHistory: LeaveRequest[]): { onLeave: boolean; substituteId?: string } {
    // Check if user has an APPROVED request covering this date
    // Note: This matches simple day boundaries. For hourly, it might be more complex, 
    // but for "Supervisor Role Replacement", we usually care if they are off for the day.

    // We only care about approved requests
    const approvedRequests = leaveHistory.filter(r => r.userId === userId && r.status === 'approved');

    const checkTime = date.getTime();

    const activeLeave = approvedRequests.find(req => {
        const start = new Date(req.startDate).getTime();
        const end = new Date(req.endDate).getTime();
        return checkTime >= start && checkTime <= end;
    });

    if (activeLeave) {
        return { onLeave: true, substituteId: activeLeave.substituteId };
    }

    return { onLeave: false };
}

export function getEffectiveSupervisor(targetUser: UserProfile, allUsers: UserProfile[], leaveHistory: LeaveRequest[]): string | undefined {
    if (!targetUser.supervisorId) return undefined;

    const originalSupervisorId = targetUser.supervisorId;
    const today = new Date();

    const supervisorStatus = isUserOnLeave(originalSupervisorId, today, leaveHistory);

    if (supervisorStatus.onLeave && supervisorStatus.substituteId) {
        return supervisorStatus.substituteId;
    }

    return originalSupervisorId;
}

