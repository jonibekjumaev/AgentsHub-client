import type { MockedResponse } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Me } from '@/auth';
import { AgentsListQuery } from '@/features/agents';
import { ArticlesListQuery } from '@/features/community';
import { MyFollowingIdsQuery, SubscribeMutation } from '@/features/follows';
import { renderWithProviders } from '@/test/renderWithProviders';
import { MemberProfileQuery, MemberViewerQuery } from '../graphql/creators';
import { DEFAULT_PROFILE_AGENT_FILTERS, profileAgentsVariables, profileArticlesVariables, type ProfileAgentFilters } from '../lib/profile';
import { CREATOR_ID, VIEWER_ID, makeProfile } from '../test/fixtures';
import { MemberProfile } from './MemberProfile';

const profileMock = (member = makeProfile()): MockedResponse => ({
	request: { query: MemberProfileQuery, variables: { memberId: CREATOR_ID } },
	result: { data: { getMember: member } },
});

const agentsMock = (filters: ProfileAgentFilters = DEFAULT_PROFILE_AGENT_FILTERS): MockedResponse => ({
	request: { query: AgentsListQuery, variables: profileAgentsVariables(CREATOR_ID, filters) },
	result: { data: { getProducts: { __typename: 'Products', list: [], metaCounter: [{ __typename: 'TotalCounter', total: 0 }] } } },
});

const articlesMock = (titles: string[], total = titles.length): MockedResponse => ({
	request: { query: ArticlesListQuery, variables: profileArticlesVariables(CREATOR_ID) },
	result: {
		data: {
			getBoardArticles: {
				__typename: 'BoardArticles',
				list: titles.map((articleTitle, index) => ({
					__typename: 'BoardArticle',
					_id: `6ac7992dd87bde19b9216d${String(index).padStart(2, '0')}`,
					articleCategory: 'NEWS',
					articleStatus: 'ACTIVE',
					articleTitle,
					articleContent: 'How we ship small agents.',
					articleImage: null,
					articleLikes: 2,
					articleViews: 10,
					articleComments: 1,
					createdAt: '2026-10-01T10:00:00.000Z',
					memberData: { __typename: 'Member', _id: CREATOR_ID, memberNick: 'nova_labs', memberFullName: 'Nova Labs', memberImage: '' },
				})),
				metaCounter: [{ __typename: 'TotalCounter', total }],
			},
		},
	},
});

const viewerMock = (following: boolean): MockedResponse => ({
	request: { query: MemberViewerQuery, variables: { memberId: CREATOR_ID } },
	result: {
		data: {
			getMember: {
				__typename: 'Member',
				_id: CREATOR_ID,
				memberViews: 48201,
				memberEmail: 'hello@novalabs.test',
				memberWhatsapp: '+998935551234',
				meFollowed: following ? [{ __typename: 'MeFollowed', followingId: CREATOR_ID, followerId: VIEWER_ID, myFollowing: true }] : [],
			},
		},
	},
});

const idsMock = (ids: string[]): MockedResponse => ({
	request: { query: MyFollowingIdsQuery, variables: { input: { page: 1, limit: 100, search: { followerId: VIEWER_ID } } } },
	result: {
		data: {
			getMemberFollowings: {
				__typename: 'Followings',
				list: ids.map((id, index) => ({ __typename: 'Follower', _id: `f${index}`, followingId: id })),
				metaCounter: [{ __typename: 'TotalCounter', total: ids.length }],
			},
		},
	},
});

const viewer = { _id: VIEWER_ID, memberType: 'USER', memberStatus: 'ACTIVE', memberNick: 'dilnoza_bakes' } as Me;

describe('MemberProfile (S6)', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl(`/members/${CREATOR_ID}`);
	});

	it('renders a creator for a guest: badge, tabs, no contacts', async () => {
		renderWithProviders(<MemberProfile memberId={CREATOR_ID} />, { mocks: [profileMock(), agentsMock()], auth: { status: 'guest' } });

		expect(await screen.findByRole('heading', { level: 1, name: 'Nova Labs' })).toBeInTheDocument();
		expect(screen.getByText('Creator')).toBeInTheDocument();
		// Likes and views are not shown on the profile any more.
		expect(screen.queryByText('48.2K')).not.toBeInTheDocument();
		expect(screen.getByText('Log in to see contact details.')).toBeInTheDocument();
		const tabs = screen.getByRole('navigation', { name: 'Profile sections' });
		expect(within(tabs).getByRole('link', { name: 'Agents 8' })).toHaveAttribute('aria-current', 'page');
		expect(within(tabs).getByRole('link', { name: /Followers/ })).toHaveAttribute('href', `/members/${CREATOR_ID}?tab=followers`);
		expect(await screen.findByRole('heading', { name: 'No public agents yet' })).toBeInTheDocument();
	});

	it('shows contacts and the follow state from meFollowed to a member', async () => {
		renderWithProviders(<MemberProfile memberId={CREATOR_ID} />, {
			mocks: [profileMock(), agentsMock(), viewerMock(true), idsMock([])],
			auth: { status: 'member', me: viewer },
		});

		expect(await screen.findByRole('link', { name: 'hello@novalabs.test' })).toHaveAttribute('href', 'mailto:hello@novalabs.test');
		expect(await screen.findByRole('button', { name: /Following @nova_labs/ })).toHaveAttribute('aria-pressed', 'true');
	});

	it('follows after the server confirms', async () => {
		const user = userEvent.setup();
		renderWithProviders(<MemberProfile memberId={CREATOR_ID} />, {
			mocks: [
				profileMock(),
				agentsMock(),
				viewerMock(false),
				idsMock([]),
				{
					request: { query: SubscribeMutation, variables: { memberId: CREATOR_ID } },
					result: { data: { subscribe: { __typename: 'Follower', _id: 'f1', followingId: CREATOR_ID, followerId: VIEWER_ID } } },
				},
				idsMock([CREATOR_ID]),
			],
			auth: { status: 'member', me: viewer },
		});

		await user.click(await screen.findByRole('button', { name: 'Follow @nova_labs' }));
		expect(await screen.findByText('You follow @nova_labs now.')).toBeInTheDocument();
	});

	it('lists the member\'s articles on ?tab=articles, with "Show more"', async () => {
		mockRouter.setCurrentUrl(`/members/${CREATOR_ID}?tab=articles`);
		renderWithProviders(<MemberProfile memberId={CREATOR_ID} />, { mocks: [profileMock(), articlesMock(['Shipping agents fast'], 7)], auth: { status: 'guest' } });

		expect(await screen.findByRole('heading', { level: 3, name: 'Shipping agents fast' })).toBeInTheDocument();
		const tabs = screen.getByRole('navigation', { name: 'Profile sections' });
		expect(within(tabs).getByRole('link', { name: 'Articles 5' })).toHaveAttribute('aria-current', 'page');
		expect(screen.getByRole('heading', { level: 2, name: 'Articles' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Show 6 more articles' })).toBeInTheDocument();
	});

	it('shows an empty state when the member has no articles', async () => {
		mockRouter.setCurrentUrl(`/members/${CREATOR_ID}?tab=articles`);
		renderWithProviders(<MemberProfile memberId={CREATOR_ID} />, { mocks: [profileMock(), articlesMock([])], auth: { status: 'guest' } });

		expect(await screen.findByRole('heading', { name: 'No articles yet' })).toBeInTheDocument();
	});

	it('groups the sections in one nav: work first, then community', async () => {
		renderWithProviders(<MemberProfile memberId={CREATOR_ID} />, { mocks: [profileMock(), agentsMock()], auth: { status: 'guest' } });

		const nav = await screen.findByRole('navigation', { name: 'Profile sections' });
		expect(within(nav).getAllByRole('link').map((link) => link.textContent)).toEqual(['Agents 8', 'Articles 5', 'Followers 1,204', 'Following 36']);
		expect(within(nav).getByText('Work')).toBeInTheDocument();
		expect(within(nav).getByRole('link', { name: 'Following 36' })).toHaveAttribute('href', `/members/${CREATOR_ID}?tab=following`);
		expect(screen.getByRole('heading', { level: 2, name: 'Agents' })).toBeInTheDocument();
	});

	it('keeps contacts out of the page for a guest: a locked placeholder and a log-in link', async () => {
		renderWithProviders(<MemberProfile memberId={CREATOR_ID} />, { mocks: [profileMock(), agentsMock()], auth: { status: 'guest' } });

		expect(await screen.findByText('Hidden for guests')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', `/login?next=%2Fmembers%2F${CREATOR_ID}`);
		expect(screen.queryByRole('link', { name: /novalabs/ })).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Copy profile link' })).toBeInTheDocument();
	});

	it('shows the section header: group, title, count and what the list is', async () => {
		renderWithProviders(<MemberProfile memberId={CREATOR_ID} />, { mocks: [profileMock(), agentsMock()], auth: { status: 'guest' } });

		const section = (await screen.findByRole('heading', { level: 2, name: 'Agents' })).closest('section') as HTMLElement;
		expect(within(section).getByText('Work')).toBeInTheDocument();
		expect(within(section).getByText('AI agents built and sold by @nova_labs.')).toBeInTheDocument();
	});

	it('shows the agent toolbar for any number of agents, but not when there are none', async () => {
		const { unmount } = renderWithProviders(<MemberProfile memberId={CREATOR_ID} />, {
			mocks: [profileMock(makeProfile({ memberProducts: 2 })), agentsMock()],
			auth: { status: 'guest' },
		});
		expect(await screen.findByRole('searchbox', { name: 'Search agents by title' })).toBeInTheDocument();
		unmount();

		renderWithProviders(<MemberProfile memberId={CREATOR_ID} />, { mocks: [profileMock(makeProfile({ memberProducts: 0 })), agentsMock()], auth: { status: 'guest' } });
		expect(await screen.findByRole('heading', { name: 'No public agents yet' })).toBeInTheDocument();
		expect(screen.queryByRole('searchbox', { name: 'Search agents by title' })).not.toBeInTheDocument();
	});

	it('focuses the agent search with "/" and clears it with Esc', async () => {
		const user = userEvent.setup();
		renderWithProviders(<MemberProfile memberId={CREATOR_ID} />, {
			mocks: [profileMock(), agentsMock(), agentsMock({ ...DEFAULT_PROFILE_AGENT_FILTERS, text: 'blog' })],
			auth: { status: 'guest' },
		});

		const search = await screen.findByRole('searchbox', { name: 'Search agents by title' });
		await user.keyboard('/');
		expect(search).toHaveFocus();
		expect(search).toHaveValue('');

		await user.type(search, 'blog');
		await user.keyboard('{Escape}');
		expect(search).toHaveValue('');
	});

	it('filters agents by category and clears the filters from the empty state', async () => {
		const user = userEvent.setup();
		renderWithProviders(<MemberProfile memberId={CREATOR_ID} />, {
			mocks: [profileMock(), agentsMock(), agentsMock({ ...DEFAULT_PROFILE_AGENT_FILTERS, category: 'CONTENT' })],
			auth: { status: 'guest' },
		});

		expect(await screen.findByRole('searchbox', { name: 'Search agents by title' })).toBeInTheDocument();
		await user.selectOptions(screen.getByRole('combobox', { name: 'Category' }), 'CONTENT');
		expect(await screen.findByRole('heading', { name: 'No agents match your filters' })).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: 'Clear filters' }));
		expect(await screen.findByRole('heading', { name: 'No public agents yet' })).toBeInTheDocument();
		expect(screen.getByRole('combobox', { name: 'Category' })).toHaveValue('');
	});
});
