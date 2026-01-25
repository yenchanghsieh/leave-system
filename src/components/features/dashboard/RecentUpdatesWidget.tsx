'use client';

import React, { useState } from 'react';
import { useLeaveContext } from '@/contexts/LeaveContext';
import { useAuth } from '@/contexts/AuthContext';
import { format, isSameDay } from 'date-fns';
import { CheckCircle2, XCircle, Bell, ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';



export function RecentUpdatesWidget() {
    const { history } = useLeaveContext();
    const { currentUser } = useAuth();
    const { t, dateLocale } = useLanguage();
    const router = useRouter();
    const [isHidden, setIsHidden] = useState(false);

    const handleDismiss = () => {
        setIsHidden(true);
    };

    // 1. Get my completed requests (Approved or Rejected)
    const myUpdates = history.filter(req =>
        req.userId === currentUser.id && req.status !== 'pending'
    );

    const recentUpdates = myUpdates.slice(0, 3);

    // Don't render if hidden or no updates
    if (isHidden || recentUpdates.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm relative"
            >
                {/* Dismiss Button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Dismiss"
                >
                    <X size={16} />
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full">
                        <Bell size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t.widgets.recentUpdates}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t.widgets.recentUpdatesDesc}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {recentUpdates.map(req => (
                        <div
                            key={req.id}
                            className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                            onClick={() => router.push(`/applications/${req.id}`)}
                        >
                            <div className={cn("mt-1", req.status === 'approved' ? "text-emerald-500" : "text-red-500")}>
                                {req.status === 'approved' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {t.widgets.updateTemplate
                                        .replace('{type}', t.leave[req.type as keyof typeof t.leave] || req.type)
                                        .replace('{status}', t.leave[req.status as keyof typeof t.leave] || req.status)}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5" suppressHydrationWarning>
                                    {isSameDay(new Date(req.startDate), new Date(req.endDate))
                                        ? `${format(new Date(req.startDate), 'MMM d, HH:mm', { locale: dateLocale })} - ${format(new Date(req.endDate), 'HH:mm', { locale: dateLocale })}`
                                        : `${format(new Date(req.startDate), 'MMM d, HH:mm', { locale: dateLocale })} - ${format(new Date(req.endDate), 'MMM d, HH:mm', { locale: dateLocale })}`
                                    }
                                </p>
                            </div>
                            <ArrowRight size={14} className="text-slate-300 mt-1.5" />
                        </div>
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

