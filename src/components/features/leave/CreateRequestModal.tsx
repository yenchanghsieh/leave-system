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
import { Plus } from 'lucide-react';
import { LeaveApplicationForm } from './LeaveApplicationForm';
import { useLeaveContext } from '@/contexts/LeaveContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function CreateRequestModal() {
    const [open, setOpen] = useState(false);
    const { balances, addRequest, saveDraft } = useLeaveContext();
    const { t } = useLanguage();

    const handleSubmit = (data: any) => {
        addRequest(data);
        // Form handles the success timing, then calls onSuccess
    };

    const handleSaveDraft = (data: any) => {
        saveDraft(data);
        // Form handles the success timing, then calls onSuccess
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm">
                    <Plus size={16} />
                    {t.leave.newRequest}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t.leave.newRequest}</DialogTitle>
                    <DialogDescription>
                        {t.leave.apply}
                    </DialogDescription>
                </DialogHeader>

                {/* 
                  We pass a success callback to close the modal 
                  after the form shows its success message 
                */}
                <LeaveApplicationForm
                    balances={balances}
                    onSubmit={handleSubmit}
                    onSaveDraft={handleSaveDraft}
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}

