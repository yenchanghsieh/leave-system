'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDepartment } from '@/contexts/DepartmentContext';
import { Trash2, Plus, Building2 } from 'lucide-react';

interface DepartmentManagerModalProps {
    trigger?: React.ReactNode;
}

export function DepartmentManagerModal({ trigger }: DepartmentManagerModalProps) {
    const [open, setOpen] = useState(false);
    const { departments, addDepartment, deleteDepartment } = useDepartment();
    const [newDeptName, setNewDeptName] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDeptName.trim()) {
            addDepartment(newDeptName.trim());
            setNewDeptName('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Manage Departments</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Add New */}
                    <form onSubmit={handleAdd} className="flex gap-2">
                        <input
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-50 dark:focus:ring-slate-800"
                            placeholder="New Department Name"
                            value={newDeptName}
                            onChange={(e) => setNewDeptName(e.target.value)}
                        />
                        <Button type="submit" size="icon" disabled={!newDeptName.trim()}>
                            <Plus size={18} />
                        </Button>
                    </form>

                    {/* Check and display Departments */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Existing Departments</h4>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                            {departments.length === 0 ? (
                                <p className="text-sm text-slate-400 italic">No departments defined.</p>
                            ) : null}
                            {departments.map((dept) => (
                                <div key={dept.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <Building2 size={14} className="text-slate-400" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{dept.name}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        onClick={() => deleteDepartment(dept.id)}
                                    >
                                        <Trash2 size={12} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

