import {
    calculateAnnualLeaveEntitlement,
    validateLeaveRequest,
    calculateDuration,
    isUserOnLeave,
    getEffectiveSupervisor,
    LEAVE_CONFIG,
    HOURS_PER_DAY
} from './leave-logic';
import { LeaveRequest, LeaveBalance } from '@/types';

// Mock date for stable testing
const MOCK_NOW = new Date('2026-06-01');

describe('Leave Logic Utilities', () => {

    describe('calculateAnnualLeaveEntitlement', () => {
        test('should return 0 for less than 6 months', () => {
            // Joined 3 months ago: 2026-03-01
            const onboard = '2026-03-01';
            expect(calculateAnnualLeaveEntitlement(onboard, MOCK_NOW)).toBe(0);
        });

        test('should return 3 for 6 months to 1 year', () => {
            // Joined 9 months ago: 2025-09-01
            const onboard = '2025-09-01';
            expect(calculateAnnualLeaveEntitlement(onboard, MOCK_NOW)).toBe(3);
        });

        test('should return 7 for 1 year to 2 years', () => {
            // Joined 1.5 years ago: 2025-01-01
            const onboard = '2025-01-01';
            expect(calculateAnnualLeaveEntitlement(onboard, MOCK_NOW)).toBe(7);
        });

        test('should return 10 for 2 years to 3 years', () => {
            // Joined 2.5 years ago: 2024-01-01
            const onboard = '2024-01-01';
            expect(calculateAnnualLeaveEntitlement(onboard, MOCK_NOW)).toBe(10);
        });

        test('should return 14 for 3 years to 5 years', () => {
            // Joined 4 years ago: 2022-06-01
            const onboard = '2022-06-01';
            expect(calculateAnnualLeaveEntitlement(onboard, MOCK_NOW)).toBe(14);
        });

        test('should return 15 for 5 years to 10 years', () => {
            // Joined 7 years ago: 2019-06-01
            const onboard = '2019-06-01';
            expect(calculateAnnualLeaveEntitlement(onboard, MOCK_NOW)).toBe(15);
        });

        test('should add 1 day per year after 10 years', () => {
            // Joined 11 years ago: 2015-06-01. Base 15 + 1 = 16
            // Logic says after 10 years it starts at 16 (15+1).
            // Code: additionalDays = years - 10. return min(30, 16 + additionalDays - 1) ?
            // Let's check logic: minimal 16 days for 10th year completed? 
            // The function implementation: 
            // if (years < 10) return 15;
            // additionalDays = years - 10;
            // return Math.min(30, 16 + additionalDays);

            // If years = 10 (exactly 10 years service), returns 16 + 0 = 16.
            // If years = 11, returns 16 + 1 = 17.

            expect(calculateAnnualLeaveEntitlement('2016-06-01', MOCK_NOW)).toBe(16); // 10 years
            expect(calculateAnnualLeaveEntitlement('2015-06-01', MOCK_NOW)).toBe(17); // 11 years
        });

        test('should cap at 30 days', () => {
            // Joined 50 years ago
            const onboard = '1976-06-01';
            expect(calculateAnnualLeaveEntitlement(onboard, MOCK_NOW)).toBe(30);
        });
    });

    describe('validateLeaveRequest', () => {
        const balances: LeaveBalance[] = [
            { type: 'annual', entitlement: 10, used: 2, unit: 'days' },
            { type: 'sick', entitlement: 30, used: 0, unit: 'days' }
        ];

        test('should return invalid if insufficient balance', () => {
            const req = { type: 'annual', totalQuantity: 9 } as LeaveRequest; // Remaining: 8
            const result = validateLeaveRequest(req, balances);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Insufficient balance');
        });

        test('should return valid if sufficient balance', () => {
            const req = { type: 'annual', totalQuantity: 5 } as LeaveRequest; // Remaining: 8
            const result = validateLeaveRequest(req, balances);
            expect(result.valid).toBe(true);
        });

        test('should return invalid for unknown leave type', () => {
            const req = { type: 'unknown_type', totalQuantity: 1 } as LeaveRequest;
            const result = validateLeaveRequest(req, balances);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Invalid leave type');
        });
    });

    describe('calculateDuration', () => {
        // Work hours: 08:30 - 17:30 (Lunch 12:00-13:00)
        // 8 hours per day

        test('should calculate full day correctly', () => {
            const start = new Date('2026-06-01T08:30:00'); // Monday
            const end = new Date('2026-06-01T17:30:00');
            expect(calculateDuration(start, end, 'days')).toBe(1);
            expect(calculateDuration(start, end, 'hours')).toBe(8);
        });

        test('should calculate half day (morning)', () => {
            const start = new Date('2026-06-01T08:30:00');
            const end = new Date('2026-06-01T12:00:00');
            // 3.5 hours
            expect(calculateDuration(start, end, 'hours')).toBe(3.5);
            // 3.5 / 8 = 0.4375 approx
        });

        test('should exclude lunch break', () => {
            const start = new Date('2026-06-01T11:00:00');
            const end = new Date('2026-06-01T14:00:00');
            // 11:00-12:00 (1h) + Lunch (0h) + 13:00-14:00 (1h) = 2h
            expect(calculateDuration(start, end, 'hours')).toBe(2);
        });

        test('should span multiple days', () => {
            const start = new Date('2026-06-01T08:30:00');
            const end = new Date('2026-06-02T17:30:00');
            // 2 full days
            expect(calculateDuration(start, end, 'days')).toBe(2);
        });
    });

    describe('isUserOnLeave', () => {
        const leaveHistory: LeaveRequest[] = [
            {
                id: '1',
                userId: 'user1',
                type: 'annual',
                startDate: '2026-06-01T08:30:00',
                endDate: '2026-06-01T17:30:00',
                status: 'approved',
                totalQuantity: 1,
                unit: 'days',
                reason: 'Vacation',
                substituteId: 'sub1'
            },
            {
                id: '2',
                userId: 'user1',
                type: 'sick',
                startDate: '2026-06-05T08:30:00',
                endDate: '2026-06-05T17:30:00',
                status: 'pending', // Not approved
                totalQuantity: 1,
                unit: 'days',
            }
        ];

        test('should return true if user has approved leave on date', () => {
            const date = new Date('2026-06-01T12:00:00');
            const result = isUserOnLeave('user1', date, leaveHistory);
            expect(result.onLeave).toBe(true);
            expect(result.substituteId).toBe('sub1');
        });

        test('should return false if user has pending leave on date', () => {
            const date = new Date('2026-06-05T12:00:00');
            const result = isUserOnLeave('user1', date, leaveHistory);
            expect(result.onLeave).toBe(false);
        });

        test('should return false if user has no leave on date', () => {
            const date = new Date('2026-06-02T12:00:00');
            const result = isUserOnLeave('user1', date, leaveHistory);
            expect(result.onLeave).toBe(false);
        });

        test('should return false for different user', () => {
            const date = new Date('2026-06-01T12:00:00');
            const result = isUserOnLeave('user2', date, leaveHistory);
            expect(result.onLeave).toBe(false);
        });
    });

    describe('getEffectiveSupervisor', () => {
        const mockUsers: any[] = [
            { id: 'user1', name: 'Employee', supervisorId: 'sup1' },
            { id: 'sup1', name: 'Supervisor' }
        ];

        const leaveHistory: LeaveRequest[] = [
            {
                id: '1',
                userId: 'sup1',
                type: 'annual',
                startDate: new Date().toISOString(), // Today
                endDate: new Date().toISOString(),
                status: 'approved',
                totalQuantity: 1,
                unit: 'days',
                substituteId: 'sub1'
            }
        ];

        test('should return original supervisor if not on leave', () => {
            // Empty history = not on leave
            const result = getEffectiveSupervisor(mockUsers[0], mockUsers, []);
            expect(result).toBe('sup1');
        });

        test('should return substitute if supervisor is on leave with substitute', () => {
            // Note: getEffectiveSupervisor uses 'new Date()' internally for 'today'.
            // Testing this reliably requires mocking Date or ensuring the leave covers 'now'.
            // The leaveHistory above sets start/end to now, so it should cover it if time matches.
            // isUserOnLeave checks exact time overlap.

            // To make this robust, let's mock the system time or create a leave that definitely covers "now"
            // The function uses: const today = new Date();
            // So we need a leave request that spans 'today'.

            const rangeStart = new Date(); rangeStart.setHours(0, 0, 0, 0);
            const rangeEnd = new Date(); rangeEnd.setDate(rangeEnd.getDate() + 1);

            const activeLeave: LeaveRequest = {
                id: '1',
                userId: 'sup1',
                type: 'annual',
                startDate: rangeStart.toISOString(),
                endDate: rangeEnd.toISOString(),
                status: 'approved',
                totalQuantity: 1,
                unit: 'days',
                substituteId: 'sub1'
            };

            const result = getEffectiveSupervisor(mockUsers[0], mockUsers, [activeLeave]);
            expect(result).toBe('sub1');
        });

        test('should return original supervisor if supervisor is on leave but NO substitute', () => {
            const rangeStart = new Date(); rangeStart.setHours(0, 0, 0, 0);
            const rangeEnd = new Date(); rangeEnd.setDate(rangeEnd.getDate() + 1);

            const activeLeaveNoSub: LeaveRequest = {
                id: '1',
                userId: 'sup1',
                type: 'annual',
                startDate: rangeStart.toISOString(),
                endDate: rangeEnd.toISOString(),
                status: 'approved',
                totalQuantity: 1,
                unit: 'days',
                // No substituteId
            };

            const result = getEffectiveSupervisor(mockUsers[0], mockUsers, [activeLeaveNoSub]);
            // Logic: if (supervisorStatus.onLeave && supervisorStatus.substituteId) return substitute
            // else return original.
            expect(result).toBe('sup1');
        });

        test('should return undefined if user has no supervisor', () => {
            const userNoSup = { id: 'root', name: 'Root' };
            const result = getEffectiveSupervisor(userNoSup as any, mockUsers, []);
            expect(result).toBeUndefined();
        });
    });
});
