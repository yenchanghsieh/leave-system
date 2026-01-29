
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeaveHistoryTable } from './LeaveHistoryTable';
import { LeaveRequest } from '@/types';

// Mock Modules
jest.mock('../../../lib/i18n/LanguageContext', () => ({
    useLanguage: jest.fn(),
}));

jest.mock('../../../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';

const mockUseLanguage = useLanguage as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;

const mockT = {
    common: { view: 'View' },
    leave: {
        status: 'Status',
        type: 'Type',
        reason: 'Reason',
        from: 'From',
        to: 'To',
        quantity: 'Quantity',
        approved: 'Approved',
        rejected: 'Rejected',
        pending: 'Pending',
        draft: 'Draft',
        hour: 'hr',
        hours: 'hrs',
        day: 'day',
        days: 'days',
        annual: 'Annual Leave',
        sick: 'Sick Leave'
    },
    messages: {
        noHistory: 'No leave history found'
    }
};

const mockHistory: LeaveRequest[] = [
    {
        id: '1',
        userId: 'u1',
        type: 'annual',
        startDate: '2026-06-01T09:00:00',
        endDate: '2026-06-01T17:00:00',
        totalQuantity: 1,
        unit: 'days',
        status: 'approved',
        reason: 'Vacation'
    },
    {
        id: '2',
        userId: 'u1',
        type: 'sick',
        startDate: '2026-06-10T09:00:00',
        endDate: '2026-06-10T17:00:00',
        totalQuantity: 8,
        unit: 'hours',
        status: 'pending',
        reason: 'Flu'
    }
];

describe('LeaveHistoryTable', () => {
    beforeEach(() => {
        mockUseLanguage.mockReturnValue({
            t: mockT,
            dateLocale: {} // date-fns locale mock
        });
        mockUseAuth.mockReturnValue({
            users: [{ id: 'u1', name: 'User 1' }]
        });
    });

    test('should render empty state when history is empty', () => {
        render(<LeaveHistoryTable history={[]} />);
        expect(screen.getByText('No leave history found')).toBeInTheDocument();
    });

    test('should render table with history items', () => {
        render(<LeaveHistoryTable history={mockHistory} />);

        // Headers
        expect(screen.getByText('Type / Reason')).toBeInTheDocument();

        // Rows
        expect(screen.getByText('Annual Leave')).toBeInTheDocument();
        expect(screen.getByText('Sick Leave')).toBeInTheDocument();

        // Status Badges
        expect(screen.getByText('Approved')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    // Note: DropdownMenus from Radix UI are complex to test in JSDOM because they rely on pointer events/focus 
    // and Portals. We might simply verify the component renders without crashing and filter logic works 
    // if we can trigger it. 
    // Radix UI DropdownMenu usually renders content only when triggered.

    // Testing the filter logic directly might be easier if we extract the filter hook, 
    // but here we are testing the Component integration.
});
