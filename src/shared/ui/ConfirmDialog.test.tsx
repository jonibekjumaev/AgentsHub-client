import { useState } from 'react';
import { Button } from '@mui/material';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { ConfirmDialog } from './ConfirmDialog';

const Harness = ({ onConfirm, loading = false }: { onConfirm: () => void; loading?: boolean }) => {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Delete agent…</Button>
			<ConfirmDialog
				open={open}
				loading={loading}
				title="Delete this agent?"
				text="This cannot be undone."
				onConfirm={onConfirm}
				onCancel={() => setOpen(false)}
			/>
		</>
	);
};

describe('ConfirmDialog', () => {
	it('is labelled, starts on Cancel, and fires onConfirm', async () => {
		const user = userEvent.setup();
		const onConfirm = vi.fn();
		renderWithProviders(<Harness onConfirm={onConfirm} />, { auth: {} });

		await user.click(screen.getByRole('button', { name: 'Delete agent…' }));
		const dialog = await screen.findByRole('dialog', { name: 'Delete this agent?' });
		expect(dialog).toHaveAccessibleDescription('This cannot be undone.');
		expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();

		await user.click(screen.getByRole('button', { name: 'Delete' }));
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it('cancels with the button or Escape and returns focus to the trigger', async () => {
		const user = userEvent.setup();
		const onConfirm = vi.fn();
		renderWithProviders(<Harness onConfirm={onConfirm} />, { auth: {} });
		const trigger = screen.getByRole('button', { name: 'Delete agent…' });

		await user.click(trigger);
		await user.click(await screen.findByRole('button', { name: 'Cancel' }));
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
		expect(trigger).toHaveFocus();

		await user.click(trigger);
		await screen.findByRole('dialog');
		await user.keyboard('{Escape}');
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
		expect(trigger).toHaveFocus();
		expect(onConfirm).not.toHaveBeenCalled();
	});

	it('keeps focus inside while open', async () => {
		const user = userEvent.setup();
		renderWithProviders(<Harness onConfirm={vi.fn()} />, { auth: {} });

		await user.click(screen.getByRole('button', { name: 'Delete agent…' }));
		const dialog = await screen.findByRole('dialog');
		await user.tab();
		await user.tab();
		await user.tab();
		expect(dialog).toContainElement(document.activeElement as HTMLElement);
	});

	it('disables both buttons while loading', async () => {
		const user = userEvent.setup();
		const onConfirm = vi.fn();
		renderWithProviders(<Harness onConfirm={onConfirm} loading />, { auth: {} });

		await user.click(screen.getByRole('button', { name: 'Delete agent…' }));
		await screen.findByRole('dialog');
		expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
		expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
	});
});
