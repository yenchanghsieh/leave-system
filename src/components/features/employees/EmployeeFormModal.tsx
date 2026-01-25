'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useDepartment } from '@/contexts/DepartmentContext';
import { UserProfile, Role } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { X } from 'lucide-react';

interface EmployeeFormModalProps {
    initialData?: UserProfile;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
}

export function EmployeeFormModal({ initialData, trigger, open: controlledOpen, onOpenChange: setControlledOpen, onSuccess }: EmployeeFormModalProps) {
    const [open, setOpen] = useState(false);
    const { addUser, updateUser, users } = useAuth();
    const { t } = useLanguage();

    // Derived state for control
    const isOpen = controlledOpen !== undefined ? controlledOpen : open;
    const setIsOpen = setControlledOpen || setOpen;

    const isEditing = !!initialData;

    // Double check safeguard: Do not allow editing root user
    if (initialData?.role === 'root') {
        return null;
    }

    // Form State
    const [formData, setFormData] = useState<Partial<UserProfile>>({
        name: '',
        email: '',
        role: 'employee',
        department: '',
        supervisorId: '',
        onboardDate: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                onboardDate: initialData.onboardDate.split('T')[0]
            });
        } else {
            // Reset for create mode
            setFormData({
                name: '',
                email: '',
                role: 'employee',
                department: '',
                supervisorId: '',
                onboardDate: new Date().toISOString().split('T')[0],
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && initialData) {
            updateUser({
                ...initialData,
                ...formData as UserProfile,
                onboardDate: new Date(formData.onboardDate!).toISOString(),
            });
        } else {
            const newUser: UserProfile = {
                id: `u${Date.now()}`,
                name: formData.name!,
                email: formData.email!,
                role: formData.role as Role,
                department: formData.department,
                supervisorId: formData.supervisorId || undefined,
                onboardDate: new Date(formData.onboardDate!).toISOString(),
            };
            addUser(newUser);
        }

        setIsOpen(false);
        if (onSuccess) onSuccess();
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Profile' : 'Add Employee'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <input
                            required
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-50 dark:focus:ring-slate-800"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input
                            required
                            type="email"
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-50 dark:focus:ring-slate-800"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Role</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-50 dark:focus:ring-slate-800 dark:bg-slate-900"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                            >
                                <option value="employee" className="dark:bg-slate-900">Employee</option>
                                <option value="admin" className="dark:bg-slate-900">Admin</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Department</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-50 dark:focus:ring-slate-800 dark:bg-slate-900"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            >
                                <option value="" className="dark:bg-slate-900">Select Department</option>
                                {useDepartment().departments.map(d => (
                                    <option key={d.id} value={d.name} className="dark:bg-slate-900">{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Supervisor Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Supervisor</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-50 dark:focus:ring-slate-800 dark:bg-slate-900"
                            value={formData.supervisorId || ''}
                            onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
                        >
                            <option value="" className="dark:bg-slate-900">None (Top Level)</option>
                            {users.filter(u => u.id !== initialData?.id).map(u => (
                                <option key={u.id} value={u.id} className="dark:bg-slate-900">{u.name} ({u.role})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Onboarding Date</label>
                        <input
                            required
                            type="date"
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-50 dark:focus:ring-slate-800"
                            value={formData.onboardDate}
                            onChange={(e) => setFormData({ ...formData, onboardDate: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit">{isEditing ? 'Save Changes' : 'Add Employee'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

