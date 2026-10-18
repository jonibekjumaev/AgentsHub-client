import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { AgentGallery } from './AgentGallery';

const images = ['uploads/product/one.png', 'uploads/product/two.png', 'uploads/product/three.png'];
const main = () => screen.getByRole('img', { name: /^SupportPilot — screenshot/ });
const thumb = (index: number) => screen.getByRole('button', { name: `Show screenshot ${index} of 3` });

describe('AgentGallery', () => {
	it('shows the first screenshot with descriptive alt text, through next/image', () => {
		renderWithProviders(<AgentGallery title="SupportPilot" images={images} />, { auth: {} });

		expect(main()).toHaveAccessibleName('SupportPilot — screenshot 1 of 3');
		expect(main().getAttribute('src')).toContain(encodeURIComponent('http://localhost:3005/uploads/product/one.png'));
		expect(thumb(1)).toHaveAttribute('aria-pressed', 'true');
		expect(thumb(2)).toHaveAttribute('aria-pressed', 'false');
	});

	it('selects a screenshot by click, Enter and Space', async () => {
		const user = userEvent.setup();
		renderWithProviders(<AgentGallery title="SupportPilot" images={images} />, { auth: {} });

		await user.click(thumb(3));
		expect(main()).toHaveAccessibleName('SupportPilot — screenshot 3 of 3');

		thumb(2).focus();
		await user.keyboard('{Enter}');
		expect(main()).toHaveAccessibleName('SupportPilot — screenshot 2 of 3');

		thumb(1).focus();
		await user.keyboard(' ');
		expect(main()).toHaveAccessibleName('SupportPilot — screenshot 1 of 3');
	});

	it('is one tab stop; arrows, Home and End move the selection and the focus', async () => {
		const user = userEvent.setup();
		renderWithProviders(<AgentGallery title="SupportPilot" images={images} />, { auth: {} });
		const group = screen.getByRole('group', { name: 'Screenshots' });

		expect(within(group).getAllByRole('button').map((button) => button.tabIndex)).toEqual([0, -1, -1]);
		await user.tab();
		expect(thumb(1)).toHaveFocus();

		await user.keyboard('{ArrowRight}');
		expect(thumb(2)).toHaveFocus();
		expect(thumb(2)).toHaveAttribute('aria-pressed', 'true');
		expect(main()).toHaveAccessibleName('SupportPilot — screenshot 2 of 3');

		await user.keyboard('{End}');
		expect(thumb(3)).toHaveFocus();
		await user.keyboard('{ArrowRight}');
		expect(thumb(1)).toHaveFocus(); // wraps around
		await user.keyboard('{ArrowLeft}');
		expect(thumb(3)).toHaveFocus();
		await user.keyboard('{Home}');
		expect(thumb(1)).toHaveFocus();
	});

	it('has no thumbnails for one image, and a placeholder for none', () => {
		const { unmount } = renderWithProviders(<AgentGallery title="SupportPilot" images={images.slice(0, 1)} />, { auth: {} });
		expect(screen.queryByRole('group')).not.toBeInTheDocument();
		unmount();

		renderWithProviders(<AgentGallery title="SupportPilot" images={[]} />, { auth: {} });
		expect(screen.getByText('No screenshots yet')).toBeInTheDocument();
		expect(screen.queryByRole('img')).not.toBeInTheDocument();
	});
});
