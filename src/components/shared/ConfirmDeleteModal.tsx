'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description: string;
    loading?: boolean;
}

export function ConfirmDeleteModal({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    loading = false
}: ConfirmDeleteModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="gap-2 sm:gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 sm:mx-0 mx-auto">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="grid gap-1 text-center sm:text-left">
                        <DialogTitle className="text-lg font-semibold leading-none tracking-tight">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            {description}
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter className="sm:justify-start flex flex-col-reverse sm:flex-row gap-2 mt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="mt-2 sm:mt-0"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

