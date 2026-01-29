
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LeaveApplicationForm } from './LeaveApplicationForm';
import { LeaveBalance } from '@/types';

// Mock Dependencies
jest.mock('../../../lib/i18n/LanguageContext', () => ({
    useLanguage: jest.fn(),
}));

jest.mock('../../../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('../../../lib/leave-logic', () => ({
    LEAVE_CONFIG: {
        annual: { name: 'Annual Leave' },
        sick: { name: 'Sick Leave' }
    },
    validateLeaveRequest: jest.fn(),
    calculateDuration: jest.fn(),
}));

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: () => 'mock-uuid-123'
    }
});

import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { validateLeaveRequest, calculateDuration } from '../../../lib/leave-logic';

const mockUseLanguage = useLanguage as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;
const mockValidate = validateLeaveRequest as jest.Mock;
const mockCalculateDuration = calculateDuration as jest.Mock;

const mockT = {
    leave: {
        type: 'Type',
        from: 'From',
        to: 'To',
        reason: 'Reason',
        annual: 'Annual Leave',
        sick: 'Sick Leave',
        submit: 'Submit',
        saveDraft: 'Save Draft',
        selectSubstitute: 'Select Substitute',
        substitute: 'Substitute' // Added missing key
    },
    messages: {
        success: 'Success',
        validationError: 'Validation Error',
        endTimeAfterStart: 'End time must be after start time'
    }
};

const mockUser = {
    id: 'u1',
    name: 'CurrentUser',
    supervisorId: 'sup1', // Has supervisor, so needs substitute
    department: 'Engineering'
};

const mockBalances: LeaveBalance[] = [
    { type: 'annual', entitlement: 80, used: 0, unit: 'hours' },
    { type: 'sick', entitlement: 40, used: 0, unit: 'hours' }
];

describe('LeaveApplicationForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseLanguage.mockReturnValue({ t: mockT });
        mockUseAuth.mockReturnValue({
            currentUser: mockUser,
            users: [
                mockUser,
                { id: 'sup1', name: 'Supervisor', department: 'Eng' }, // Valid substitute
                { id: 'root', name: 'Root', role: 'root' } // Invalid substitute
            ]
        });
        mockValidate.mockReturnValue({ valid: true });
        mockCalculateDuration.mockReturnValue(8); // Default 8 hours
    });

    test('should render form fields', () => {
        render(<LeaveApplicationForm balances={mockBalances} onSubmit={jest.fn()} />);

        expect(screen.getByText('Type')).toBeInTheDocument();
        expect(screen.getByText('From')).toBeInTheDocument();
        expect(screen.getByText('To')).toBeInTheDocument();
        expect(screen.getByText('Reason')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    test('should prevent submission if disabled fields are missing', () => {
        render(<LeaveApplicationForm balances={mockBalances} onSubmit={jest.fn()} />);
        // Button should be disabled initially (no reason, no substitute selected?)
        const submitBtn = screen.getByRole('button', { name: 'Submit' });
        expect(submitBtn).toBeDisabled();
    });

    test('should submit data when valid (using initialData)', async () => {
        const handleSubmit = jest.fn();
        const initialData = {
            id: '123',
            userId: 'u1',
            type: 'annual',
            startDate: '2026-06-01T09:00:00',
            endDate: '2026-06-01T17:00:00',
            totalQuantity: 8,
            unit: 'hours',
            reason: 'Pre-filled',
            substituteId: 'sup1', // Pre-selected
            status: 'pending' as const
        };

        render(
            <LeaveApplicationForm
                balances={mockBalances}
                onSubmit={handleSubmit}
                initialData={initialData as any}
            />
        );

        const submitBtn = screen.getByRole('button', { name: 'Submit' });
        // Wait for potential effects
        await waitFor(() => expect(submitBtn).not.toBeDisabled());

        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(handleSubmit).toHaveBeenCalled();
            expect(mockValidate).toHaveBeenCalled();
        });
    });

    test('should show validation error if validateLeaveRequest fails', async () => {
        mockValidate.mockReturnValue({ valid: false, error: 'Not enough balance' });
        const handleSubmit = jest.fn();
        const initialData = {
            id: '123',
            userId: 'u1',
            type: 'annual',
            startDate: '2026-06-01T09:00:00',
            endDate: '2026-06-01T17:00:00',
            totalQuantity: 100, // Excessive
            unit: 'hours',
            reason: 'Much vacation',
            substituteId: 'sup1',
            status: 'pending' as const
        };

        render(
            <LeaveApplicationForm
                balances={mockBalances}
                onSubmit={handleSubmit}
                initialData={initialData as any}
            />
        );

        const submitBtn = screen.getByRole('button', { name: 'Submit' });
        await waitFor(() => expect(submitBtn).not.toBeDisabled());

        fireEvent.click(submitBtn);

        expect(await screen.findByText('Not enough balance')).toBeInTheDocument();
        expect(handleSubmit).not.toHaveBeenCalled();
    });
});
