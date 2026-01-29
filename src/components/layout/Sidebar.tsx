'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    FileText,
    CheckCircle2,
    Users,
    User,
    Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
    isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
    const { t } = useLanguage();
    const pathname = usePathname();
    const { currentUser, users } = useAuth();

    const isRootUser = currentUser.role === 'root';
    const isAdmin = currentUser.role === 'admin' || isRootUser;
    const isSupervisor = users.some(u => u.supervisorId === currentUser.id);
    const hasApprovalAccess = (isAdmin || isSupervisor) && !isRootUser;

    return (
        <motion.aside
            initial={false}
            animate={{ width: isOpen ? 256 : 80 }}
            className="bg-white dark:bg-slate-900 border-r dark:border-slate-800 h-screen sticky top-0 flex flex-col z-20 shadow-sm"
        >
            <div className="h-16 flex items-center px-6 border-b dark:border-slate-800">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl overflow-hidden whitespace-nowrap">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                        <span className="text-white text-lg">L</span>
                    </div>
                    {isOpen ? <span>LeaveSys</span> : null}
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {/* Dashboard and History - hidden for root user */}
                {!isRootUser && (
                    <>
                        <NavItem icon={<LayoutDashboard size={20} />} label={t.common.dashboard} href="/" active={pathname === '/'} isOpen={isOpen} />
                        <NavItem icon={<FileText size={20} />} label={t.common.history} href="/history" active={pathname === '/history' || pathname.startsWith('/applications')} isOpen={isOpen} />
                    </>
                )}

                {/* Approvals and My Team - hidden for root user */}
                {hasApprovalAccess && (
                    <>
                        <NavItem icon={<CheckCircle2 size={20} />} label={t.common.approvals} href="/approvals" active={pathname === '/approvals'} isOpen={isOpen} />
                        <NavItem icon={<Users size={20} />} label={t.common.myTeam} href="/team" active={pathname.startsWith('/team')} isOpen={isOpen} />
                    </>
                )}

                {/* Employees - available for all admins including root */}
                {isAdmin && (
                    <NavItem icon={<User size={20} />} label={t.common.employees} href="/employees" active={pathname.startsWith('/employees')} isOpen={isOpen} />
                )}

                <NavItem icon={<Settings size={20} />} label={t.common.settings} href="/settings" active={pathname === '/settings'} isOpen={isOpen} />
            </nav>

            <div className="p-4 border-t dark:border-slate-800">
                <div className={cn("flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors", !isOpen ? "justify-center" : "")}>
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                        <User size={16} className="text-slate-600 dark:text-slate-300" />
                    </div>
                    {isOpen ? (
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{currentUser.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{currentUser.role}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                {t.employees.joined}: {new Date(currentUser.onboardDate).toLocaleDateString()}
                            </p>
                        </div>
                    ) : null}
                </div>
            </div>
        </motion.aside>
    );
}

function NavItem({ icon, label, href, active, isOpen }: { icon: React.ReactNode; label: string; href: string; active?: boolean; isOpen: boolean }) {
    return (
        <a
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                active
                    ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
                !isOpen ? "justify-center px-0" : ""
            )}
        >
            {icon}
            {isOpen ? <span>{label}</span> : null}
        </a>
    )
}

