import React from 'react';
import { LeaveBalance } from '@/types';
import { cn } from '@/lib/utils';
import { LEAVE_CONFIG } from '@/lib/leave-logic';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface LeaveBalanceCardProps {
    balance: LeaveBalance;
    className?: string;
}

export function LeaveBalanceCard({ balance, className }: LeaveBalanceCardProps) {
    const { t } = useLanguage();
    const config = LEAVE_CONFIG[balance.type];
    const percent = Math.min(100, (balance.used / balance.entitlement) * 100);
    const remaining = balance.entitlement - balance.used;

    // Map leave type to translation key
    const nameMap: Record<string, string> = {
        'annual': t.leave.annual,
        'sick': t.leave.sick,
        'personal': t.leave.personal,
        'family-care': t.leave['family-care'],
        'parental': t.leave.parental,
        'menstrual': t.leave.menstrual,
    };

    const displayName = nameMap[balance.type] || config.name.split('(')[0];

    // Determine color theme based on leave type
    const getTheme = () => {
        switch (balance.type) {
            case 'annual': return 'text-indigo-600 bg-indigo-50 from-indigo-500 to-purple-500';
            case 'sick': return 'text-rose-600 bg-rose-50 from-rose-500 to-orange-500';
            case 'personal': return 'text-slate-600 bg-slate-50 from-slate-500 to-gray-500';
            case 'family-care': return 'text-emerald-600 bg-emerald-50 from-emerald-500 to-teal-500';
            case 'parental': return 'text-amber-600 bg-amber-50 from-amber-500 to-yellow-500';
            case 'menstrual': return 'text-pink-600 bg-pink-50 from-pink-500 to-rose-500';
            default: return 'text-blue-600 bg-blue-50 from-blue-500 to-cyan-500';
        }
    }

    const theme = getTheme(); // Simplified string mapping for now

    // Quick hack to get specific gradient classes
    const gradientClass = theme.split(' ').slice(2).join(' ');
    const bgClass = theme.split(' ')[1];
    const textClass = theme.split(' ')[0];

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className={cn(
                "relative overflow-hidden rounded-xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-4 sm:p-6 shadow-sm transition-all hover:shadow-md min-w-0",
                className
            )}
        >
            <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-700 dark:text-slate-200 text-xs sm:text-sm uppercase tracking-wide opacity-80 truncate">{displayName}</h3>
                </div>
                <span className={cn("px-2 py-1 rounded text-xs font-bold uppercase shrink-0", bgClass, textClass)}>
                    {balance.unit === 'hours' ? t.leave.hours : t.leave.days}
                </span>
            </div>

            <div className="mb-3 sm:mb-4">
                <span className={cn("text-3xl sm:text-4xl font-bold tracking-tight tabular-nums", textClass)}>{remaining}</span>
                <span className="text-xs sm:text-sm text-gray-400 font-medium ml-2">{t.leave.left}</span>
            </div>

            {/* Modern Progress Bar */}
            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn("h-full rounded-full bg-gradient-to-r", gradientClass)}
                />
            </div>

            <div className="flex justify-between text-xs text-gray-400 font-medium tabular-nums">
                <span>{t.leave.used}: {balance.used}</span>
                <span>{t.leave.total}: {balance.entitlement}</span>
            </div>
        </motion.div>
    );
}

