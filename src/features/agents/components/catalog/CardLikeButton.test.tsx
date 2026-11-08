import { ApolloError, useQuery } from '@apollo/client';
import type { MockedResponse } from '@apollo/client/testing';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Me } from '@/auth';
import { renderWithProviders } from '@/test/renderWithProviders';
import { LikeAgentMutation } from '../../graphql/agentDetail';
import { AgentsCatalogQuery } from '../../graphql/agents';
import { DEFAULT_FILTERS, agentsListVariables } from '../../lib/listQuery';
import { CREATOR_ID, makeCatalogAgent } from '../../test/fixtures';
import { CardLikeButton } from './CardLikeButton';

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

const agent = makeCatalogAgent({ productLikes: 12 }, 1);
const variables = agentsListVariables(DEFAULT_FILTERS);

const listMock: MockedResponse = {
	request: { query: AgentsCatalogQuery, variables },
	result: { data: { getProducts: { __typename: 'Products', list: [agent], metaCounter: [{ __typename: 'TotalCounter', total: 1 }] } } },
};

const likeMock = (productLikes: number): MockedResponse => ({
	request: { query: LikeAgentMutation, variables: { productId: agent._id } },
	delay: 50,
	result: { data: { likeTargetProduct: { __typename: 'Product', _id: agent._id, productLikes } } },
});

/** The catalog wiring: the card reads the agent from the list query, so cache writes re-render it. */
const Harness = ({ ready = true }: { ready?: boolean }) => {
	const { data } = useQuery(AgentsCatalogQuery, { variables });
	const first = data?.getProducts.list[0];
	return first ? <CardLikeButton agent={first} ready={ready} /> : null;
};

const button = () => screen.findByRole('button', { name: /like SupportPilot 1/i });

describe('CardLikeButton', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/agents?category=sales');
	});

	it('sends a guest to login and back', async () => {
		const user = userEvent.setup();
		renderWithProviders(<Harness />, { mocks: [listMock], auth: { status: 'guest' } });

		await user.click(await button());
		expect(mockRouter.asPath).toBe(`/login?next=${encodeURIComponent('/agents?category=sales')}`);
	});

	it('likes at once (optimistic), then keeps the server count', async () => {
		const user = userEvent.setup();
		renderWithProviders(<Harness />, { mocks: [listMock, likeMock(13)], auth: { status: 'member', me: member } });

		const like = await button();
		expect(like).toHaveAccessibleName('Like SupportPilot 1, 12 likes');
		expect(like).toHaveAttribute('aria-pressed', 'false');

		await user.click(like);
		expect(screen.getByRole('button', { name: 'Unlike SupportPilot 1, 13 likes' })).toHaveAttribute('aria-pressed', 'true');
		await waitFor(() => expect(screen.getByRole('button', { name: /^Unlike/ })).not.toHaveAttribute('aria-disabled'));
	});

	it('rolls back and shows a toast when the like fails', async () => {
		const user = userEvent.setup();
		const failure: MockedResponse = {
			request: { query: LikeAgentMutation, variables: { productId: agent._id } },
			delay: 50,
			error: new ApolloError({ graphQLErrors: [{ message: 'No data found!', extensions: { code: 'NOT_FOUND' } }] }),
		};
		renderWithProviders(<Harness />, { mocks: [listMock, failure], auth: { status: 'member', me: member } });

		await user.click(await button());
		expect(await screen.findByRole('alert')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Like SupportPilot 1, 12 likes' })).toHaveAttribute('aria-pressed', 'false');
	});

	it('is inactive for the owner (D-22) and while the member list is still loading', async () => {
		const user = userEvent.setup();
		const owner = { ...member, _id: CREATOR_ID };
		const { unmount } = renderWithProviders(<Harness />, { mocks: [listMock], auth: { status: 'member', me: owner } });

		const own = await button();
		expect(own).toHaveAttribute('aria-disabled', 'true');
		expect(own).toHaveAttribute('title', 'You can’t like your own agent.');
		await user.click(own);
		expect(own).toHaveAttribute('aria-pressed', 'false');
		unmount();

		renderWithProviders(<Harness ready={false} />, { mocks: [listMock], auth: { status: 'member', me: member } });
		expect(await button()).toHaveAttribute('aria-disabled', 'true');
	});
});
