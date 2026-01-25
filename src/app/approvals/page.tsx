'use client';

import React from 'react';
import { useLeaveContext } from '@/contexts/LeaveContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { format } from 'date-fns';
import { Check, X, Clock, User, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function ApprovalsPage() {
    const { history, approveRequest, rejectRequest } = useLeaveContext();
    const { currentUser, users } = useAuth();
    const { t, dateLocale } = useLanguage();
    const router = useRouter();

    // Supervisor Check Logic
    const pendingRequests = history.filter(req => {
        if (req.status !== 'pending') return false;
        const requester = users.find(u => u.id === req.userId);
        return requester?.supervisorId === currentUser.id;
    });

    if (pendingRequests.length === 0) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t.approvalsPage.title}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{t.approvalsPage.description}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
                            <Check size={24} className="opacity-50 text-emerald-500" />
                        </div>
                        <p>{t.approvalsPage.allCaughtUp} {t.approvalsPage.noPending}</p>
                        <Button variant="link" onClick={() => router.push('/')}>{t.approvalsPage.backToDashboard}</Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t.approvalsPage.title}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t.approvalsPage.reviewRequests.replace('{count}', String(pendingRequests.length))}</p>
                </div>

                <div className="grid gap-4">
                    <AnimatePresence>
                        {pendingRequests.map((req, i) => {
                            const requester = users.find(u => u.id === req.userId);
                            return (
                                <motion.div
                                    key={req.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                                >
                                    <div className="p-6 flex flex-col md:flex-row gap-6">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                                        {requester?.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{requester?.name}</h3>
                                                        <p className="text-xs text-slate-500 capitalize">{requester?.role || 'Employee'}</p>
                                                    </div>
                                                </div>
                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1.5">
                                                    <Clock size={12} /> {t.approvalsPage.pendingReview}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-slate-500 uppercase">{t.leave.type}</label>
                                                    <div className="font-medium text-slate-900 dark:text-slate-100 capitalize">{t.leave[req.type as keyof typeof t.leave] || req.type}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-slate-500 uppercase">{t.approvalsPage.duration}</label>
                                                    <div className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                                        <Calendar size={14} className="text-slate-400" />
                                                        {req.totalQuantity} {req.unit}
                                                    </div>
                                                </div>
                                                <div className="space-y-1 col-span-2 lg:col-span-1">
                                                    <label className="text-xs font-medium text-slate-500 uppercase">{t.approvalsPage.dates}</label>
                                                    <div className="text-sm text-slate-700 dark:text-slate-300">
                                                        {format(new Date(req.startDate), 'MMM d', { locale: dateLocale })} - {format(new Date(req.endDate), 'MMM d, yyyy', { locale: dateLocale })}
                                                    </div>
                                                </div>
                                            </div>

                                            {req.reason && (
                                                <div className="flex gap-2 text-sm text-slate-600 dark:text-slate-400 italic bg-gray-50/50 dark:bg-slate-800/30 p-3 rounded border border-gray-100 dark:border-slate-800">
                                                    <FileText size={16} className="shrink-0 mt-0.5" />
                                                    "{req.reason}"
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-row md:flex-col justify-end gap-3 min-w-[140px] border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                                            <Button
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                                                onClick={() => approveRequest(req.id)}
                                            >
                                                <Check size={16} /> {t.approvalsPage.approve}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-slate-200 gap-2"
                                                onClick={() => rejectRequest(req.id)}
                                            >
                                                <X size={16} /> {t.approvalsPage.reject}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="w-full text-slate-500"
                                                onClick={() => router.push(`/applications/${req.id}`)}
                                            >
                                                {t.approvalsPage.viewDetails}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </AppLayout>
    );
}

