'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaveContext } from '@/contexts/LeaveContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { format } from 'date-fns';
import { ArrowLeft, Clock, CheckCircle2, XCircle, Calendar, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LEAVE_CONFIG } from '@/lib/leave-logic';
import { EditDraftModal } from '@/components/features/leave/EditDraftModal';

export default function ApplicationDetailsClient() {
    const params = useParams();
    const router = useRouter();
    const { allRequests, approveRequest, rejectRequest, deleteRequest, addRequest } = useLeaveContext();
    const { currentUser, users } = useAuth();
    const { t, dateLocale } = useLanguage();

    const request = allRequests.find(r => r.id === params.id);

    if (!request) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center h-[50vh]">
                    <h2 className="text-xl font-semibold mb-2">{t.details.requestNotFound}</h2>
                    <Button onClick={() => router.push('/history')}>{t.details.backToHistory}</Button>
                </div>
            </AppLayout>
        );
    }

    const requester = users.find(u => u.id === request.userId);
    const supervisor = users.find(u => u.id === requester?.supervisorId);

    const isSupervisor = currentUser.id === requester?.supervisorId;
    const isOwner = currentUser.id === request.userId;

    if (!isOwner && !isSupervisor) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center h-[50vh]">
                    <h2 className="text-xl font-semibold mb-2 text-red-500">{t.common.accessDenied}</h2>
                    <Button onClick={() => router.push('/')}>{t.common.goHome}</Button>
                </div>
            </AppLayout>
        );
    }

    const statusConfig = {
        draft: { color: 'text-slate-600 bg-slate-50 border-slate-200', icon: Clock, label: t.leave.draft },
        pending: { color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock, label: t.leave.pending },
        approved: { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2, label: t.leave.approved },
        rejected: { color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle, label: t.leave.rejected },
    };

    const StatusIcon = statusConfig[request.status].icon;

    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-indigo-600" onClick={() => router.back()}>
                    <ArrowLeft size={16} /> {t.common.back}
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                        {t.leave.type}: {t.leave[request.type as keyof typeof t.leave] || request.type}
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                        {t.details.requestId}: #{request.id.slice(0, 8)}
                                    </p>
                                </div>
                                <div className={cn("px-3 py-1 flex items-center gap-2 rounded-full border text-sm font-medium", statusConfig[request.status].color)}>
                                    <StatusIcon size={14} />
                                    {statusConfig[request.status].label}
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t.leave.from}</label>
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-medium">
                                            <Calendar size={16} className="text-slate-400" />
                                            {format(new Date(request.startDate), 'PPP p', { locale: dateLocale })}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t.leave.to}</label>
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-medium">
                                            <Calendar size={16} className="text-slate-400" />
                                            {format(new Date(request.endDate), 'PPP p', { locale: dateLocale })}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t.leave.quantity}</label>
                                        <div className="text-slate-900 dark:text-slate-100 font-medium">
                                            {request.totalQuantity} {request.unit === 'hours'
                                                ? (request.totalQuantity === 1 ? t.leave.hour : t.leave.hours)
                                                : (request.totalQuantity === 1 ? t.leave.day : t.leave.days)
                                            }
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t.details.requester}</label>
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-medium">
                                            <User size={16} className="text-slate-400" />
                                            {requester?.name || 'Unknown'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t.details.supervisor}</label>
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-medium">
                                            <User size={16} className="text-slate-400" />
                                            {supervisor?.name || 'None'}
                                        </div>
                                    </div>
                                    {request.substituteId && (
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t.leave.substitute}</label>
                                            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-medium">
                                                <User size={16} className="text-slate-400" />
                                                {users.find(u => u.id === request.substituteId)?.name || request.substituteId}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t.leave.reason}</label>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg text-slate-700 dark:text-slate-300 text-sm border border-slate-100 dark:border-slate-800 leading-relaxed">
                                        {request.reason || t.details.noReason}
                                    </div>
                                </div>
                            </div>

                            {isSupervisor && request.status === 'pending' && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        className="text-red-600 border-slate-200 hover:bg-red-50"
                                        onClick={() => rejectRequest(request.id)}
                                    >
                                        {t.details.rejectRequest}
                                    </Button>
                                    <Button
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                        onClick={() => approveRequest(request.id)}
                                    >
                                        {t.details.approveRequest}
                                    </Button>
                                </div>
                            )}

                            {/* Owner actions for draft requests */}
                            {isOwner && request.status === 'draft' && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        className="text-red-600 border-slate-200 hover:bg-red-50 dark:text-red-400 dark:border-slate-700 dark:hover:bg-red-900/20"
                                        onClick={() => {
                                            deleteRequest(request.id);
                                            router.push('/history');
                                        }}
                                    >
                                        {t.leave.deleteDraft}
                                    </Button>
                                    <EditDraftModal draft={request} />
                                    <Button
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                        onClick={() => {
                                            // Submit the draft - add as new request with pending/approved status
                                            addRequest({ ...request });
                                            deleteRequest(request.id);
                                            router.push('/history');
                                        }}
                                    >
                                        {t.leave.submit}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">{t.details.timeline}</h3>
                            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">

                                {request.status === 'draft' ? (
                                    // Draft: show only "Draft Created" step
                                    <div className="relative pl-8">
                                        <div className="absolute left-0 top-0.5 w-4.5 h-4.5 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-400 z-10"></div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{t.leave.draft}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            {t.details.by} {requester?.name} • {t.leave.draft}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative pl-8">
                                            <div className="absolute left-0 top-0.5 w-4.5 h-4.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-600 z-10"></div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{t.details.submitted}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                {t.details.by} {requester?.name}
                                            </p>
                                        </div>

                                        <div className="relative pl-8">
                                            <div className={cn("absolute left-0 top-0.5 w-4.5 h-4.5 rounded-full border-2 z-10",
                                                request.status === 'pending' ? "bg-amber-100 dark:bg-amber-900/30 border-amber-500 animate-pulse" :
                                                    "bg-indigo-100 dark:bg-indigo-900/30 border-indigo-600"
                                            )}></div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{t.details.supervisorReview}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                {t.details.by} {supervisor?.name || t.details.supervisor} • {statusConfig[request.status].label}
                                            </p>
                                        </div>

                                        {(request.status === 'approved' || request.status === 'rejected') && (
                                            <div className="relative pl-8">
                                                <div className={cn("absolute left-0 top-0.5 w-4.5 h-4.5 rounded-full border-2 z-10",
                                                    request.status === 'approved' ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500" : "bg-red-100 dark:bg-red-900/30 border-red-500"
                                                )}></div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                    {request.status === 'approved' ? t.leave.approved : t.leave.rejected}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {t.details.decisionMade}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
