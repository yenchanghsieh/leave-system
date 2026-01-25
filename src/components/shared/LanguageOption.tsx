import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface LanguageOptionProps {
    label: string;
    active: boolean;
    onClick: () => void;
}

export function LanguageOption({ label, active, onClick }: LanguageOptionProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative flex items-center justify-center p-4 rounded-xl border-2 transition-all font-medium",
                active
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50"
            )}
        >
            {label}
            {active ? (
                <div className="absolute top-2 right-2 text-indigo-600">
                    <Check size={16} />
                </div>
            ) : null}
        </button>
    )
}

