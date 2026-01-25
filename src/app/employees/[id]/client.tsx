'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaveContext } from '@/contexts/LeaveContext';
import { LeaveBalanceCard } from '@/components/features/leave/LeaveBalanceCard';
import { LeaveHistoryTable } from '@/components/features/leave/LeaveHistoryTable';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Briefcase, Calendar, Shield, User, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { EmployeeFormModal } from '@/components/features/employees/EmployeeFormModal';
import { ConfirmDeleteModal } from '@/components/shared/ConfirmDeleteModal';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function EmployeeProfileClient() {
    const params = useParams();
    const router = useRouter();
    const { currentUser, users, deleteUser } = useAuth();
    const { allRequests, balances } = useLeaveContext();
    const { t } = useLanguage();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDelete = () => {
        if (!params.id) return;
        deleteUser(params.id as string);
        setIsDeleteModalOpen(false);
        router.push('/employees');
    };

    const targetUser = users.find(u => u.id === params.id);

    if (!targetUser) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center h-[50vh]">
                    <h2 className="text-xl font-semibold mb-2">{t.common.notFound}</h2>
                    <Button onClick={() => router.push('/employees')}>{t.common.back}</Button>
                </div>
            </AppLayout>
        );
    }

    if (currentUser.role !== 'admin' && currentUser.role !== 'root') {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center h-[50vh]">
                    <h2 className="text-xl font-semibold mb-2 text-red-500">{t.common.accessDenied}</h2>
                    <Button onClick={() => router.push('/')}>{t.common.goHome}</Button>
                </div>
            </AppLayout>
        );
    }

    const userHistory = allRequests.filter(req => req.userId === targetUser.id);

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-indigo-600" onClick={() => router.push('/employees')}>
                    <ArrowLeft size={16} /> {t.employees.directory}
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
                            {targetUser.role !== 'root' && (
                                <>
                                    <EmployeeFormModal
                                        initialData={targetUser}
                                        trigger={
                                            <Button variant="ghost" size="icon" className="ml-2 h-8 w-8 text-slate-400 hover:text-indigo-600">
                                                <Edit size={16} />
                                            </Button>
                                        }
                                    />
                                    {/* Prevent deleting self */}
                                    {targetUser.id !== currentUser.id && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            onClick={() => setIsDeleteModalOpen(true)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    )}
                                </>
                            )}
                            <ConfirmDeleteModal
                                open={isDeleteModalOpen}
                                onOpenChange={setIsDeleteModalOpen}
                                onConfirm={handleDelete}
                                title={t.common?.deleteEmployee || "Delete Employee"}
                                description={`Are you sure you want to delete ${targetUser.name}? This action cannot be undone.`}
                            />
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
                            {(() => {
                                const supervisor = users.find(u => u.id === targetUser.supervisorId);
                                return supervisor ? (
                                    <div
                                        className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline"
                                        onClick={() => router.push(`/employees/${supervisor.id}`)}
                                    >
                                        <User size={14} />
                                        {t.employees.reportsTo} {supervisor.name}
                                    </div>
                                ) : null;
                            })()}
                        </div>
                    </div>
                </div>

                {/* Hide leave balances for root user */}
                {targetUser.role !== 'root' && (
                    <section>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{t.employees.leaveBalances}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {balances.map((b) => (
                                <LeaveBalanceCard key={b.type} balance={b} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Hide leave history for root user */}
                {targetUser.role !== 'root' && (
                    <section>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{t.common.leaveHistory}</h2>
                        <LeaveHistoryTable history={userHistory} />
                    </section>
                )}
            </div>
        </AppLayout>
    );
}
