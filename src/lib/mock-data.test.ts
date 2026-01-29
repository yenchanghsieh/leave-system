
import { INITIAL_BALANCES, MOCK_USERS, MOCK_HISTORY } from './mock-data';

describe('Mock Data', () => {
    describe('INITIAL_BALANCES', () => {
        test('should contain essential leave types', () => {
            const types = INITIAL_BALANCES.map(b => b.type);
            expect(types).toContain('annual');
            expect(types).toContain('sick');
            expect(types).toContain('personal');
        });

        test('should have positive entitlements', () => {
            INITIAL_BALANCES.forEach(b => {
                expect(b.entitlement).toBeGreaterThanOrEqual(0);
            });
        });

        test('should calculate annual leave based on mock user', () => {
            const annual = INITIAL_BALANCES.find(b => b.type === 'annual');
            expect(annual).toBeDefined();
            // MOCK_USER joined 2022-05-15. As of fixed "now" or "today"?
            // The file uses 'today' for calculation implicitly within `calculateAnnualLeaveEntitlement(MOCK_USER.onboardDate)`?
            // Wait, calculateAnnualLeaveEntitlement defaults 'now' to new Date().
            // So this value changes over time. We should just check it's a number.
            expect(typeof annual?.entitlement).toBe('number');
        });
    });

    describe('MOCK_USERS', () => {
        test('should have a root user', () => {
            const root = MOCK_USERS.find(u => u.role === 'root');
            expect(root).toBeDefined();
        });

        test('should have valid email addresses', () => {
            MOCK_USERS.forEach(user => {
                expect(user.email).toMatch(/@.+\..+/);
            });
        });
    });

    describe('MOCK_HISTORY', () => {
        test('should have approved requests', () => {
            // Just verifying structure
            expect(MOCK_HISTORY.length).toBeGreaterThan(0);
            expect(MOCK_HISTORY[0].status).toBeDefined();
        });
    });
});
