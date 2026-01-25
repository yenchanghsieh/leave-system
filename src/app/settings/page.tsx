'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import { useDepartment } from '@/contexts/DepartmentContext';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Globe, Moon, Bell, Shield, Briefcase, Save, Database, Trash2 } from 'lucide-react';
import { DepartmentManagerModal } from '@/components/features/employees/DepartmentManagerModal';

export default function SettingsPage() {
    const { currentUser } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const { settings, updateSettings } = useSystemSettings();
    const { departments } = useDepartment();

    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'root';

    // Local state for form if needed, or direct update
    // For now direct update for toggles

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t.settingsPage.title}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t.settingsPage.description}</p>
                </div>

                <div className="grid gap-6">
                    {/* General Settings */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Globe size={18} /> {t.settingsPage.general}
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium text-slate-900 dark:text-slate-100">{t.settingsPage.language}</label>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Select your preferred language</p>
                                </div>
                                <LanguageSelector />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium text-slate-900 dark:text-slate-100">{t.settingsPage.theme}</label>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Toggle dark mode</p>
                                </div>
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>

                    {/* Admin Settings */}
                    {isAdmin && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <Shield size={18} /> {t.settingsPage.admin}
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <label className="text-sm font-medium text-slate-900 dark:text-slate-100">{t.settingsPage.approvalRequired}</label>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{t.settingsPage.approvalDescription}</p>
                                    </div>
                                    <Switch
                                        checked={settings.approvalRequired}
                                        onCheckedChange={(checked: boolean) => updateSettings({ approvalRequired: checked })}
                                    />
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="space-y-0.5">
                                            <label className="text-sm font-medium text-slate-900 dark:text-slate-100">{t.settingsPage.departments}</label>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{t.settingsPage.departmentsDescription.replace('{count}', String(departments.length))}</p>
                                        </div>
                                        <DepartmentManagerModal
                                            trigger={
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    <Briefcase size={14} /> {t.settingsPage.manageDepartments}
                                                </Button>
                                            }
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {departments.map((dept) => (
                                            <span key={dept.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                                {dept.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Leave Types</label>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Configure leave types and defaults (Coming Soon)</p>
                                        </div>
                                        <Button variant="outline" size="sm" disabled>Configure</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
