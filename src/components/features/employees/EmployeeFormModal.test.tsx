
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmployeeFormModal } from './EmployeeFormModal';
import { UserProfile } from '@/types';

// Mock Dependencies
const mockAddUser = jest.fn();
const mockUpdateUser = jest.fn();
jest.mock('../../../contexts/AuthContext', () => ({
    useAuth: () => ({
        addUser: mockAddUser,
        updateUser: mockUpdateUser,
        users: [
            { id: 'u1', name: 'Existing User', role: 'employee' },
            { id: 'admin1', name: 'Admin User', role: 'admin' }
        ]
    })
}));

jest.mock('../../../contexts/DepartmentContext', () => ({
    useDepartment: () => ({
        departments: [
            { id: 'd1', name: 'Engineering' },
            { id: 'd2', name: 'HR' }
        ]
    })
}));

jest.mock('../../../lib/i18n/LanguageContext', () => ({
    useLanguage: () => ({
        t: {}
    })
}));

describe('EmployeeFormModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render form when open', async () => {
        render(
            <EmployeeFormModal
                open={true}
                onOpenChange={jest.fn()}
            />
        );

        // Use getByRole which works reliably with Polyfilled Radix Dialog
        // Check for Heading
        const heading = await screen.findByRole('heading', { level: 2, name: /Add Employee/i });
        expect(heading).toBeInTheDocument();

        // Inputs should be present
        const textboxes = screen.getAllByRole('textbox');
        expect(textboxes.length).toBeGreaterThan(0);

        // Comboboxes (Selects)
        const combos = screen.getAllByRole('combobox');
        expect(combos.length).toBeGreaterThan(0);
    });

    test('should render trigger button', () => {
        render(
            <EmployeeFormModal
                trigger={<button>Open Modal</button>}
            />
        );
        expect(screen.getByText('Open Modal')).toBeInTheDocument();
    });

    test('should submit new employee data', () => {
        const onSuccess = jest.fn();
        render(
            <EmployeeFormModal
                open={true}
                onOpenChange={jest.fn()}
                onSuccess={onSuccess}
            />
        );

        // Fill Form
        const inputs = screen.getAllByRole('textbox');
        const nameInput = inputs[0]; // Name
        const emailInput = inputs[1]; // Email

        fireEvent.change(nameInput, { target: { value: 'New User' } });
        fireEvent.change(emailInput, { target: { value: 'new@test.com' } });

        const combos = screen.getAllByRole('combobox');
        // Assuming order: Role, Department, Supervisor
        // Department is required usually.
        if (combos.length > 1) {
            const deptSelect = combos[1];
            fireEvent.change(deptSelect, { target: { value: 'Engineering' } });
        }

        const submitBtn = screen.getByRole('button', { name: /Add Employee/i });
        fireEvent.click(submitBtn);

        expect(mockAddUser).toHaveBeenCalledWith(expect.objectContaining({
            name: 'New User',
            email: 'new@test.com'
        }));
        expect(onSuccess).toHaveBeenCalled();
    });

    test('should populate form with initial data', () => {
        const initialData: UserProfile = {
            id: 'u123',
            name: 'Edit Me',
            email: 'edit@test.com',
            role: 'employee',
            department: 'HR',
            supervisorId: undefined,
            onboardDate: '2025-01-01'
        };

        render(
            <EmployeeFormModal
                open={true}
                initialData={initialData}
                onOpenChange={jest.fn()}
            />
        );

        expect(screen.getByDisplayValue('Edit Me')).toBeInTheDocument();
        expect(screen.getByDisplayValue('edit@test.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('HR')).toBeInTheDocument();
    });

    test('should call updateUser on submit (edit mode)', () => {
        const initialData: UserProfile = {
            id: 'u123',
            name: 'Old Name',
            email: 'old@test.com',
            role: 'employee',
            department: 'HR',
            supervisorId: undefined,
            onboardDate: '2025-01-01'
        };

        render(
            <EmployeeFormModal
                open={true}
                initialData={initialData}
                onOpenChange={jest.fn()}
            />
        );

        const nameInput = screen.getByDisplayValue('Old Name');
        fireEvent.change(nameInput, { target: { value: 'New Name' } });

        const submitBtn = screen.getByRole('button', { name: /Save Changes/i });
        fireEvent.click(submitBtn);

        expect(mockUpdateUser).toHaveBeenCalledWith(expect.objectContaining({
            id: 'u123',
            name: 'New Name'
        }));
    });
});
