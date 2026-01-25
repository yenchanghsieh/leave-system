'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { LeaveHistoryTable } from '@/components/features/leave/LeaveHistoryTable';
import { useLeaveContext } from '@/contexts/LeaveContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function HistoryPage() {
    const { t } = useLanguage();
    const { history } = useLeaveContext();
    const { currentUser } = useAuth();

    // Filter to show only *MY* requests, not requests I supervise
    const myHistory = history.filter(req => req.userId === currentUser.id);

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t.common.history}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t.common.historyDescription}</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <LeaveHistoryTable history={myHistory} />
                </motion.div>
            </div>
        </AppLayout>
    );
}

