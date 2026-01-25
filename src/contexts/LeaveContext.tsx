'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LeaveBalance, LeaveRequest } from '@/types';
import { INITIAL_BALANCES, MOCK_HISTORY } from '@/lib/mock-data';
import { useAuth } from './AuthContext';
import { getEffectiveSupervisor } from '@/lib/leave-logic';

interface LeaveContextType {
    balances: LeaveBalance[];
    history: LeaveRequest[];
    allRequests: LeaveRequest[]; // Internal full list for filtering
    addRequest: (request: LeaveRequest) => void;
    saveDraft: (request: LeaveRequest) => void;
    updateRequest: (request: LeaveRequest) => void;
    deleteRequest: (requestId: string) => void;
    approveRequest: (requestId: string) => void;
    rejectRequest: (requestId: string) => void;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export function LeaveProvider({ children }: { children: ReactNode }) {
    const { currentUser } = useAuth();
    // In a real app, balances would be fetched per user. 
    // For this mock, we'll keep one global state of balances for simplicity (or reset them)
    // but ideally we map UserId -> Balances[]. For now, let's just stick to the shared balances 
    // or assume they reload on user switch. 
    // To make it slightly better, let's just track balances for the *current user* in state,
    // and reset them when user changes (effect).
    const [balances, setBalances] = useState<LeaveBalance[]>(INITIAL_BALANCES);

    // Store ALL history globally for the mock, then filter based on user
    // Initialize from localStorage if available
    const [globalHistory, setGlobalHistory] = useState<LeaveRequest[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('leave-requests');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error('Failed to parse leave history', e);
                }
            }
        }
        return MOCK_HISTORY;
    });

    // Save to localStorage whenever history changes
    React.useEffect(() => {
        localStorage.setItem('leave-requests', JSON.stringify(globalHistory));
    }, [globalHistory]);

    // Derived state: History visible to the current user
    const userHistory = globalHistory.filter(req => {
        // 1. Employee sees their own requests
        if (req.userId === currentUser.id) return true;

        // 2. Supervisor sees requests from their direct reports
        // We need to look up the requester to check their supervisorId.
        // Since we don't have a full User DB in context easily, we'll cheat slightly:
        // We'll rely on the requester ID matching known MOCK_USERS for this logic, 
        // OR we just assume if I am a manager, I see requests where I am approved.
        return false;
    });

    // Actually, to make the Supervisor logic work, we need access to ALL users to check relationships.
    // Let's import MOCK_USERS or get them from AuthContext.
    const { users } = useAuth();

    const accessibleHistory = globalHistory.filter(req => {
        // If I am the requester, I see it.
        if (req.userId === currentUser.id) return true;

        // If I am Admin, I see everything (optional, or just restrict to hierarchy)
        if (currentUser.role === 'admin' || currentUser.role === 'root') return true;

        // If I am the supervisor of the requester, I see it.
        // CHECK SUBSTITUTE LOGIC:
        // Does this request satisfy: EffectiveSupervisor(Requester) === CurrentUser?

        const requester = users.find(u => u.id === req.userId);
        if (requester) {
            const effectiveSupervisorId = getEffectiveSupervisor(requester, users, globalHistory);
            if (effectiveSupervisorId === currentUser.id) {
                return true;
            }
        }

        return false;
    });

    // Recalculate balances whenever history or user changes
    React.useEffect(() => {
        const calculatedBalances = INITIAL_BALANCES.map(b => ({ ...b, used: 0 }));

        // Only count APPROVED requests for the current user
        const myApprovedRequests = globalHistory.filter(req =>
            req.userId === currentUser.id && req.status === 'approved'
        );

        myApprovedRequests.forEach(req => {
            const balance = calculatedBalances.find(b => b.type === req.type);
            if (balance) {
                let deduction = req.totalQuantity;
                // Simple unit conversion if needed, though usually they match config
                if (balance.unit === 'hours' && req.unit === 'days') deduction = req.totalQuantity * 8;
                else if (balance.unit === 'days' && req.unit === 'hours') deduction = req.totalQuantity / 8;

                balance.used += deduction;
            }
        });

        // Also pending requests? Usually balance shows *available*, which might deduct pending.
        // For this requirement, let's assume "used" means approved used. 
        // If we want "Available" to decrease with pending, we'd include pending.
        // Let's stick to Approved for "used", keeping it simple and aligned with "History of Approved".

        setBalances(calculatedBalances);
    }, [globalHistory, currentUser.id]);

    const addRequest = (request: LeaveRequest) => {
        // Business Rule: If user has no supervisor, auto-approve.
        // Otherwise, status is pending.
        const initialStatus = currentUser.supervisorId ? 'pending' : 'approved';

        const newRequest = { ...request, status: initialStatus as 'draft' | 'pending' | 'approved' | 'rejected' };
        setGlobalHistory(prev => [newRequest, ...prev]);

        // No need to manually update balances, the effect will handle it if status is approved
    };

    const saveDraft = (request: LeaveRequest) => {
        // Save as draft - does not trigger approval workflow
        const draftRequest = { ...request, status: 'draft' as const };
        setGlobalHistory(prev => [draftRequest, ...prev]);
    };

    const updateRequest = (request: LeaveRequest) => {
        setGlobalHistory(prev => prev.map(req =>
            req.id === request.id ? request : req
        ));
    };

    const deleteRequest = (requestId: string) => {
        setGlobalHistory(prev => prev.filter(req => req.id !== requestId));
    };

    const approveRequest = (requestId: string) => {
        setGlobalHistory(prev => prev.map(req =>
            req.id === requestId ? { ...req, status: 'approved' } : req
        ));
    };

    const rejectRequest = (requestId: string) => {
        setGlobalHistory(prev => prev.map(req =>
            req.id === requestId ? { ...req, status: 'rejected' } : req
        ));
    };



    return (
        <LeaveContext.Provider value={{
            balances,
            history: accessibleHistory,
            allRequests: globalHistory,
            addRequest,
            saveDraft,
            updateRequest,
            deleteRequest,
            approveRequest,
            rejectRequest
        }}>
            {children}
        </LeaveContext.Provider>
    );
}

export function useLeaveContext() {
    const context = useContext(LeaveContext);
    if (context === undefined) {
        throw new Error('useLeaveContext must be used within a LeaveProvider');
    }
    return context;
}

