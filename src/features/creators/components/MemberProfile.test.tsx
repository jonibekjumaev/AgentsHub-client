import type { MockedResponse } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Me } from '@/auth';
import { AgentsListQuery } from '@/features/agents';
import { MyFollowingIdsQuery, SubscribeMutation } from '@/features/follows';
import { renderWithProviders } from '@/test/renderWithProviders';
import { MemberProfileQuery, MemberViewerQuery } from '../graphql/creators';
import { profileAgentsVariables } from '../lib/profile';
import { CREATOR_ID, VIEWER_ID, makeProfile } from '../test/fixtures';
import { MemberProfile } from './MemberProfile';

const profileMock = (member = makeProfile()): MockedResponse => ({
	request: { query: MemberProfileQuery, variables: { memberId: CREATOR_ID } },
	result: { data: { getMember: member } },
});

const agentsMock = (): MockedResponse => ({
	request: { query: AgentsListQuery, variables: profileAgentsVariables(CREATOR_ID) },
	result: { data: { getProducts: { __typename: 'Products', list: [], metaCounter: [{ __typename: 'TotalCounter', total: 0 }] } } },
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

	it('renders a creator for a guest: badge, stats, tabs, no contacts', async () => {
		renderWithProviders(<MemberProfile memberId={CREATOR_ID} />, { mocks: [profileMock(), agentsMock()], auth: { status: 'guest' } });

		expect(await screen.findByRole('heading', { level: 1, name: 'Nova Labs' })).toBeInTheDocument();
		expect(screen.getByText('Creator')).toBeInTheDocument();
		expect(screen.getByText('48.2K')).toBeInTheDocument();
		expect(screen.getByText('Log in to see contact details.')).toBeInTheDocument();
		const tabs = screen.getByRole('navigation', { name: 'Profile sections' });
		expect(within(tabs).getByRole('link', { name: /Agents · 8/ })).toHaveAttribute('aria-current', 'page');
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
});
