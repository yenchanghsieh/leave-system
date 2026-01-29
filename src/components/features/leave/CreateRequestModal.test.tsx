import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateRequestModal } from './CreateRequestModal';

// Mock Dependencies
const mockAddRequest = jest.fn();
const mockSaveDraft = jest.fn();

jest.mock('../../../contexts/LeaveContext', () => ({
    useLeaveContext: () => ({
        balances: [],
        addRequest: mockAddRequest,
        saveDraft: mockSaveDraft
    })
}));

jest.mock('../../../lib/i18n/LanguageContext', () => ({
    useLanguage: () => ({
        t: {
            leave: {
                newRequest: 'New Request',
                apply: 'Apply for leave'
            }
        }
    })
}));

// Mock the heavy inner form to isolate Modal logic
jest.mock('./LeaveApplicationForm', () => ({
    LeaveApplicationForm: ({ onSubmit, onSaveDraft, onSuccess }: any) => (
        <div data-testid="mock-leave-form">
            <button onClick={() => onSubmit({ reason: 'Test Submit' })}>Simulate Submit</button>
            <button onClick={() => onSaveDraft({ reason: 'Test Draft' })}>Simulate Draft</button>
            <button onClick={onSuccess}>Simulate Success</button>
        </div>
    )
}));

describe('CreateRequestModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render trigger button', () => {
        render(<CreateRequestModal />);
        expect(screen.getByRole('button', { name: /New Request/i })).toBeInTheDocument();
    });

    test('should open modal and render form', async () => {
        render(<CreateRequestModal />);

        fireEvent.click(screen.getByRole('button', { name: /New Request/i }));

        // Check Title
        expect(await screen.findByRole('heading', { name: /New Request/i })).toBeInTheDocument();

        // Check Form is rendered
        expect(screen.getByTestId('mock-leave-form')).toBeInTheDocument();
    });

    test('should call addRequest on submit', async () => {
        render(<CreateRequestModal />);
        fireEvent.click(screen.getByRole('button', { name: /New Request/i }));

        const formSubmit = await screen.findByText('Simulate Submit');
        fireEvent.click(formSubmit);

        expect(mockAddRequest).toHaveBeenCalledWith(expect.objectContaining({ reason: 'Test Submit' }));
    });

    test('should call saveDraft on draft save', async () => {
        render(<CreateRequestModal />);
        fireEvent.click(screen.getByRole('button', { name: /New Request/i }));

        const draftBtn = await screen.findByText('Simulate Draft');
        fireEvent.click(draftBtn);

        expect(mockSaveDraft).toHaveBeenCalledWith(expect.objectContaining({ reason: 'Test Draft' }));
    });

    // Testing close on success is tricky because open state is internal.
    // But we check that onSuccess prop passed to form does something?
    // In our Mock, 'Simulate Success' calls onSuccess.
    // We can assume it closes. To verify, we would need to check if DialogContent disappears.
    // Due to animation, it might take time.
    // Let's skip complex close verification if we trust Radix.
});
