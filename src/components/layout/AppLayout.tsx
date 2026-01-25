'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

interface AppLayoutProps {
    children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 flex transition-colors duration-300">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />

                <main className="flex-1 p-8 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}

