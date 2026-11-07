import { describe, expect, it } from 'vitest';
import type { CreatorStatsQuery } from '@/gql/graphql';
import { greetingName, profileChecklist, profileVisitorsVariables } from './overview';

const me = (patch: Partial<CreatorStatsQuery['getMe']> = {}): CreatorStatsQuery['getMe'] => ({
	_id: '6ac7992dd87bde19b9216c99',
	memberNick: 'nova_labs',
	memberFullName: null,
	memberImage: '',
	memberDesc: null,
	memberWhatsapp: null,
	memberEmail: null,
	memberProducts: 0,
	memberArticles: 0,
	memberViews: 0,
	memberLikes: 0,
	memberFollowers: 0,
	memberFollowings: 0,
	createdAt: '2026-03-01T12:00:00.000Z',
	...patch,
});

const paths = { newAgent: '/dashboard/agents/new', newArticle: '/dashboard/articles/new' };
const doneKeys = (patch: Partial<CreatorStatsQuery['getMe']>) =>
	profileChecklist(me(patch), paths)
		.filter((item) => item.done)
		.map((item) => item.key);

describe('profileChecklist', () => {
	it('starts with every step open, each linking to where it is fixed', () => {
		expect(profileChecklist(me(), paths)).toEqual([
			{ key: 'photo', done: false, href: '/dashboard/settings' },
			{ key: 'bio', done: false, href: '/dashboard/settings' },
			{ key: 'contact', done: false, href: '/dashboard/settings' },
			{ key: 'agent', done: false, href: '/dashboard/agents/new' },
			{ key: 'article', done: false, href: '/dashboard/articles/new' },
		]);
	});

	it('counts WhatsApp or e-mail as a contact', () => {
		expect(doneKeys({ memberWhatsapp: '+998901234567' })).toEqual(['contact']);
		expect(doneKeys({ memberEmail: 'hi@nova.dev' })).toEqual(['contact']);
	});

	it('does not count a blank bio', () => {
		expect(doneKeys({ memberDesc: '   ' })).toEqual([]);
		expect(doneKeys({ memberDesc: 'We build agents.' })).toEqual(['bio']);
	});

	it('reads photo, agents and articles from the stored fields', () => {
		expect(doneKeys({ memberImage: 'uploads/member/a.png', memberProducts: 1, memberArticles: 3 })).toEqual(['photo', 'agent', 'article']);
	});
});

describe('greetingName / profileVisitorsVariables', () => {
	it('prefers the full name, else the nick', () => {
		expect(greetingName({ memberFullName: 'Nova Labs', memberNick: 'nova' })).toBe('Nova Labs');
		expect(greetingName({ memberFullName: '  ', memberNick: 'nova' })).toBe('nova');
		expect(greetingName({ memberFullName: null, memberNick: 'nova' })).toBe('nova');
	});

	it('pages visitors by ten', () => {
		expect(profileVisitorsVariables(2)).toEqual({ input: { page: 2, limit: 10 } });
	});
});
