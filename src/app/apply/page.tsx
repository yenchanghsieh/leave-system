'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useLeaveContext } from '@/contexts/LeaveContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LeaveApplicationForm } from '@/components/features/leave/LeaveApplicationForm';
import { useRouter } from 'next/navigation';

export default function ApplyPage() {
    const { t } = useLanguage();
    const { addRequest, balances, saveDraft } = useLeaveContext();
    const router = useRouter();

    const handleSaveDraft = (data: any) => {
        saveDraft(data);
    };

    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t.leave.apply}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t.leave.applyDescription}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                    <LeaveApplicationForm
                        balances={balances}
                        onSubmit={(data) => {
                            addRequest(data);
                            router.push('/history');
                        }}
                        onSaveDraft={(data) => {
                            saveDraft(data);
                            router.push('/history');
                        }}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
