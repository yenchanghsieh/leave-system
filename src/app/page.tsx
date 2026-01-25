'use client';

import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { LeaveBalanceCard } from '@/components/features/leave/LeaveBalanceCard';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useLeaveContext } from '@/contexts/LeaveContext';
import { useAuth } from '@/contexts/AuthContext';
import { RecentUpdatesWidget } from '@/components/features/dashboard/RecentUpdatesWidget';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { balances } = useLeaveContext();
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const isRootUser = currentUser.role === 'root';

  // Redirect root user to employees page
  useEffect(() => {
    if (isRootUser) {
      router.replace('/employees');
    }
  }, [isRootUser, router]);

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">

        {/* Messages / Notifications Section */}
        <div className="space-y-4">
          {/* Warning: Pending Approvals (Manager) */}
          {/* Warning: Pending Approvals (Manager) - Moved to /approvals */}

          {/* Info: Recent Updates (Everyone) */}
          <RecentUpdatesWidget />
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t.common.dashboard}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t.common.manageBalances}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400 dark:text-slate-500">
              {t.common.fiscalYear}: 2026
            </div>
          </div>
        </div>

        {/* Balances Grid (Overview) - Hidden for Root user */}
        {!isRootUser && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {balances.map((b, i) => (
                <motion.div
                  key={b.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <LeaveBalanceCard balance={b} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

      </div>
    </AppLayout>
  );
}

