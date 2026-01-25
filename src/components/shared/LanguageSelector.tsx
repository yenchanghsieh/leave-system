'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LanguageSelector() {
    const { language, setLanguage, t } = useLanguage();

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'zh-TW', label: '繁體中文' },
        { code: 'ja', label: '日本語' },
    ] as const;

    const currentLabel = languages.find(l => l.code === language)?.label || 'English';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-slate-500 dark:text-slate-400">
                    <Globe size={16} />
                    <span>{currentLabel}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        className={cn(
                            "cursor-pointer",
                            language === lang.code && "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                        )}
                        onClick={() => setLanguage(lang.code)}
                    >
                        {lang.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
