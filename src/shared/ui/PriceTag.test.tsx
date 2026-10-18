import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { PriceTag } from './PriceTag';

const renderTag = (ui: Parameters<typeof renderWithProviders>[0]) => renderWithProviders(ui, { auth: {} });

describe('PriceTag', () => {
	it('FREE → "Free"', () => {
		const { container } = renderTag(<PriceTag pricing="FREE" price={null} />);
		expect(container).toHaveTextContent(/^Free$/);
	});

	it('ONE_TIME → the amount only', () => {
		const { container } = renderTag(<PriceTag pricing="ONE_TIME" price={190} />);
		expect(container).toHaveTextContent(/^\$190$/);
	});

	it('SUBSCRIPTION → amount + "/ mo", spoken as "per month"', () => {
		renderTag(<PriceTag pricing="SUBSCRIPTION" price={29} />);
		expect(screen.getByText('$29')).toBeInTheDocument();
		expect(screen.getByText('/ mo')).toHaveAttribute('aria-hidden', 'true');
		expect(screen.getByText('per month')).toBeInTheDocument();
	});

	it('CUSTOM → "Custom", even if a price slipped through', () => {
		const { container } = renderTag(<PriceTag pricing="CUSTOM" price={500} />);
		expect(container).toHaveTextContent(/^Custom$/);
	});
});
