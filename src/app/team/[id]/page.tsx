'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaveContext } from '@/contexts/LeaveContext';
import { LeaveBalanceCard } from '@/components/features/leave/LeaveBalanceCard';
import { LeaveHistoryTable } from '@/components/features/leave/LeaveHistoryTable';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Briefcase, Calendar, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function TeamMemberProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { currentUser, users } = useAuth();
    const { allRequests, balances } = useLeaveContext();
    const { t } = useLanguage();

    const targetUser = users.find(u => u.id === params.id);

    const canView = targetUser && (
        currentUser.role === 'admin' ||
        currentUser.role === 'root' ||
        targetUser.supervisorId === currentUser.id
    );

    if (!targetUser || !canView) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center h-[50vh]">
                    <h2 className="text-xl font-semibold mb-2 text-red-500">Access Denied or User Not Found</h2>
                    <Button onClick={() => router.push('/team')}>Back to Team</Button>
                </div>
            </AppLayout>
        );
    }

    const userHistory = allRequests.filter(req => req.userId === targetUser.id);

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-indigo-600" onClick={() => router.push('/team')}>
                    <ArrowLeft size={16} /> Back to My Team
                </Button>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-3xl">
                        {targetUser.name.charAt(0)}
                    </div>
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{targetUser.name}</h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize flex items-center gap-1.5">
                                {(targetUser.role === 'admin' || targetUser.role === 'root') && <Shield size={12} />}
                                {t.roles[targetUser.role as keyof typeof t.roles] || targetUser.role}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mt-2">
                            <div className="flex items-center gap-1.5">
                                <Mail size={14} />
                                {targetUser.email || 'No email'}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Briefcase size={14} />
                                {targetUser.department || 'No Dept'}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                Joined {format(new Date(targetUser.onboardDate), 'MMM yyyy')}
                            </div>
                        </div>
                    </div>
                </div>

                <section>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Leave Balances</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {balances.map((b) => (
                            <LeaveBalanceCard key={b.type} balance={b} />
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Leave History</h2>
                    <LeaveHistoryTable history={userHistory} />
                </section>
            </div>
        </AppLayout>
    );
}
