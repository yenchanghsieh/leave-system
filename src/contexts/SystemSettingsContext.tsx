'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LeaveYearMode } from '@/types';

interface SystemSettings {
    leaveYearMode: LeaveYearMode;
    approvalRequired: boolean;
}

interface SystemSettingsContextType {
    settings: SystemSettings;
    updateSettings: (newSettings: Partial<SystemSettings>) => void;
}

const defaultSettings: SystemSettings = {
    leaveYearMode: 'calendar',
    approvalRequired: true,
};

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

export function SystemSettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<SystemSettings>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('system-settings');
            if (saved) {
                try {
                    return { ...defaultSettings, ...JSON.parse(saved) };
                } catch (e) {
                    console.error('Failed to parse system settings', e);
                }
            }
        }
        return defaultSettings;
    });

    useEffect(() => {
        localStorage.setItem('system-settings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (newSettings: Partial<SystemSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <SystemSettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SystemSettingsContext.Provider>
    );
}

export function useSystemSettings() {
    const context = useContext(SystemSettingsContext);
    if (context === undefined) {
        throw new Error('useSystemSettings must be used within a SystemSettingsProvider');
    }
    return context;
}

