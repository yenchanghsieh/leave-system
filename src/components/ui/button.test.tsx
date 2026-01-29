
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
    test('renders correctly', () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
    });

    test('should handle click events', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('should apply variant classes', () => {
        const { rerender } = render(<Button variant="destructive">Delete</Button>);
        let button = screen.getByRole('button');
        expect(button).toHaveClass('bg-destructive');

        rerender(<Button variant="outline">Cancel</Button>);
        button = screen.getByRole('button');
        expect(button).toHaveClass('border-input');
    });

    test('should apply size classes', () => {
        render(<Button size="lg">Big Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('h-11');
    });

    test('should be disabled when disabled prop is passed', () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });
});
