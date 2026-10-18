import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { DEFAULT_FILTERS, type AgentFilters } from '../lib/listQuery';
import { AgentFiltersPanel } from './AgentFiltersPanel';

const setup = (patch: Partial<AgentFilters> = {}) => {
	const onChange = vi.fn();
	const user = userEvent.setup();
	renderWithProviders(<AgentFiltersPanel filters={{ ...DEFAULT_FILTERS, ...patch }} onChange={onChange} />, { auth: {} });
	return { onChange, user };
};

describe('AgentFiltersPanel', () => {
	it('toggles categories and pricing', async () => {
		const { onChange, user } = setup({ categories: ['SALES'] });

		expect(screen.getByRole('checkbox', { name: 'Sales' })).toBeChecked();
		await user.click(screen.getByRole('checkbox', { name: 'Customer support' }));
		expect(onChange).toHaveBeenLastCalledWith({ categories: ['SALES', 'CUSTOMER_SUPPORT'] });

		await user.click(screen.getByRole('checkbox', { name: 'Sales' }));
		expect(onChange).toHaveBeenLastCalledWith({ categories: [] });

		await user.click(screen.getByRole('checkbox', { name: 'Subscription' }));
		expect(onChange).toHaveBeenLastCalledWith({ pricing: ['SUBSCRIPTION'] });
	});

	it('applies the price range on Enter and on blur', async () => {
		const { onChange, user } = setup();

		await user.type(screen.getByRole('spinbutton', { name: 'Min' }), '10{Enter}');
		expect(onChange).toHaveBeenLastCalledWith({ minPrice: 10, maxPrice: null });

		await user.type(screen.getByRole('spinbutton', { name: 'Max' }), '50');
		await user.tab();
		expect(onChange).toHaveBeenLastCalledWith({ minPrice: 10, maxPrice: 50 });
	});

	it('shows min > max as an error and does not apply it', async () => {
		const { onChange, user } = setup({ minPrice: 100 });

		await user.type(screen.getByRole('spinbutton', { name: 'Max' }), '10{Enter}');
		expect(screen.getByRole('alert')).toHaveTextContent('Min must not be greater than max.');
		expect(screen.getByRole('spinbutton', { name: 'Max' })).toHaveAttribute('aria-invalid', 'true');
		expect(onChange).not.toHaveBeenCalled();
	});

	it('disables the price range when only free / custom pricing is picked', () => {
		setup({ pricing: ['FREE', 'CUSTOM'] });
		expect(screen.getByRole('spinbutton', { name: 'Min' })).toBeDisabled();
		expect(screen.getByText(/Free and custom agents have no price/)).toBeInTheDocument();
	});

	it('adds a normalized tag on Enter, once', async () => {
		const { onChange, user } = setup({ tags: ['crm'] });
		const input = screen.getByRole('textbox', { name: 'Tags' });

		await user.type(input, '  Telegram {Enter}');
		expect(onChange).toHaveBeenLastCalledWith({ tags: ['crm', 'telegram'] });
		expect(input).toHaveValue('');

		onChange.mockClear();
		await user.type(input, 'CRM{Enter}');
		expect(onChange).not.toHaveBeenCalled();
	});

	it('stops taking tags at the limit', () => {
		setup({ tags: Array.from({ length: 10 }, (_, index) => `t${index}`) });
		expect(screen.getByRole('textbox', { name: 'Tags' })).toBeDisabled();
		expect(screen.getByText('You can add up to 10 tags.')).toBeInTheDocument();
	});
});
