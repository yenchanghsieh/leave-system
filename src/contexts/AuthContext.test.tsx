
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { MOCK_USER, MOCK_USERS } from '@/lib/mock-data';

// Mock localStorage
const localStorageMock = (function () {
    let store: Record<string, string> = {};
    return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        removeItem: jest.fn((key: string) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        }),
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const TestAuthComponent = () => {
    const { currentUser, login, logout, updateUser, deleteUser, addUser } = useAuth();
    return (
        <div>
            <div data-testid="user-name">{currentUser.name}</div>
            <div data-testid="user-role">{currentUser.role}</div>
            <div data-testid="user-dept">{currentUser.department}</div>
            <button onClick={() => login('admin1')}>Login Admin</button>
            <button onClick={() => logout()}>Logout</button>
            <button onClick={() => deleteUser(currentUser.id)}>Delete Self</button>
            <button onClick={() => updateUser({ ...currentUser, department: 'HR' })}>Move to HR</button>
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        localStorageMock.clear();
        jest.clearAllMocks();
    });

    test('should load default user initially', () => {
        render(
            <AuthProvider>
                <TestAuthComponent />
            </AuthProvider>
        );
        expect(screen.getByTestId('user-name')).toHaveTextContent(MOCK_USER.name);
    });

    test('should handle login', () => {
        render(
            <AuthProvider>
                <TestAuthComponent />
            </AuthProvider>
        );
        fireEvent.click(screen.getByText('Login Admin'));
        expect(screen.getByTestId('user-name')).toHaveTextContent('Admin User'); // From MOCK_DATA
        expect(localStorageMock.setItem).toHaveBeenCalledWith('current-user-id', 'admin1');
    });

    test('should handle logout', () => {
        render(
            <AuthProvider>
                <TestAuthComponent />
            </AuthProvider>
        );
        fireEvent.click(screen.getByText('Login Admin'));
        fireEvent.click(screen.getByText('Logout'));
        expect(screen.getByTestId('user-name')).toHaveTextContent(MOCK_USER.name);
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('current-user-id');
    });

    test('should enforce HR = Admin rule on update', () => {
        // Log in as a regular user first? Or just use current mock user.
        // MOCK_USER is 'employee', 'Engineering'.
        render(
            <AuthProvider>
                <TestAuthComponent />
            </AuthProvider>
        );

        fireEvent.click(screen.getByText('Move to HR'));

        // Should auto-upgrade to admin
        expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
        expect(screen.getByTestId('user-dept')).toHaveTextContent('HR');
    });

    test('should prevent self deletion', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        render(
            <AuthProvider>
                <TestAuthComponent />
            </AuthProvider>
        );

        fireEvent.click(screen.getByText('Delete Self'));
        expect(consoleSpy).toHaveBeenCalledWith('Cannot delete self');
        consoleSpy.mockRestore();
    });
});
