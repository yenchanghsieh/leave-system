
import { cn } from './utils';

describe('Utility Functions', () => {
    describe('cn (classname utility)', () => {
        test('should merge class names correctly', () => {
            expect(cn('class1', 'class2')).toBe('class1 class2');
        });

        test('should handle conditional classes', () => {
            expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2');
        });

        test('should handle arrays', () => {
            expect(cn(['class1', 'class2'])).toBe('class1 class2');
        });

        test('should merge tailwind classes using tailwind-merge', () => {
            // p-4 overrides p-2
            expect(cn('p-2', 'p-4')).toBe('p-4');
            // text-red-500 overrides text-blue-500
            expect(cn('text-blue-500', 'text-red-500')).toBe('text-red-500');
        });
    });
});
