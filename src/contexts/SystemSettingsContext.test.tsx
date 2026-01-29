import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SystemSettingsProvider, useSystemSettings } from './SystemSettingsContext';

// Helper component
const TestComponent = () => {
    const { settings, updateSettings } = useSystemSettings();
    return (
        <div>
            <div data-testid="mode">{settings.leaveYearMode}</div>
            <div data-testid="approval">{settings.approvalRequired.toString()}</div>
            <button onClick={() => updateSettings({ leaveYearMode: 'anniversary' })}>Set Anniversary</button>
            <button onClick={() => updateSettings({ approvalRequired: false })}>Disable Approval</button>
        </div>
    );
};

describe('SystemSettingsContext', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('provides default settings', () => {
        render(
            <SystemSettingsProvider>
                <TestComponent />
            </SystemSettingsProvider>
        );
        expect(screen.getByTestId('mode')).toHaveTextContent('calendar');
        expect(screen.getByTestId('approval')).toHaveTextContent('true');
    });

    test('updates settings', () => {
        render(
            <SystemSettingsProvider>
                <TestComponent />
            </SystemSettingsProvider>
        );
        fireEvent.click(screen.getByText('Set Anniversary'));
        expect(screen.getByTestId('mode')).toHaveTextContent('anniversary');

        fireEvent.click(screen.getByText('Disable Approval'));
        expect(screen.getByTestId('approval')).toHaveTextContent('false');
    });

    test('persists settings to localStorage', () => {
        render(
            <SystemSettingsProvider>
                <TestComponent />
            </SystemSettingsProvider>
        );
        fireEvent.click(screen.getByText('Set Anniversary'));

        expect(localStorage.getItem('system-settings')).toContain('"leaveYearMode":"anniversary"');
    });

    test('loads settings from localStorage', () => {
        const saved = JSON.stringify({ leaveYearMode: 'anniversary', approvalRequired: false });
        localStorage.setItem('system-settings', saved);

        render(
            <SystemSettingsProvider>
                <TestComponent />
            </SystemSettingsProvider>
        );
        expect(screen.getByTestId('mode')).toHaveTextContent('anniversary');
        expect(screen.getByTestId('approval')).toHaveTextContent('false');
    });
});
