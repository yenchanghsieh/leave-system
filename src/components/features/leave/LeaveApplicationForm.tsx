'use client';

import React, { useState, useEffect } from 'react';
import { LeaveType, LeaveUnit, LeaveBalance, LeaveRequest } from '@/types';
import { LEAVE_CONFIG, validateLeaveRequest, calculateDuration } from '@/lib/leave-logic';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Check, Calendar, Clock, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface LeaveApplicationFormProps {
    balances: LeaveBalance[];
    onSubmit: (data: any) => void;
    onSaveDraft?: (data: any) => void;
    onSuccess?: () => void;
    initialData?: LeaveRequest; // For editing existing drafts
}

export function LeaveApplicationForm({ balances, onSubmit, onSaveDraft, onSuccess, initialData }: LeaveApplicationFormProps) {
    const { t } = useLanguage();
    const { currentUser, users } = useAuth();
    const [open, setOpen] = useState(false);

    // Initialize with either existing data or defaults
    const [type, setType] = useState<LeaveType>(initialData?.type || 'annual');
    const [startDate, setStartDate] = useState(() => {
        if (initialData?.startDate) {
            return new Date(initialData.startDate).toISOString().split('T')[0];
        }
        return '';
    });
    const [startTime, setStartTime] = useState(() => {
        if (initialData?.startDate) {
            const date = new Date(initialData.startDate);
            return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        }
        return '08:30';
    });
    const [endDate, setEndDate] = useState(() => {
        if (initialData?.endDate) {
            return new Date(initialData.endDate).toISOString().split('T')[0];
        }
        return '';
    });
    const [endTime, setEndTime] = useState(() => {
        if (initialData?.endDate) {
            const date = new Date(initialData.endDate);
            return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        }
        return '17:30';
    });
    const [quantity, setQuantity] = useState(initialData?.totalQuantity || 1);
    const [unit, setUnit] = useState<LeaveUnit>(initialData?.unit || 'hours');
    const [reason, setReason] = useState(initialData?.reason || '');
    const [substituteId, setSubstituteId] = useState(initialData?.substituteId || currentUser.supervisorId || '');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Filter out current user from substitute options
    // Also remove 'root' user
    const substituteOptions = users.filter(u => u.id !== currentUser.id && u.id !== 'root');

    // Auto-calculate duration
    useEffect(() => {
        if (startDate && startTime && endDate && endTime) {
            const start = new Date(`${startDate}T${startTime}`);
            const end = new Date(`${endDate}T${endTime}`);

            if (start < end) {
                const duration = calculateDuration(start, end, unit);
                setQuantity(duration);
            }
        }
    }, [startDate, startTime, endDate, endTime, unit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        const start = new Date(`${startDate}T${startTime}`);
        const end = new Date(`${endDate}T${endTime}`);

        if (start >= end) {
            setError(t.messages.endTimeAfterStart);
            return;
        }

        const request = {
            id: crypto.randomUUID(),
            userId: currentUser.id,
            type,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            totalQuantity: Number(quantity),
            unit,
            reason,
            substituteId: substituteId || undefined,
            status: 'pending' as const,
        };

        const validation = validateLeaveRequest(request, balances);
        if (!validation.valid) {
            setError(validation.error || t.messages.validationError);
            return;
        }

        onSubmit(request);
        if (onSuccess) {
            // Immediate close for smoother modal UX, or short delay
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 500); // Shorter delay
        } else {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }
    };

    const handleTypeChange = (t: LeaveType) => {
        setType(t);
        // All types now use hours base
        setUnit('hours');
    };

    const activeNameMap: Record<string, string> = {
        'annual': t.leave.annual,
        'sick': t.leave.sick,
        'personal': t.leave.personal,
        'family-care': t.leave['family-care'],
        'parental': t.leave.parental,
        'menstrual': t.leave.menstrual,
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
        >


            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <AnimatePresence>
                    {error ? (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2 border border-red-100"
                        >
                            <AlertCircle size={16} />
                            {error}
                        </motion.div>
                    ) : null}
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2 border border-green-100"
                        >
                            <Check size={16} />
                            {t.messages.success}
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.leave.type}</label>
                    <div className="relative">
                        <select
                            value={type}
                            onChange={(e) => handleTypeChange(e.target.value as LeaveType)}
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-sm transition-shadow appearance-none border text-slate-900 dark:text-slate-100"
                        >
                            {Object.entries(LEAVE_CONFIG).map(([key, config]) => (
                                <option key={key} value={key} className="dark:bg-slate-800">{activeNameMap[key] || config.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-2.5 pointer-events-none text-slate-400">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1">
                            <Calendar size={14} className="text-slate-400" /> {t.leave.from}
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full sm:flex-1 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border text-slate-900 dark:text-slate-100" />
                            <select value={startTime} onChange={e => setStartTime(e.target.value)} required className="w-full sm:w-28 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border text-slate-900 dark:text-slate-100">
                                {['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1">
                            <Calendar size={14} className="text-slate-400" /> {t.leave.to}
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full sm:flex-1 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border text-slate-900 dark:text-slate-100" />
                            <select value={endTime} onChange={e => setEndTime(e.target.value)} required className="w-full sm:w-28 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border text-slate-900 dark:text-slate-100">
                                {['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end -mt-1 mb-2">
                    <span className={cn("text-xs font-medium transition-colors",
                        (balances.find(b => b.type === type)?.entitlement || 0) - (balances.find(b => b.type === type)?.used || 0) - quantity < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-slate-400 dark:text-slate-500"
                    )}>
                        Remaining: {((balances.find(b => b.type === type)?.entitlement || 0) - (balances.find(b => b.type === type)?.used || 0) - quantity).toFixed(1)} {unit}
                    </span>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.leave.substitute}</label>
                    <div className="relative">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-normal hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    {substituteId
                                        ? substituteOptions.find((user) => user.id === substituteId)?.name
                                        : t.leave.selectSubstitute}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search substitute..." />
                                    <CommandList>
                                        <CommandEmpty>No user found.</CommandEmpty>
                                        <CommandGroup>
                                            {substituteOptions.map((user) => (
                                                <CommandItem
                                                    key={user.id}
                                                    value={user.name}
                                                    onSelect={() => {
                                                        setSubstituteId(user.id === substituteId ? "" : user.id)
                                                        setOpen(false)
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            substituteId === user.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {user.name} ({user.department || 'No Dept'})
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.leave.reason}</label>
                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border min-h-[80px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                        placeholder="..."
                    />
                </div>

                <div className="flex gap-3">
                    {onSaveDraft && (
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                                const start = new Date(`${startDate}T${startTime}`);
                                const end = new Date(`${endDate}T${endTime}`);

                                // Validate end date is after start date
                                if (start >= end) {
                                    setError(t.messages.endTimeAfterStart);
                                    return;
                                }

                                const request = {
                                    id: initialData?.id || crypto.randomUUID(),
                                    userId: currentUser.id,
                                    type,
                                    startDate: start.toISOString(),
                                    endDate: end.toISOString(),
                                    totalQuantity: Number(quantity),
                                    unit,
                                    reason,
                                    substituteId: substituteId || undefined,
                                    status: 'draft' as const,
                                };
                                onSaveDraft(request);
                                if (onSuccess) {
                                    setTimeout(() => onSuccess(), 500);
                                }
                            }}
                        >
                            {t.leave.saveDraft}
                        </Button>
                    )}
                    <Button
                        type="submit"
                        className={`bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed ${onSaveDraft ? 'flex-1' : 'w-full'}`}
                        disabled={
                            ((balances.find(b => b.type === type)?.entitlement || 0) - (balances.find(b => b.type === type)?.used || 0) - quantity < 0) ||
                            !substituteId ||
                            !reason ||
                            !startDate ||
                            !endDate ||
                            Boolean(startDate && endDate && startTime && endTime && new Date(`${startDate}T${startTime}`) >= new Date(`${endDate}T${endTime}`))
                        }
                    >
                        {t.leave.submit}
                    </Button>
                </div>
            </form>
        </motion.div>
    );
}

