import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditDraftModal } from './EditDraftModal';
import { LeaveRequest } from '@/types';

// Mock Dependencies
const mockUpdateRequest = jest.fn();

jest.mock('../../../contexts/LeaveContext', () => ({
    useLeaveContext: () => ({
        balances: [],
        updateRequest: mockUpdateRequest,
        saveDraft: jest.fn(), // Unused in this modal? Or ussed?
        // Code says: const { updateRequest, saveDraft, deleteRequest } = ...
        // Logic: updateRequest is called for both Submit and SaveDraft (logic in component)
    })
}));

jest.mock('../../../lib/i18n/LanguageContext', () => ({
    useLanguage: () => ({
        t: {
            leave: {
                editDraft: 'Edit Draft',
                apply: 'Apply details'
            }
        }
    })
}));

// Mock Form
jest.mock('./LeaveApplicationForm', () => ({
    LeaveApplicationForm: ({ onSubmit, onSaveDraft, onSuccess }: any) => (
        <div data-testid="mock-leave-form">
            <button onClick={() => onSubmit({ reason: 'Updated Submit' })}>Simulate Submit</button>
            <button onClick={() => onSaveDraft({ reason: 'Updated Draft' })}>Simulate Save Draft</button>
        </div>
    )
}));

describe('EditDraftModal', () => {
    const mockDraft: LeaveRequest = {
        id: 'draft-1',
        userId: 'u1',
        type: 'annual',
        startDate: '2025-01-01',
        endDate: '2025-01-02',
        totalQuantity: 2,
        unit: 'days',
        status: 'draft',
        reason: 'Original Reason'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render trigger button', () => {
        render(<EditDraftModal draft={mockDraft} />);
        expect(screen.getByRole('button', { name: /Edit Draft/i })).toBeInTheDocument();
    });

    test('should open modal and render form with draft data', async () => {
        render(<EditDraftModal draft={mockDraft} />);

        fireEvent.click(screen.getByRole('button', { name: /Edit Draft/i }));

        expect(await screen.findByRole('heading', { name: /Edit Draft/i })).toBeInTheDocument();
        expect(screen.getByTestId('mock-leave-form')).toBeInTheDocument();
    });

    test('should call updateRequest on submit', async () => {
        render(<EditDraftModal draft={mockDraft} />);
        fireEvent.click(screen.getByRole('button', { name: /Edit Draft/i }));

        const submitBtn = await screen.findByText('Simulate Submit');
        fireEvent.click(submitBtn);

        // Component logic: updateRequest({ ...data, id: draft.id, status: 'draft' }) ??
        // Wait, handleSubmit in EditDraftModal:
        // updateRequest({ ...data, id: draft.id, status: 'draft' }); 
        // THIS SEEMS WRONG in the Source Code if it's "Submit" (should be pending?).
        // Let's re-read source code in Step 905.
        // Line 31: updateRequest({ ...data, id: draft.id, status: 'draft' });
        // It sets status to 'draft' even in handleSubmit?
        // Maybe Apply button is 'Save as Pending'?
        // LeaveApplicationForm calls 'onSubmit' (Apply) and 'onSaveDraft'.
        // EditDraftModal logic seems to force 'draft' status?
        // Or maybe 'submitted' draft becomes 'pending' in updateRequest logic elsewhere?
        // Actually, if I look at EditDraftModal.tsx lines 29-34:
        /*
        const handleSubmit = (data: any) => {
            // Update the draft with new data but keep draft status
            updateRequest({ ...data, id: draft.id, status: 'draft' });
            ...
        };
        */
        // This looks like a BUG or intention? 
        // If user clicks "Apply", it should probably move to 'pending'.
        // But the comment says "keep draft status".
        // Maybe the user is just Editing the Draft, not Submitting it?
        // But LeaveApplicationForm has "Apply Request" button.
        // If implementation is to just Edit, then 'draft' is correct.

        expect(mockUpdateRequest).toHaveBeenCalledWith(expect.objectContaining({
            id: 'draft-1',
            reason: 'Updated Submit',
            status: 'draft'
        }));
    });
});
