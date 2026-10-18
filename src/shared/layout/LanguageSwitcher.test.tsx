import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { LanguageSwitcher } from './LanguageSwitcher';

const openMenu = async () => {
	const user = userEvent.setup();
	await user.click(screen.getByRole('button', { name: /^Language:/ }));
	return { user, menu: await screen.findByRole('menu') };
};

describe('LanguageSwitcher', () => {
	it('links every locale to the same path and query', async () => {
		mockRouter.setCurrentUrl('/agents?category=SALES&page=2');
		renderWithProviders(<LanguageSwitcher />, { auth: {} });

		const { menu } = await openMenu();
		expect(within(menu).getByRole('menuitem', { name: 'English' })).toHaveAttribute(
			'href',
			'/agents?category=SALES&page=2',
		);
		expect(within(menu).getByRole('menuitem', { name: '한국어' })).toHaveAttribute(
			'href',
			'/ko/agents?category=SALES&page=2',
		);
		expect(within(menu).getByRole('menuitem', { name: 'Oʻzbekcha' })).toHaveAttribute(
			'href',
			'/uz/agents?category=SALES&page=2',
		);
		expect(within(menu).getByRole('menuitem', { name: 'Oʻzbekcha' })).toHaveAttribute('hreflang', 'uz');
	});

	it('marks the current locale and links the home page without a trailing slash', async () => {
		mockRouter.setCurrentUrl('/');
		mockRouter.locale = 'ko';
		renderWithProviders(<LanguageSwitcher />, { auth: {} });

		expect(screen.getByRole('button', { name: 'Language: 한국어' })).toHaveTextContent('KO');
		const { menu } = await openMenu();
		expect(within(menu).getByRole('menuitem', { name: '한국어' })).toHaveAttribute('aria-current', 'true');
		expect(within(menu).getByRole('menuitem', { name: 'English' })).toHaveAttribute('href', '/');
		expect(within(menu).getByRole('menuitem', { name: 'Oʻzbekcha' })).toHaveAttribute('href', '/uz');
		mockRouter.locale = undefined;
	});

	it('switches the locale client-side, keeping the page', async () => {
		mockRouter.setCurrentUrl('/briefs?status=OPEN');
		renderWithProviders(<LanguageSwitcher />, { auth: {} });

		const { user, menu } = await openMenu();
		await user.click(within(menu).getByRole('menuitem', { name: 'Oʻzbekcha' }));

		expect(mockRouter.locale).toBe('uz');
		expect(mockRouter.asPath).toBe('/briefs?status=OPEN');
		mockRouter.locale = undefined;
	});
});
