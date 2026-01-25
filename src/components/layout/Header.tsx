'use client';

import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateRequestModal } from '@/components/features/leave/CreateRequestModal';
import { UserSwitcher } from '@/components/layout/UserSwitcher';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface HeaderProps {
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;
}

export function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
    const { t } = useLanguage();

    return (
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b px-8 flex items-center justify-between sticky top-0 z-10 dark:border-slate-800">
            <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
                <Menu size={20} className="text-slate-600 dark:text-slate-300" />
            </Button>

            <div className="flex items-center gap-2">
                <CreateRequestModal />
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
                <UserSwitcher />
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
                <LanguageSelector />
                <ThemeToggle />
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
                <Button variant="ghost" className="text-slate-600 dark:text-slate-300 gap-2">
                    <LogOut size={16} />
                    <span>{t.common.logout}</span>
                </Button>
            </div>
        </header>
    );
}

