'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { MOCK_USERS, MOCK_USER } from '@/lib/mock-data';

interface AuthContextType {
    currentUser: UserProfile;
    users: UserProfile[];
    login: (userId: string) => void;
    logout: () => void;
    addUser: (user: UserProfile) => void;
    updateUser: (user: UserProfile) => void;
    deleteUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
    // Vercel Best Practice: Derive state instead of syncing with effects.
    // Store only the ID and derive the user object on the fly.
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedId = localStorage.getItem('current-user-id');
        if (savedId) {
            setCurrentUserId(savedId);
        } else {
            // Initialize with MOCK_USER if no saved session
            setCurrentUserId(MOCK_USER.id);
        }
        setIsLoaded(true);
    }, []);

    // Derived state: Always get the latest user object from the users array
    const currentUser = currentUserId
        ? (users.find(u => u.id === currentUserId) || MOCK_USER)
        : MOCK_USER;

    const login = (userId: string) => {
        const found = users.find(u => u.id === userId);
        if (found) {
            setCurrentUserId(userId);
            localStorage.setItem('current-user-id', userId);
        }
    };

    const logout = () => {
        // Reset to default mock user
        setCurrentUserId(MOCK_USER.id);
        localStorage.removeItem('current-user-id');
    };

    const addUser = (user: UserProfile) => {
        // Enforce HR = Admin rule (but don't overwrite root role)
        if (user.department === 'HR' && user.role !== 'root') {
            user.role = 'admin';
        }
        setUsers(prev => [...prev, user]);
    };

    const updateUser = (updatedUser: UserProfile) => {
        // Prevent updating root user
        if (updatedUser.role === 'root') {
            console.warn("Attempted to update root user - operation blocked");
            return;
        }

        // Enforce HR = Admin rule
        if (updatedUser.department === 'HR') {
            updatedUser.role = 'admin';
        }
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    const deleteUser = (userId: string) => {
        if (userId === currentUser.id) {
            console.error("Cannot delete self");
            return;
        }

        const targetUser = users.find(u => u.id === userId);
        if (targetUser?.role === 'root') {
            console.error("Cannot delete root user");
            return;
        }

        setUsers(prev => prev.filter(u => u.id !== userId));
    };

    if (!isLoaded) return null; // or loader

    return (
        <AuthContext.Provider value={{ currentUser, users, login, logout, addUser, updateUser, deleteUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

