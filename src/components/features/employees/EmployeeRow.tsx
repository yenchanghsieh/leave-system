'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { User, Shield, Briefcase, Trash2 } from 'lucide-react';
import { UserProfile } from '@/types';
import { Dictionary } from '@/lib/i18n/types';

interface EmployeeRowProps {
    user: UserProfile;
    currentUser: UserProfile;
    users: UserProfile[]; // Needed for supervisor lookup
    t: Dictionary;
    onDeleteClick: (user: UserProfile) => void;
}

export function EmployeeRow({ user, currentUser, users, t, onDeleteClick }: EmployeeRowProps) {
    const router = useRouter();

    const supervisor = users.find(u => u.id === user.supervisorId);

    return (
        <tr
            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            onClick={() => router.push(`/employees/${user.id}`)}
        >
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <User size={16} className="text-slate-500 dark:text-slate-400" />
                    </div>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{user.name}</span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                    {(user.role === 'admin' || user.role === 'root') && <Shield size={10} />}
                    {t.roles[user.role as keyof typeof t.roles] || user.role}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {user.department ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <Briefcase size={10} />
                        {user.department}
                    </span>
                ) : (
                    <span className="text-slate-400 text-sm">-</span>
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {supervisor ? (
                    <div
                        className="flex items-center gap-2 hover:text-indigo-600 cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/employees/${supervisor.id}`);
                        }}
                    >
                        <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-[10px] text-indigo-600 font-bold">
                            {supervisor.name.charAt(0)}
                        </div>
                        <span>{supervisor.name}</span>
                    </div>
                ) : <span className="text-slate-300">-</span>}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {new Date(user.onboardDate).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {user.email || 'No email'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                        {t.common.view}
                    </Button>

                    {(user.role !== 'root' && user.id !== currentUser.id) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClick(user);
                            }}
                        >
                            <Trash2 size={16} />
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    );
}

