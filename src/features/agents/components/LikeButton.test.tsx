import { ApolloError, useApolloClient, useQuery, type ApolloClient, type NormalizedCacheObject } from '@apollo/client';
import type { MockedResponse } from '@apollo/client/testing';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Me } from '@/auth';
import { renderWithProviders } from '@/test/renderWithProviders';
import { AgentCardFragment } from '../graphql/agents';
import { AgentDetailQuery, AgentViewerQuery, LikeAgentMutation } from '../graphql/agentDetail';
import { AGENT_ID, CREATOR_ID, makeAgentDetail } from '../test/fixtures';
import { LikeButton } from './LikeButton';

const member: Me = {
	_id: '6ac7992dd87bde19b9216c11',
	memberType: 'USER',
	memberStatus: 'ACTIVE',
	memberNick: 'dilnoza',
	memberFullName: null,
	memberImage: '',
	memberPhone: '+998901234567',
	memberEmail: null,
	memberWhatsapp: null,
};

const detailMock: MockedResponse = {
	request: { query: AgentDetailQuery, variables: { productId: AGENT_ID } },
	result: { data: { getProduct: makeAgentDetail({ productLikes: 128 }) } },
};

const viewerMock = (liked: boolean, delay = 0): MockedResponse => ({
	request: { query: AgentViewerQuery, variables: { productId: AGENT_ID } },
	delay,
	result: {
		data: {
			getProduct: {
				__typename: 'Product',
				_id: AGENT_ID,
				productViews: 2300,
				meLiked: liked ? [{ __typename: 'MeLiked', memberId: member._id, likeRefId: AGENT_ID, myFavorite: true }] : [],
				memberData: { __typename: 'Member', _id: CREATOR_ID, memberEmail: null, memberWhatsapp: null },
			},
		},
	},
});

const likeMock = (productLikes: number, delay = 50): MockedResponse => ({
	request: { query: LikeAgentMutation, variables: { productId: AGENT_ID } },
	delay,
	result: { data: { likeTargetProduct: { __typename: 'Product', _id: AGENT_ID, productLikes } } },
});

const likeFailure: MockedResponse = {
	request: { query: LikeAgentMutation, variables: { productId: AGENT_ID } },
	delay: 50,
	error: new ApolloError({ graphQLErrors: [{ message: 'No data found!', extensions: { code: 'NOT_FOUND' } }] }),
};

let client: ApolloClient<NormalizedCacheObject>;

/** The detail page wiring: likes come from the Product cache entity, as in PriceBox. */
const Harness = () => {
	client = useApolloClient() as ApolloClient<NormalizedCacheObject>;
	const { data } = useQuery(AgentDetailQuery, { variables: { productId: AGENT_ID } });
	if (!data) return null;
	return <LikeButton agentId={AGENT_ID} creatorId={data.getProduct.memberData?._id} likes={data.getProduct.productLikes} />;
};

const likeButton = () => screen.getByRole('button', { name: /^Like/ });
const renderAs = (auth: Parameters<typeof renderWithProviders>[1], mocks: MockedResponse[]) =>
	renderWithProviders(<Harness />, { ...auth, mocks: [detailMock, ...mocks] });

describe('LikeButton', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl(`/agents/${AGENT_ID}`);
	});

	it('sends a guest to login and back, without a mutation', async () => {
		const user = userEvent.setup();
		renderAs({ auth: { status: 'guest' } }, []);

		const button = await screen.findByRole('button', { name: /^Like/ });
		expect(button).toHaveAttribute('aria-pressed', 'false');
		expect(button).not.toHaveAttribute('aria-disabled');
		await user.click(button);

		expect(mockRouter.asPath).toBe(`/login?next=%2Fagents%2F${AGENT_ID}`);
	});

	it('stays neutral and inactive until meLiked is known, then shows it (no flash)', async () => {
		renderAs({ auth: { status: 'member', me: member } }, [viewerMock(true, 50)]);

		const button = await screen.findByRole('button', { name: /^Like/ });
		expect(button).toHaveAttribute('aria-pressed', 'false');
		expect(button).toHaveAttribute('aria-disabled', 'true');

		await waitFor(() => expect(likeButton()).toHaveAttribute('aria-pressed', 'true'));
		expect(likeButton()).not.toHaveAttribute('aria-disabled');
	});

	it('likes optimistically, is inactive while pending (no double like) and keeps the result', async () => {
		const user = userEvent.setup();
		renderAs({ auth: { status: 'member', me: member } }, [viewerMock(false), likeMock(129, 600)]);
		await waitFor(() => expect(likeButton()).not.toHaveAttribute('aria-disabled'));
		expect(likeButton()).toHaveAccessibleName('Like, 128 likes');

		await user.click(likeButton());
		// Before the server answers.
		expect(likeButton()).toHaveAttribute('aria-pressed', 'true');
		expect(likeButton()).toHaveAccessibleName('Like, 129 likes');
		expect(likeButton()).toHaveAttribute('aria-disabled', 'true');
		expect(likeButton()).toHaveAttribute('aria-busy', 'true');

		// A second click while pending sends nothing (a second request would have no mock and fail).
		await user.click(likeButton());

		await waitFor(() => expect(likeButton()).not.toHaveAttribute('aria-disabled'));
		expect(likeButton()).toHaveAttribute('aria-pressed', 'true');
		expect(likeButton()).toHaveAccessibleName('Like, 129 likes');
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	it('unlikes', async () => {
		const user = userEvent.setup();
		renderAs({ auth: { status: 'member', me: member } }, [viewerMock(true), likeMock(127)]);
		await waitFor(() => expect(likeButton()).toHaveAttribute('aria-pressed', 'true'));

		await user.click(likeButton());
		expect(likeButton()).toHaveAttribute('aria-pressed', 'false');
		expect(likeButton()).toHaveAccessibleName('Like, 127 likes');
		await waitFor(() => expect(likeButton()).not.toHaveAttribute('aria-disabled'));
		expect(likeButton()).toHaveAttribute('aria-pressed', 'false');
	});

	it('rolls back and shows a toast from the error mapping when the like fails', async () => {
		const user = userEvent.setup();
		renderAs({ auth: { status: 'member', me: member } }, [viewerMock(false), likeFailure]);
		await waitFor(() => expect(likeButton()).not.toHaveAttribute('aria-disabled'));

		await user.click(likeButton());
		expect(likeButton()).toHaveAttribute('aria-pressed', 'true');

		expect(await screen.findByText("We couldn't find what you were looking for.")).toBeInTheDocument();
		expect(likeButton()).toHaveAttribute('aria-pressed', 'false');
		expect(likeButton()).toHaveAccessibleName('Like, 128 likes');
		expect(screen.queryByText('No data found!')).not.toBeInTheDocument();
	});

	it('is inactive for the owner, with a tooltip saying why (the API rejects it, D-22)', async () => {
		const user = userEvent.setup();
		const owner: Me = { ...member, _id: CREATOR_ID, memberType: 'CREATOR' };
		renderAs({ auth: { status: 'member', me: owner } }, [viewerMock(false)]);
		await screen.findByRole('button', { name: /^Like/ });
		await waitFor(() => expect(client.readQuery({ query: AgentViewerQuery, variables: { productId: AGENT_ID } })).not.toBeNull());

		expect(likeButton()).toHaveAttribute('aria-disabled', 'true');
		await user.hover(likeButton());
		expect(await screen.findByRole('tooltip')).toHaveTextContent('You can’t like your own agent.');
		expect(likeButton()).toHaveAccessibleDescription('You can’t like your own agent.');

		await user.click(likeButton()); // no mutation mock: any request would fail and toast
		expect(likeButton()).toHaveAttribute('aria-pressed', 'false');
		expect(screen.queryByText(/couldn't find|went wrong|reach the server/)).not.toBeInTheDocument();
	});

	it('updates the same Product entity that AgentCard reads', async () => {
		const user = userEvent.setup();
		renderAs({ auth: { status: 'member', me: member } }, [viewerMock(false), likeMock(129)]);
		await waitFor(() => expect(likeButton()).not.toHaveAttribute('aria-disabled'));

		await user.click(likeButton());
		await waitFor(() => expect(likeButton()).not.toHaveAttribute('aria-disabled'));

		const card = client.readFragment({ id: `Product:${AGENT_ID}`, fragment: AgentCardFragment });
		expect(card?.productLikes).toBe(129);
	});
});
