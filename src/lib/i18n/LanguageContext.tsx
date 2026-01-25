'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Dictionary } from './types';
import { dictionaries } from './dictionaries';

import { enUS, zhTW, ja as jaJP } from 'date-fns/locale';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Dictionary;
    dateLocale: any; // date-fns Locale object
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const localeMap: Record<Language, any> = {
    'en': enUS,
    'zh-TW': zhTW,
    'ja': jaJP
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('app-language') as Language;
        if (saved && (saved === 'en' || saved === 'zh-TW' || saved === 'ja')) {
            setLanguageState(saved);
        }
        setIsLoaded(true);
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app-language', lang);
    };

    const t = dictionaries[language];
    const dateLocale = localeMap[language];

    // Prevent rendering until we know the language preference to avoid FOUC
    if (!isLoaded) {
        return <div className="min-h-screen bg-gray-50/50" />; // Or a loader
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dateLocale }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

