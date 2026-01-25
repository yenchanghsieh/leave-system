'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { EmployeeFormModal } from '@/components/features/employees/EmployeeFormModal';
import { DepartmentManagerModal } from '@/components/features/employees/DepartmentManagerModal';
import { ConfirmDeleteModal } from '@/components/shared/ConfirmDeleteModal';
import { useState } from 'react';
import { UserProfile } from '@/types';
import { EmployeesTable } from '@/components/features/employees/EmployeesTable';

export default function EmployeesPage() {
    const { currentUser, users, deleteUser } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();
    const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

    const handleDelete = () => {
        if (!userToDelete) return;
        deleteUser(userToDelete.id);
        setUserToDelete(null);
    };

    if (currentUser.role !== 'admin' && currentUser.role !== 'root') {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center h-[50vh]">
                    <h2 className="text-xl font-semibold mb-2 text-red-500">{t.common.accessDenied}</h2>
                    <p className="text-slate-500 mb-4">{t.common.manageProfile} (No permission)</p>
                    <Button onClick={() => router.push('/')}>{t.common.goHome}</Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t.employees.directory}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{t.employees.manageDescription}</p>
                    </div>
                    <div className="flex gap-2">
                        <DepartmentManagerModal
                            trigger={
                                <Button variant="outline" className="gap-2">
                                    <Briefcase size={16} /> Departments
                                </Button>
                            }
                        />
                        <EmployeeFormModal
                            trigger={
                                <Button className="gap-2">
                                    <Plus size={16} /> Add Employee
                                </Button>
                            }
                        />
                    </div>
                </div>

                <EmployeesTable
                    users={users}
                    currentUser={currentUser}
                    t={t}
                    onDeleteClick={setUserToDelete}
                />

                <ConfirmDeleteModal
                    open={!!userToDelete}
                    onOpenChange={(open) => !open && setUserToDelete(null)}
                    onConfirm={handleDelete}
                    title={t.common?.deleteEmployee || "Delete Employee"}
                    description={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
                />
            </div>
        </AppLayout>
    );
}

