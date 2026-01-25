export type LeaveType = 'annual' | 'sick' | 'personal' | 'family-care' | 'parental' | 'menstrual';

export type LeaveUnit = 'days' | 'hours';

export type LeaveYearMode = 'calendar' | 'anniversary';

export interface LeaveRequest {
    id: string;
    userId: string;
    type: LeaveType;
    startDate: string; // ISO string for serialization
    endDate: string;   // ISO string
    totalQuantity: number; // in units defined by unit field
    unit: LeaveUnit; // e.g. 'hours' for Family Care, 'days' for others mostly
    reason?: string;
    substituteId?: string; // Who will cover duties during leave
    status: 'draft' | 'pending' | 'approved' | 'rejected';
}

export interface LeaveBalance {
    type: LeaveType;
    entitlement: number; // Total available for the year
    used: number;        // Total used so far
    unit: LeaveUnit;     // Primary unit for this balance
}

export type Role = 'root' | 'admin' | 'employee';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: Role;
    supervisorId?: string; // If present, this user reports to that supervisor ID
    department?: string;
    onboardDate: string; // ISO string
}

export interface Department {
    id: string;
    name: string;
}

