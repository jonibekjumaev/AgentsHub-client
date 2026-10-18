import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { makeAgent } from '../test/fixtures';
import { AgentCard } from './AgentCard';

const renderCard = (patch: Parameters<typeof makeAgent>[0] = {}) =>
	renderWithProviders(<AgentCard agent={makeAgent(patch)} />, { auth: {} });

describe('AgentCard', () => {
	it('shows title link, category, creator, price and counters', () => {
		const { container } = renderCard();

		const link = screen.getByRole('link', { name: 'SupportPilot 0' });
		expect(link).toHaveAttribute('href', '/agents/6ac7992dd87bde19b9216c00');
		expect(screen.getByRole('heading', { level: 2, name: 'SupportPilot 0' })).toBeInTheDocument();
		expect(screen.getByText('Customer support')).toBeInTheDocument();
		expect(screen.getByText('by @nova_labs')).toBeInTheDocument();
		expect(screen.getByText('$49')).toBeInTheDocument();
		expect(screen.getByText('per month')).toBeInTheDocument();
		expect(screen.getByText('128 likes')).toBeInTheDocument();
		expect(screen.getByText('2.3K views')).toBeInTheDocument();
		// The cover is decorative: the title names the agent.
		expect(container.querySelector('img')).toHaveAttribute('src', 'http://localhost:3005/uploads/product/cover.png');
		expect(container.querySelector('img')).toHaveAttribute('alt', '');
	});

	it('is a single link (one tab stop for the whole card)', () => {
		renderCard();
		expect(screen.getAllByRole('link')).toHaveLength(1);
	});

	it('shows a placeholder when the agent has no image', () => {
		const { container } = renderCard({ productImages: [] });
		expect(container.querySelector('img')).toBeNull();
		expect(container.querySelector('[data-testid="SmartToyOutlinedIcon"]')).toBeInTheDocument();
	});

	it.each([
		['FREE', null, 'Free'],
		['CUSTOM', null, 'Custom'],
		['ONE_TIME', 190, '$190'],
	] as const)('renders %s pricing as %s', (productPricing, productPrice, text) => {
		renderCard({ productPricing, productPrice });
		expect(screen.getByText(text)).toBeInTheDocument();
		expect(screen.queryByText('per month')).not.toBeInTheDocument();
	});

	it('uses singular counters and hides the creator line without memberData', () => {
		renderCard({ productLikes: 1, productViews: 1, memberData: null });
		expect(screen.getByText('1 like')).toBeInTheDocument();
		expect(screen.getByText('1 view')).toBeInTheDocument();
		expect(screen.queryByText(/^by @/)).not.toBeInTheDocument();
	});
});
