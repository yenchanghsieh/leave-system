'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { UserCircle, Check } from 'lucide-react';
import { Role } from '@/types';

export function UserSwitcher() {
    const { currentUser, users, login } = useAuth();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-300">
                    <UserCircle size={18} />
                    <div className="flex flex-col items-start text-xs hidden sm:flex">
                        <span className="font-medium">{currentUser.name}</span>
                        <span className="opacity-70 capitalize">{currentUser.role}</span>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Switch User (Debug)</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {users.map(u => (
                    <DropdownMenuItem
                        key={u.id}
                        onClick={() => login(u.id)}
                        className="flex items-center justify-between"
                    >
                        <div className="flex flex-col">
                            <span className="font-medium">{u.name}</span>
                            <span className="text-xs text-slate-500 capitalize">{u.role}</span>
                        </div>
                        {currentUser.id === u.id ? <Check size={14} className="text-emerald-500" /> : null}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

