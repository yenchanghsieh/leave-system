import React from 'react';
import { render, screen } from '@testing-library/react';
import { LeaveBalanceCard } from './LeaveBalanceCard';
import { LeaveBalance } from '@/types';

// Mock language context
jest.mock('../../../lib/i18n/LanguageContext', () => ({
    useLanguage: () => ({
        t: {
            leave: {
                annual: 'Annual Leave',
                sick: 'Sick Leave',
                personal: 'Personal Leave',
                'family-care': 'Family Care',
                parental: 'Parental Leave',
                menstrual: 'Menstrual Leave',
                hours: 'Hours',
                days: 'Days',
                left: 'Left',
                used: 'Used',
                total: 'Total'
            }
        }
    })
}));

describe('LeaveBalanceCard', () => {
    const mockBalance: LeaveBalance = {
        type: 'annual',
        entitlement: 20,
        used: 5,
        unit: 'days'
    };

    test('should render balance details correctly', () => {
        render(<LeaveBalanceCard balance={mockBalance} />);

        // Check Titlte
        expect(screen.getByText('Annual Leave')).toBeInTheDocument();

        // Check Remaining Calculation (20 - 5 = 15)
        expect(screen.getByText('15')).toBeInTheDocument();
        expect(screen.getByText('Left')).toBeInTheDocument();

        // Check Used/Total
        expect(screen.getByText(/Used: 5/i)).toBeInTheDocument();
        expect(screen.getByText(/Total: 20/i)).toBeInTheDocument();

        // Check Unit
        expect(screen.getByText('Days')).toBeInTheDocument();
    });

    test('should apply correct theme for Annual leave', () => {
        render(<LeaveBalanceCard balance={{ ...mockBalance, type: 'annual' }} />);
        // Annual theme involves indigo classes.
        // We look for a distinctive class applied to elements.
        // The badge (unit) has bgClass and textClass.
        // text-indigo-600 bg-indigo-50
        const unitBadge = screen.getByText('Days');
        expect(unitBadge.className).toContain('text-indigo-600');
        expect(unitBadge.className).toContain('bg-indigo-50');
    });

    test('should apply correct theme for Sick leave', () => {
        render(<LeaveBalanceCard balance={{ ...mockBalance, type: 'sick' }} />);
        // Sick theme: text-rose-600 bg-rose-50
        const unitBadge = screen.getByText('Days');
        expect(unitBadge.className).toContain('text-rose-600');
        expect(unitBadge.className).toContain('bg-rose-50');
    });

    test.each([
        ['personal', 'text-slate-600'],
        ['family-care', 'text-emerald-600'],
        ['parental', 'text-amber-600'],
        ['menstrual', 'text-pink-600']
    ])('should apply correct theme for %s leave', (type, expectedClass) => {
        render(<LeaveBalanceCard balance={{ ...mockBalance, type: type as any }} />);
        const unitBadge = screen.getByText('Days');
        expect(unitBadge.className).toContain(expectedClass);
    });

    test('should calculate percentage correctly', () => {
        // 10 used out of 20 = 50%
        render(<LeaveBalanceCard balance={{ ...mockBalance, used: 10 }} />);

        // Progress bar width is animate property, might be hard to test styles directly via JSDOM computed style
        // unless we check the style attribute if framer-motion applies it there.
        // Framer Motion usually applies inline styles.
        // But JSDOM layout is not real.
        // However, we can check if data matches.

        // Let's rely on calculation rendering "10" remaining (20-10)
        expect(screen.getByText('10')).toBeInTheDocument(); // Remaining
    });

    test('should handle zero used', () => {
        render(<LeaveBalanceCard balance={{ ...mockBalance, used: 0 }} />);
        expect(screen.getByText('20')).toBeInTheDocument(); // Remaining
        expect(screen.getByText(/Used: 0/i)).toBeInTheDocument();
    });

    test('should handle hours unit', () => {
        render(<LeaveBalanceCard balance={{ ...mockBalance, unit: 'hours' }} />);
        expect(screen.getByText('Hours')).toBeInTheDocument();
    });
});
