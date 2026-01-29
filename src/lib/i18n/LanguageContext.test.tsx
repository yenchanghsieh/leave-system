
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguageProvider, useLanguage } from './LanguageContext';

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

const TestComponent = () => {
    const { language, setLanguage, t } = useLanguage();
    return (
        <div>
            <div data-testid="current-language">{language}</div>
            <div data-testid="translated-hello">{t.common.welcome}</div>
            <button onClick={() => setLanguage('zh-TW')}>Switch to Chinese</button>
        </div>
    );
};

describe('LanguageContext', () => {
    beforeEach(() => {
        localStorageMock.clear();
        jest.clearAllMocks();
    });

    test('should defaults to English', () => {
        render(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );
        expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    });

    test('should switch language', () => {
        render(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        fireEvent.click(screen.getByText('Switch to Chinese'));
        expect(screen.getByTestId('current-language')).toHaveTextContent('zh-TW');
    });

    test('should persist language preference', () => {
        render(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        fireEvent.click(screen.getByText('Switch to Chinese'));
        expect(localStorageMock.setItem).toHaveBeenCalledWith('app-language', 'zh-TW');
    });

    test('should load persisted language', () => {
        localStorageMock.getItem.mockReturnValue('zh-TW');
        render(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );
        expect(screen.getByTestId('current-language')).toHaveTextContent('zh-TW');
    });
});
