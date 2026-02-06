"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface DirtyStateContextType {
    isDirty: boolean;
    setIsDirty: (dirty: boolean) => void;
}

const DirtyStateContext = createContext<DirtyStateContextType | undefined>(undefined);

export function DirtyStateProvider({ children }: { children: ReactNode }) {
    const [isDirty, setIsDirty] = useState(false);

    // Warn on browser close/refresh if dirty
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = ''; // Trigger browser warning
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    return (
        <DirtyStateContext.Provider value={{ isDirty, setIsDirty }}>
            {children}
        </DirtyStateContext.Provider>
    );
}

export function useDirtyState() {
    const context = useContext(DirtyStateContext);
    if (context === undefined) {
        throw new Error('useDirtyState must be used within a DirtyStateProvider');
    }
    return context;
}
