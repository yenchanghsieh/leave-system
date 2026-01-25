'use client';

import React, { createContext, useContext, useState } from 'react';
import { Department } from '@/types';

interface DepartmentContextType {
    departments: Department[];
    addDepartment: (name: string) => void;
    deleteDepartment: (id: string) => void;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

export function DepartmentProvider({ children }: { children: React.ReactNode }) {
    const [departments, setDepartments] = useState<Department[]>([
        { id: 'd1', name: 'Engineering' },
        { id: 'd2', name: 'HR' },
        { id: 'd3', name: 'Sales' },
        { id: 'd4', name: 'Marketing' },
    ]);

    const addDepartment = (name: string) => {
        const newDept = { id: `d${Date.now()}`, name };
        setDepartments(prev => [...prev, newDept]);
    };

    const deleteDepartment = (id: string) => {
        setDepartments(prev => prev.filter(d => d.id !== id));
    };

    return (
        <DepartmentContext.Provider value={{ departments, addDepartment, deleteDepartment }}>
            {children}
        </DepartmentContext.Provider>
    );
}

export function useDepartment() {
    const context = useContext(DepartmentContext);
    if (context === undefined) {
        throw new Error('useDepartment must be used within a DepartmentProvider');
    }
    return context;
}

