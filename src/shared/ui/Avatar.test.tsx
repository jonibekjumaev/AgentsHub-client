import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { AVATAR_PALETTES, Avatar, avatarPaletteIndex, initialsOf } from './Avatar';

const IDS = ['6ac7992dd87bde19b9216c8b', '6ac7992dd87bde19b9216c88', '6ac7992dd87bde19b9216c85', '6ac7992dd87bde19b9216c80'];

describe('avatarPaletteIndex', () => {
	it('gives the same id the same palette, always within range', () => {
		for (const id of IDS) {
			expect(avatarPaletteIndex(id)).toBe(avatarPaletteIndex(id));
			expect(avatarPaletteIndex(id)).toBeGreaterThanOrEqual(0);
			expect(avatarPaletteIndex(id)).toBeLessThan(AVATAR_PALETTES.length);
		}
	});

	it('spreads ids over more than one palette', () => {
		const used = new Set(Array.from({ length: 40 }, (_, i) => avatarPaletteIndex(`member-${i}`)));
		expect(used.size).toBeGreaterThan(1);
	});
});

describe('initialsOf', () => {
	it.each([
		['Sarah Chen', 'SC'],
		['aria', 'AR'],
		['  Park   Woo Jin ', 'PW'],
		['', '?'],
	])('%j → %s', (name, initials) => {
		expect(initialsOf(name)).toBe(initials);
	});
});

describe('Avatar', () => {
	it('renders the same colors for the same id', () => {
		renderWithProviders(
			<>
				<Avatar memberId={IDS[0]} name="Sarah Chen" />
				<Avatar memberId={IDS[0]} name="Sarah Chen" />
			</>,
			{ auth: {} },
		);
		const [first, second] = screen.getAllByRole('img', { name: 'Sarah Chen' });
		expect(first).toHaveAttribute('data-palette', String(avatarPaletteIndex(IDS[0])));
		expect(getComputedStyle(first).backgroundColor).toBe(getComputedStyle(second).backgroundColor);
		expect(getComputedStyle(first).backgroundColor).not.toBe('');
	});

	it('shows initials, read as the name, when there is no image', () => {
		renderWithProviders(<Avatar memberId={IDS[1]} name="Nodir Latipov" image="" />, { auth: {} });
		expect(screen.getByRole('img', { name: 'Nodir Latipov' })).toHaveTextContent('NL');
	});

	it('shows the uploaded image from the API origin', () => {
		renderWithProviders(<Avatar memberId={IDS[2]} name="aria" image="uploads/member/a.png" />, { auth: {} });
		const img = screen.getByRole('img', { name: 'aria' });
		expect(img.tagName).toBe('IMG');
		expect(img).toHaveAttribute('src', 'http://localhost:3005/uploads/member/a.png');
	});
});
