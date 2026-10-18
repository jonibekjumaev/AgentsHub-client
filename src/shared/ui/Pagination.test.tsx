import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { Pagination, paginationItems } from './Pagination';

describe('paginationItems', () => {
	it.each([
		[1, 1, [1]],
		[1, 3, [1, 2, 3]],
		[5, 12, [1, 'gap-start', 4, 5, 6, 'gap-end', 12]],
		[1, 12, [1, 2, 'gap-end', 12]],
		[12, 12, [1, 'gap-start', 11, 12]],
		[3, 12, [1, 2, 3, 4, 'gap-end', 12]],
	])('page %d of %d', (page, count, expected) => {
		expect(paginationItems(page, count)).toEqual(expected);
	});
});

describe('Pagination', () => {
	it('is a labelled nav with aria-current on the current page', () => {
		renderWithProviders(<Pagination page={2} count={3} getHref={(p) => `/agents?page=${p}`} />, { auth: {} });

		const nav = screen.getByRole('navigation', { name: 'Pagination' });
		expect(within(nav).getByRole('link', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
		expect(within(nav).getByRole('link', { name: 'Page 3' })).toHaveAttribute('href', '/agents?page=3');
		expect(within(nav).getByRole('link', { name: 'Previous page' })).toHaveAttribute('href', '/agents?page=1');
	});

	it('disables Previous on the first page and calls onChange in button mode', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		renderWithProviders(<Pagination page={1} count={3} onChange={onChange} />, { auth: {} });

		expect(screen.getByLabelText('Previous page')).toHaveAttribute('aria-disabled', 'true');
		await user.click(screen.getByRole('button', { name: 'Next page' }));
		await user.click(screen.getByRole('button', { name: 'Page 3' }));
		expect(onChange.mock.calls).toEqual([[2], [3]]);
	});

	it('renders nothing for a single page', () => {
		const { container } = renderWithProviders(<Pagination page={1} count={1} onChange={vi.fn()} />, { auth: {} });
		expect(container).toBeEmptyDOMElement();
	});
});
