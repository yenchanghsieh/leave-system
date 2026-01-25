import React from 'react';
import { LeaveRequest } from '@/types';
import { format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { LEAVE_CONFIG } from '@/lib/leave-logic';
import { Clock, CheckCircle2, XCircle, ArrowRight, Filter } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LeaveHistoryTableProps {
    history: LeaveRequest[];
    className?: string;
}

export function LeaveHistoryTable({ history, className }: LeaveHistoryTableProps) {
    const { t, dateLocale } = useLanguage();
    const { users } = useAuth();

    const [statusFilter, setStatusFilter] = React.useState('all');
    const [typeFilter, setTypeFilter] = React.useState('all');

    const filteredHistory = React.useMemo(() => {
        return history.filter(req => {
            const statusMatch = statusFilter === 'all' || req.status === statusFilter;
            const typeMatch = typeFilter === 'all' || req.type === typeFilter;
            return statusMatch && typeMatch;
        });
    }, [history, statusFilter, typeFilter]);

    // Get unique types from history or just use all available types
    const availableTypes = Object.keys(LEAVE_CONFIG);

    if (!history || history.length === 0) {
        return (
            <div className={cn("flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800", className)}>
                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
                    <Clock size={24} className="opacity-50" />
                </div>
                <p>{t.messages.noHistory}</p>
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex flex-wrap items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-2 bg-white dark:bg-slate-900">
                            <Filter size={14} />
                            <span>{t.leave.status}: {statusFilter === 'all' ? t.common.view + ' All' : t.leave[statusFilter as keyof typeof t.leave] || statusFilter}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[180px]">
                        <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                            <DropdownMenuRadioItem value="all">All Statuses</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="pending">{t.leave.pending}</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="approved">{t.leave.approved}</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="rejected">{t.leave.rejected}</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="draft">{t.leave.draft}</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-2 bg-white dark:bg-slate-900">
                            <Filter size={14} />
                            <span>{t.leave.type}: {typeFilter === 'all' ? t.common.view + ' All' : t.leave[typeFilter as keyof typeof t.leave] || typeFilter}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[180px]">
                        <DropdownMenuRadioGroup value={typeFilter} onValueChange={setTypeFilter}>
                            <DropdownMenuRadioItem value="all">All Types</DropdownMenuRadioItem>
                            {availableTypes.map(type => (
                                <DropdownMenuRadioItem key={type} value={type}>
                                    {t.leave[type as keyof typeof t.leave] || type}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                {(statusFilter !== 'all' || typeFilter !== 'all') && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                        onClick={() => { setStatusFilter('all'); setTypeFilter('all'); }}
                    >
                        Reset Filters
                    </Button>
                )}
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                    <thead className="bg-slate-50/80 dark:bg-slate-800/80">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{t.leave.type} / {t.leave.reason}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[140px]">{t.leave.from} & {t.leave.to}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{t.leave.quantity}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{t.leave.status}</th>
                            <th className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredHistory.length > 0 ? (
                            filteredHistory.map((req) => (
                                <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 min-w-[160px]">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                                {t.leave[req.type as keyof typeof t.leave] || req.type}
                                            </span>
                                            {req.reason ? <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{req.reason}</span> : null}
                                            {req.substituteId ? (
                                                <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                                    Sub: {users.find(u => u.id === req.substituteId)?.name || req.substituteId}
                                                </span>
                                            ) : null}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col text-sm text-slate-600 dark:text-slate-300 tabular-nums">
                                            {isSameDay(new Date(req.startDate), new Date(req.endDate)) ? (
                                                <>
                                                    <span className="font-medium" suppressHydrationWarning>
                                                        {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(req.startDate))}
                                                    </span>
                                                    <span className="text-xs text-slate-400 dark:text-slate-500" suppressHydrationWarning>
                                                        {new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: 'numeric' }).format(new Date(req.startDate))} -
                                                        {new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: 'numeric' }).format(new Date(req.endDate))}
                                                    </span>
                                                </>
                                            ) : (
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-medium whitespace-nowrap text-slate-600 dark:text-slate-300" suppressHydrationWarning>
                                                        {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(req.startDate))}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-sm font-medium whitespace-nowrap text-slate-600 dark:text-slate-300">
                                                        <ArrowRight size={14} className="opacity-50" />
                                                        <span suppressHydrationWarning>
                                                            {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(req.endDate))}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-200 tabular-nums">
                                        {req.totalQuantity} <span className="text-slate-400 dark:text-slate-500 font-normal text-xs uppercase">
                                            {req.unit === 'hours'
                                                ? (req.totalQuantity === 1 ? t.leave.hour : t.leave.hours)
                                                : (req.totalQuantity === 1 ? t.leave.day : t.leave.days)
                                            }
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={req.status} t={t} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <a href={`/applications/${req.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
                                            {t.common.view}
                                        </a>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                    No requests match your filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status, t }: { status: string, t: any }) {
    if (status === 'approved') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                <CheckCircle2 size={12} /> {t.leave.approved}
            </span>
        )
    }
    if (status === 'rejected') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                <XCircle size={12} /> {t.leave.rejected}
            </span>
        )
    }
    if (status === 'draft') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                <Clock size={12} /> {t.leave.draft}
            </span>
        )
    }
    // Default: pending
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
            <Clock size={12} /> {t.leave.pending}
        </span>
    )
}

