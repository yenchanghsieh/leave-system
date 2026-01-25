'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { User, Briefcase, ArrowRight, Users, Filter } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { motion } from 'framer-motion';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TeamPage() {
    const { currentUser, users } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();

    // Supervisor Check: Must have at least one report or be admin (though Admin uses /employees usually)
    // Actually, user requested "My Team". If no reports, show empty state or redirect.
    const myTeam = users.filter(u => u.supervisorId === currentUser.id);

    const [departmentFilter, setDepartmentFilter] = React.useState('all');
    const [employeeFilter, setEmployeeFilter] = React.useState('all');

    const availableDepartments = React.useMemo(() => {
        const depts = new Set(myTeam.map(u => u.department).filter(Boolean));
        return Array.from(depts) as string[];
    }, [myTeam]);

    const filteredTeam = React.useMemo(() => {
        return myTeam.filter(u => {
            const deptMatch = departmentFilter === 'all' || u.department === departmentFilter;
            const empMatch = employeeFilter === 'all' || u.id === employeeFilter;
            return deptMatch && empMatch;
        });
    }, [myTeam, departmentFilter, employeeFilter]);

    if (myTeam.length === 0) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center h-[50vh]">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <Users size={32} className="text-slate-400" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">{t.employees.noTeamMembers}</h2>
                    <p className="text-slate-500 mb-4">{t.employees.noReports}</p>
                    <Button onClick={() => router.push('/')}>{t.common.goHome}</Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t.common.myTeam}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t.employees.teamDescription}</p>
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-2 bg-white dark:bg-slate-900">
                                <Filter size={14} />
                                <span>{t.employees.department}: {departmentFilter === 'all' ? t.common.view + ' All' : departmentFilter}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[200px]">
                            <DropdownMenuRadioGroup value={departmentFilter} onValueChange={setDepartmentFilter}>
                                <DropdownMenuRadioItem value="all">All Departments</DropdownMenuRadioItem>
                                {availableDepartments.map(dept => (
                                    <DropdownMenuRadioItem key={dept} value={dept}>
                                        {dept}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-2 bg-white dark:bg-slate-900">
                                <User size={14} />
                                <span>{t.employees.employee}: {employeeFilter === 'all' ? t.common.view + ' All' : myTeam.find(u => u.id === employeeFilter)?.name || employeeFilter}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[200px]">
                            <DropdownMenuRadioGroup value={employeeFilter} onValueChange={setEmployeeFilter}>
                                <DropdownMenuRadioItem value="all">All Employees</DropdownMenuRadioItem>
                                {myTeam.map(user => (
                                    <DropdownMenuRadioItem key={user.id} value={user.id}>
                                        {user.name}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {(departmentFilter !== 'all' || employeeFilter !== 'all') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                            onClick={() => { setDepartmentFilter('all'); setEmployeeFilter('all'); }}
                        >
                            Reset
                        </Button>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                            <thead className="bg-slate-50/80 dark:bg-slate-800/80">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{t.employees.employee}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{t.employees.department}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{t.employees.email}</th>
                                    <th className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredTeam.length > 0 ? (
                                    filteredTeam.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                            onClick={() => router.push(`/team/${user.id}`)}
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
                                                {user.email || 'No email'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <Button variant="ghost" size="sm" className="h-8 gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                                                    {t.common.view}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                            No team members found in this department.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

