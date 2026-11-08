import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { DEFAULT_FILTERS, type AgentFilters } from '../../lib/listQuery';
import { PLACEHOLDER_INTERVAL_MS, SEARCH_DEBOUNCE_MS, SearchHero } from './SearchHero';

const renderHero = (filters: AgentFilters = DEFAULT_FILTERS, total: number | null = 14) => {
	const onChange = vi.fn();
	const view = renderWithProviders(<SearchHero filters={filters} onChange={onChange} total={total} />, { auth: { status: 'guest' } });
	return { onChange, ...view };
};

const field = () => screen.getByRole('searchbox', { name: 'Search agents by title' });

describe('SearchHero', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it('shows the headline and the agent count, or a sentence without it', () => {
		const { unmount } = renderHero();
		expect(screen.getByRole('heading', { level: 1, name: 'Find an agent for the job' })).toBeInTheDocument();
		expect(screen.getByText(/from 14 agents\.$/)).toBeInTheDocument();
		unmount();

		renderHero(DEFAULT_FILTERS, null);
		expect(screen.getByText('Describe the work in plain words. We search names, categories and descriptions.')).toBeInTheDocument();
	});

	it('applies the text once typing pauses, trimmed', async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
		const { onChange } = renderHero();

		await user.type(field(), ' bot ');
		expect(onChange).not.toHaveBeenCalled();
		act(() => {
			vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
		});
		expect(onChange).toHaveBeenCalledOnce();
		expect(onChange).toHaveBeenCalledWith({ text: 'bot' });
	});

	it('applies at once on Enter', async () => {
		const user = userEvent.setup();
		const { onChange } = renderHero();

		await user.type(field(), 'invoice{Enter}');
		expect(onChange).toHaveBeenCalledWith({ text: 'invoice' });
	});

	it('clears the text with its own button and keeps the focus in the field', async () => {
		const user = userEvent.setup();
		const { onChange } = renderHero({ ...DEFAULT_FILTERS, text: 'bot' });

		expect(field()).toHaveValue('bot');
		await user.click(screen.getByRole('button', { name: 'Clear search' }));

		expect(onChange).toHaveBeenCalledWith({ text: '' });
		expect(field()).toHaveValue('');
		expect(field()).toHaveFocus();
		expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
	});

	it('follows a text change from outside (a removed chip, the back button)', () => {
		const { rerender, onChange } = renderHero({ ...DEFAULT_FILTERS, text: 'bot' });
		rerender(<SearchHero filters={DEFAULT_FILTERS} onChange={onChange} total={14} />);
		expect(field()).toHaveValue('');
	});

	it('applies a suggestion as a search or a filter', async () => {
		const user = userEvent.setup();
		const { onChange } = renderHero();

		await user.click(screen.getByRole('button', { name: 'Customer support' }));
		expect(onChange).toHaveBeenLastCalledWith({ categories: ['CUSTOMER_SUPPORT'] });
		await user.click(screen.getByRole('button', { name: 'Invoices' }));
		expect(onChange).toHaveBeenLastCalledWith({ text: 'invoice' });
		await user.click(screen.getByRole('button', { name: 'Free agents' }));
		expect(onChange).toHaveBeenLastCalledWith({ pricing: ['FREE'] });
	});

	it('rotates the example placeholder only while the field is empty', () => {
		vi.useFakeTimers();
		renderHero();
		expect(field()).toHaveAttribute('placeholder', 'Answer customer questions on my website');

		act(() => {
			vi.advanceTimersByTime(PLACEHOLDER_INTERVAL_MS);
		});
		expect(field()).toHaveAttribute('placeholder', 'Write product descriptions from a spreadsheet');

		fireEvent.change(field(), { target: { value: 'x' } });
		act(() => {
			vi.advanceTimersByTime(PLACEHOLDER_INTERVAL_MS * 2);
		});
		expect(field()).toHaveAttribute('placeholder', 'Write product descriptions from a spreadsheet');
	});
});
