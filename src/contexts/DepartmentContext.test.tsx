import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DepartmentProvider, useDepartment } from './DepartmentContext';

// Helper component to consume context
const TestComponent = () => {
    const { departments, addDepartment, deleteDepartment } = useDepartment();
    return (
        <div>
            <ul>
                {departments.map(d => (
                    <li key={d.id}>
                        {d.name}
                        <button onClick={() => deleteDepartment(d.id)}>Delete</button>
                    </li>
                ))}
            </ul>
            <button onClick={() => addDepartment('New Mock Dept')}>Add Dept</button>
        </div>
    );
};

describe('DepartmentContext', () => {
    test('provides default departments', () => {
        render(
            <DepartmentProvider>
                <TestComponent />
            </DepartmentProvider>
        );
        expect(screen.getByText('Engineering')).toBeInTheDocument();
        expect(screen.getByText('HR')).toBeInTheDocument();
    });

    test('adds a department', () => {
        render(
            <DepartmentProvider>
                <TestComponent />
            </DepartmentProvider>
        );
        fireEvent.click(screen.getByText('Add Dept'));
        expect(screen.getByText('New Mock Dept')).toBeInTheDocument();
    });

    test('deletes a department', () => {
        render(
            <DepartmentProvider>
                <TestComponent />
            </DepartmentProvider>
        );
        const engineering = screen.getByText('Engineering');
        const deleteBtn = engineering.closest('li')?.querySelector('button');

        expect(deleteBtn).toBeTruthy();
        if (deleteBtn) fireEvent.click(deleteBtn);

        expect(screen.queryByText('Engineering')).not.toBeInTheDocument();
        expect(screen.getByText('HR')).toBeInTheDocument(); // Others remain
    });
});
