'use client';

import React from 'react';
import { UserProfile } from '@/types';
import { Dictionary } from '@/lib/i18n/types';
import { EmployeeRow } from './EmployeeRow';

interface EmployeesTableProps {
    users: UserProfile[];
    currentUser: UserProfile;
    t: Dictionary;
    onDeleteClick: (user: UserProfile) => void;
}

export function EmployeesTable({ users, currentUser, t, onDeleteClick }: EmployeesTableProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                    <thead className="bg-slate-50/80 dark:bg-slate-800/80">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{t.employees.employee}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{t.employees.role}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{t.employees.department}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{t.employees.supervisor}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{t.employees.joined}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{t.employees.email}</th>
                            <th className="relative px-6 py-4"><span className="sr-only">{t.employees.actions}</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {users.map((user) => (
                            <EmployeeRow
                                key={user.id}
                                user={user}
                                currentUser={currentUser}
                                users={users}
                                t={t}
                                onDeleteClick={onDeleteClick}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

