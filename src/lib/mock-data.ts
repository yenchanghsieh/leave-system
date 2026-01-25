import { UserProfile, LeaveBalance, LeaveRequest } from '@/types';
import { calculateAnnualLeaveEntitlement } from './leave-logic';

const today = new Date();

// 1. Admin
const ADMIN_USER: UserProfile = {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'admin',
    onboardDate: '2020-01-01T00:00:00.000Z',
    department: 'HR'
};

// 2. Manager (Supervises others, but also an employee)
const MANAGER_USER: UserProfile = {
    id: 'manager1',
    name: 'Sarah Manager',
    email: 'sarah@company.com',
    role: 'employee', // Role is employee, but function is manager via supervisorId of others
    onboardDate: '2021-03-15T00:00:00.000Z',
    department: 'Engineering',
    supervisorId: 'admin1' // Reports to Admin
};

// 3. Employee (Reports to Manager)
export const MOCK_USER: UserProfile = {
    id: 'u1',
    name: 'Alex Chen',
    email: 'alex.chen@company.com',
    role: 'employee',
    onboardDate: '2022-05-15T00:00:00.000Z',
    department: 'Engineering',
    supervisorId: 'manager1'
};

// 0. Root User
export const ROOT_USER: UserProfile = {
    id: 'root',
    name: 'Root Admin',
    email: 'root@system.local',
    role: 'root',
    onboardDate: '2020-01-01T00:00:00.000Z',
    department: 'System'
};

export const MOCK_USERS = [ROOT_USER, ADMIN_USER, MANAGER_USER, MOCK_USER];

export const INITIAL_BALANCES: LeaveBalance[] = [
    {
        type: 'annual',
        entitlement: calculateAnnualLeaveEntitlement(MOCK_USER.onboardDate) * 8, // Convert days to hours
        used: 0,
        unit: 'hours',
    },
    {
        type: 'sick',
        entitlement: 30 * 8, // 30 days * 8 hours
        used: 0,
        unit: 'hours',
    },
    {
        type: 'personal',
        entitlement: 14 * 8, // 14 days * 8 hours
        used: 0,
        unit: 'hours',
    },
    {
        type: 'family-care',
        entitlement: 56, // 7 days * 8 hours
        used: 0,
        unit: 'hours',
    },
    {
        type: 'parental',
        entitlement: 30 * 8, // 30 days * 8 hours
        used: 0,
        unit: 'hours',
    },
    {
        type: 'menstrual',
        entitlement: 12 * 8, // 12 days * 8 hours per year
        used: 0,
        unit: 'hours',
    },
];

// Note: In a real app we would have balances per user. For mock, we'll just use one set or map by ID if needed.
// For now, let's assume these balances are for the currently logged in user (switched dynamically).

// Create a leave request where Manager is on leave TODAY, with Admin as substitute
const todayStart = new Date();
todayStart.setHours(8, 0, 0, 0);
const todayEnd = new Date();
todayEnd.setHours(17, 0, 0, 0);

export const MOCK_HISTORY: LeaveRequest[] = [
    {
        id: 'req-manager-leave',
        userId: 'manager1',
        type: 'annual',
        startDate: todayStart.toISOString(),
        endDate: todayEnd.toISOString(),
        totalQuantity: 1,
        unit: 'days',
        reason: 'On vacation, Admin covering',
        substituteId: 'admin1',
        status: 'approved'
    }
];

