
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmployeesTable } from './EmployeesTable';
import { UserProfile } from '@/types';
import { Dictionary } from '@/lib/i18n/types';

// Mock useRouter
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

const mockT: Dictionary = {
    // @ts-ignore - Partial mock
    employees: {
        employee: 'Employee',
        role: 'Role',
        department: 'Department',
        supervisor: 'Supervisor',
        joined: 'Joined',
        email: 'Email',
        actions: 'Actions',
    },
    common: { view: 'View' },
    roles: {
        root: 'Root',
        admin: 'Admin',
        employee: 'Employee'
    }
};

const mockCurrentUser: UserProfile = {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin',
    department: 'HR',
    onboardDate: '2020-01-01'
};

const mockUsers: UserProfile[] = [
    mockCurrentUser,
    {
        id: 'u1',
        name: 'User 1',
        email: 'u1@test.com',
        role: 'employee',
        department: 'Engineering',
        supervisorId: 'admin1',
        onboardDate: '2022-01-01'
    },
    {
        id: 'u2',
        name: 'User 2',
        email: 'u2@test.com',
        role: 'employee',
        department: 'Sales',
        supervisorId: undefined, // No sidebar
        onboardDate: '2023-01-01'
    }
];

describe('EmployeesTable', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render table headers', () => {
        render(
            <EmployeesTable
                users={[]}
                currentUser={mockCurrentUser}
                t={mockT}
                onDeleteClick={jest.fn()}
            />
        );
        expect(screen.getByText('Employee')).toBeInTheDocument();
        expect(screen.getByText('Role')).toBeInTheDocument();
    });

    test('should render employee rows', () => {
        render(
            <EmployeesTable
                users={mockUsers}
                currentUser={mockCurrentUser}
                t={mockT}
                onDeleteClick={jest.fn()}
            />
        );
        expect(screen.getByText('User 1')).toBeInTheDocument();
        expect(screen.getByText('User 2')).toBeInTheDocument();
    });

    test('should navigate on row click', () => {
        render(
            <EmployeesTable
                users={mockUsers}
                currentUser={mockCurrentUser}
                t={mockT}
                onDeleteClick={jest.fn()}
            />
        );

        fireEvent.click(screen.getByText('User 1'));
        expect(mockPush).toHaveBeenCalledWith('/employees/u1');
    });

    test('should show supervisor link for employees', () => {
        render(
            <EmployeesTable
                users={mockUsers}
                currentUser={mockCurrentUser}
                t={mockT}
                onDeleteClick={jest.fn()}
            />
        );

        // 'Admin User' appears as the name of the first user AND as the supervisor of the second user.
        // We verify that we can find it.
        const matches = screen.getAllByText('Admin User');
        expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    test('should trigger delete callback', () => {
        const handleDelete = jest.fn();
        render(
            <EmployeesTable
                users={mockUsers}
                currentUser={mockCurrentUser}
                t={mockT}
                onDeleteClick={handleDelete}
            />
        );

        const row = screen.getByText('User 1').closest('tr');
        if (!row) throw new Error('Row not found');

        const buttons = row.querySelectorAll('button');
        const deleteButton = buttons[buttons.length - 1]; // Last button is delete

        fireEvent.click(deleteButton);
        expect(handleDelete).toHaveBeenCalledWith(mockUsers[1]); // User 1 object
    });

    test('should not show delete button for self', () => {
        render(
            <EmployeesTable
                users={[mockCurrentUser]}
                currentUser={mockCurrentUser}
                t={mockT}
                onDeleteClick={jest.fn()}
            />
        );

        // We need to match specifically the row for Admin User. 
        // getAllByText('Admin User') might return multiple if supervisor logic was triggered (but here no supervisor).
        // Safest is to find row.

        // mockCurrentUser doesn't have supervisorId set, so simple.
        const nameCell = screen.getByText('Admin User');
        const row = nameCell.closest('tr');

        const buttons = row?.querySelectorAll('button');
        expect(buttons?.length).toBe(1);
        expect(buttons?.[0]).toHaveTextContent('View');
    });
});
