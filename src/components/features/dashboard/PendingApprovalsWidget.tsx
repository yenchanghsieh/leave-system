'use client';

import React from 'react';
import { useLeaveContext } from '@/contexts/LeaveContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { format } from 'date-fns';
import { Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export function PendingApprovalsWidget() {
    const { history, approveRequest, rejectRequest } = useLeaveContext();
    const { currentUser, users } = useAuth();
    const { t } = useLanguage();

    // ... (rest of filtering) ...



    // Find requests that are pending AND where the current user is the "approver"
    // Since our LeaveContext.history is already filtered to show "requests form reports" for managers,
    // we just need to filter for 'pending' status.
    // However, if I am a manager, I also see my own requests. I shouldn't approve my own requests.
    // So filter: pending AND userId !== currentUserId

    // Wait, if I'm admin, maybe I can approve everything?
    // Let's stick to the rule: I can approve if I am NOT the requester (and I have access to view it, which context ensures).

    const pendingRequests = history.filter(req =>
        req.status === 'pending' && req.userId !== currentUser.id
    );

    if (pendingRequests.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-6 shadow-sm"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-500 rounded-full">
                    <Clock size={20} />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Pending Approvals</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">You have {pendingRequests.length} request{pendingRequests.length > 1 ? 's' : ''} waiting for review.</p>
                </div>
            </div>

            <div className="space-y-3">
                <AnimatePresence>
                    {pendingRequests.map(req => (
                        <motion.div
                            key={req.id}
                            layout
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                                        Request from User {req.userId}
                                        {/* Ideally we map userId to Name here, but we need User list. 
                                            Let's rely on Mock Data or Context if available in future cleanup. 
                                            For now, just ID or let context provide it populated. */}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium capitalize">
                                        {req.type}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {format(new Date(req.startDate), 'MMM d, HH:mm')} - {format(new Date(req.endDate), 'MMM d, HH:mm')}
                                    <span className="mx-1">|</span>
                                    {req.totalQuantity} {req.unit}
                                </div>
                                {req.reason ? (
                                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{req.reason}"</p>
                                ) : null}
                                {req.substituteId ? (
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                        <span className="font-medium">Substitute:</span>
                                        <span>
                                            {users.find(u => u.id === req.substituteId)?.name || req.substituteId}
                                        </span>
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex items-center gap-2 self-end md:self-auto">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-slate-200 dark:border-slate-800"
                                    onClick={() => rejectRequest(req.id)}
                                >
                                    <X size={14} /> Reject
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
                                    onClick={() => approveRequest(req.id)}
                                >
                                    <Check size={14} /> Approve
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

