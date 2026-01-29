
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from './switch';

describe('Switch', () => {
    test('renders correctly', () => {
        render(<Switch aria-label="Toggle feature" />);
        const switchElement = screen.getByRole('switch', { name: /toggle feature/i });
        expect(switchElement).toBeInTheDocument();
    });

    test('should toggle state on click', () => {
        const handleCheckedChange = jest.fn();
        render(<Switch checked={false} onCheckedChange={handleCheckedChange} aria-label="Toggle" />);

        const switchElement = screen.getByRole('switch');
        fireEvent.click(switchElement);

        expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });

    test('should respect defaultChecked', () => {
        render(<Switch defaultChecked aria-label="On by default" />);
        const switchElement = screen.getByRole('switch');
        expect(switchElement).toBeChecked();
    });

    test('should be disabled', () => {
        render(<Switch disabled aria-label="Disabled switch" />);
        const switchElement = screen.getByRole('switch');
        expect(switchElement).toBeDisabled();
    });
});
