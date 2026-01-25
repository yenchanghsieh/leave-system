'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { LeaveApplicationForm } from './LeaveApplicationForm';
import { useLeaveContext } from '@/contexts/LeaveContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LeaveRequest } from '@/types';

interface EditDraftModalProps {
    draft: LeaveRequest;
    onSuccess?: () => void;
}

export function EditDraftModal({ draft, onSuccess }: EditDraftModalProps) {
    const [open, setOpen] = useState(false);
    const { balances, updateRequest, saveDraft, deleteRequest } = useLeaveContext();
    const { t } = useLanguage();

    const handleSubmit = (data: any) => {
        // Update the draft with new data but keep draft status
        updateRequest({ ...data, id: draft.id, status: 'draft' });
        setOpen(false);
        if (onSuccess) onSuccess();
    };

    const handleSaveDraft = (data: any) => {
        // Update the existing draft
        updateRequest({ ...data, id: draft.id, status: 'draft' });
        setOpen(false);
        if (onSuccess) onSuccess();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Pencil size={16} />
                    {t.leave.editDraft}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t.leave.editDraft}</DialogTitle>
                    <DialogDescription>
                        {t.leave.apply}
                    </DialogDescription>
                </DialogHeader>

                <LeaveApplicationForm
                    balances={balances}
                    onSubmit={handleSubmit}
                    onSaveDraft={handleSaveDraft}
                    onSuccess={() => setOpen(false)}
                    initialData={draft}
                />
            </DialogContent>
        </Dialog>
    );
}

