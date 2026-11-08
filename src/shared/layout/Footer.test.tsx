import { screen, within } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { Footer } from './Footer';

describe('Footer', () => {
	it('links only to pages that exist, in three columns', () => {
		mockRouter.setCurrentUrl('/');
		renderWithProviders(<Footer />, { auth: { status: 'guest' } });

		const marketplace = screen.getByRole('navigation', { name: 'Marketplace' });
		expect(within(marketplace).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
			'/agents',
			'/briefs',
			'/creators',
			'/#home-categories',
		]);
		expect(within(screen.getByRole('navigation', { name: 'For creators' })).getByRole('link', { name: 'Sell your agent' })).toHaveAttribute('href', '/signup');
		expect(within(screen.getByRole('navigation', { name: 'Company' })).getAllByRole('link').map((link) => link.textContent)).toEqual(['About', 'FAQ']);
		expect(screen.getByText(/All prices in USD\./)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /English/ })).toBeInTheDocument();
	});
});
