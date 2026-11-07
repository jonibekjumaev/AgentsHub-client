import { screen } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import { describe, expect, it } from 'vitest';
import type { Me } from '@/auth';
import { renderWithProviders } from '@/test/renderWithProviders';
import { MyFollows } from './MyFollows';

const me = (memberType: Me['memberType']) => ({ _id: '6ac7992dd87bde19b9216c8b', memberType, memberNick: 'aria' }) as Me;

const renderAt = (url: string, memberType: Me['memberType']) => {
	mockRouter.setCurrentUrl(url);
	renderWithProviders(<MyFollows />, { auth: { status: 'member', me: me(memberType) } });
};

describe('MyFollows (/dashboard/follows)', () => {
	it.each([
		['/dashboard/follows', 'CREATOR', 'Followers'],
		['/dashboard/follows', 'USER', 'Following'],
		['/dashboard/follows?tab=following', 'CREATOR', 'Following'],
		['/dashboard/follows?tab=followers', 'USER', 'Followers'],
	] as const)('on %s a %s sees %s', (url, memberType, label) => {
		renderAt(url, memberType);
		expect(screen.getByRole('tab', { name: label })).toHaveAttribute('aria-selected', 'true');
		expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', `follows-tab-${label.toLowerCase()}`);
	});

	it('keeps the open list in the URL, so the sidebar item matches', () => {
		renderAt('/dashboard/follows', 'CREATOR');
		expect(screen.getByRole('tab', { name: 'Following' })).toHaveAttribute('href', '/dashboard/follows?tab=following');
		expect(screen.getByRole('tab', { name: 'Followers' })).toHaveAttribute('href', '/dashboard/follows?tab=followers');
	});
});
