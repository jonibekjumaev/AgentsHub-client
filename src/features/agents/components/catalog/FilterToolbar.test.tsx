import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { DEFAULT_FILTERS, PRICE_SLIDER_MAX, type AgentFilters } from '../../lib/listQuery';
import { FilterToolbar, type FacetCounts } from './FilterToolbar';

const renderToolbar = (filters: Partial<AgentFilters> = {}, counts: FacetCounts = null) => {
	const onChange = vi.fn();
	const onView = vi.fn();
	renderWithProviders(<FilterToolbar filters={{ ...DEFAULT_FILTERS, ...filters }} onChange={onChange} counts={counts} view="grid" onView={onView} />, {
		auth: { status: 'guest' },
	});
	return { onChange, onView };
};

const slider = () => screen.getByRole('slider');

describe('FilterToolbar', () => {
	it('keeps every option enabled and shows no numbers while the counts are unknown', () => {
		renderToolbar();
		const categories = screen.getByRole('group', { name: 'Category' });
		expect(within(categories).getAllByRole('button')).toHaveLength(9);
		expect(within(categories).getByRole('button', { name: 'Sales' })).toBeEnabled();
		expect(screen.getByRole('button', { name: 'Free' })).toBeEnabled();
	});

	it('toggles categories (multi-select) and pricing', async () => {
		const user = userEvent.setup();
		const { onChange } = renderToolbar({ categories: ['SALES'], pricing: ['FREE'] });

		await user.click(screen.getByRole('button', { name: 'Marketing' }));
		expect(onChange).toHaveBeenLastCalledWith({ categories: ['SALES', 'MARKETING'] });
		await user.click(screen.getByRole('button', { name: 'Sales' }));
		expect(onChange).toHaveBeenLastCalledWith({ categories: [] });
		await user.click(screen.getByRole('button', { name: 'Free' }));
		expect(onChange).toHaveBeenLastCalledWith({ pricing: [] });
	});

	it('keeps a selected option with 0 results enabled, so it can be removed', () => {
		const counts: FacetCounts = { categories: { SALES: 0 }, pricing: { FREE: 0 } };
		renderToolbar({ categories: ['SALES'] }, counts);
		expect(screen.getByRole('button', { name: 'Sales 0' })).toBeEnabled();
		expect(screen.getByRole('button', { name: 'Free 0' })).toBeDisabled();
	});

	it('sends the max price when the thumb is let go, and "any" at the far end', () => {
		const { onChange } = renderToolbar();
		expect(slider()).toHaveAttribute('aria-valuetext', 'Any');

		fireEvent.change(slider(), { target: { value: '200' } });
		expect(onChange).not.toHaveBeenCalled();
		expect(slider()).toHaveAttribute('aria-valuetext', '$200');
		fireEvent.pointerUp(slider());
		expect(onChange).toHaveBeenLastCalledWith({ maxPrice: 200 });

		fireEvent.change(slider(), { target: { value: String(PRICE_SLIDER_MAX) } });
		fireEvent.keyUp(slider());
		expect(onChange).toHaveBeenLastCalledWith({ maxPrice: null });
	});

	it('shows a max above the slider range from a link as its real amount', () => {
		renderToolbar({ maxPrice: 2500 });
		expect(slider()).toHaveValue(String(PRICE_SLIDER_MAX));
		expect(slider()).toHaveAttribute('aria-valuetext', '$2,500');
	});

	it('disables the max price when only Free / Custom are picked (D-03)', () => {
		renderToolbar({ pricing: ['FREE', 'CUSTOM'] });
		expect(slider()).toBeDisabled();
	});

	it('switches the layout', async () => {
		const user = userEvent.setup();
		const { onView } = renderToolbar();
		expect(screen.getByRole('button', { name: 'Grid view' })).toHaveAttribute('aria-pressed', 'true');
		await user.click(screen.getByRole('button', { name: 'List view' }));
		expect(onView).toHaveBeenCalledWith('list');
	});
});
