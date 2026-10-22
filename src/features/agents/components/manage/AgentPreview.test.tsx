import type { MockedResponse } from '@apollo/client/testing';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Me } from '@/auth';
import { renderWithProviders } from '@/test/renderWithProviders';
import { AgentDetailQuery } from '../../graphql/agentDetail';
import { OwnerAgentQuery } from '../../graphql/agentForm';
import { UpdateAgentStatusMutation } from '../../graphql/creatorAgents';
import { AGENT_ID, CREATOR_ID, makeAgentDetail } from '../../test/fixtures';
import { AgentPreview } from './AgentPreview';

const owner = { _id: CREATOR_ID, memberType: 'CREATOR', memberStatus: 'ACTIVE', memberNick: 'nova_labs' } as Me;
const otherCreator = { ...owner, _id: '6ac7992dd87bde19b9216c55', memberNick: 'someone' } as Me;

const ownerAgent = (productStatus: 'ACTIVE' | 'PAUSED') => ({
	__typename: 'Product' as const,
	_id: AGENT_ID,
	memberId: CREATOR_ID,
	productStatus,
	productTitle: 'SupportPilot',
	productCategory: 'CUSTOMER_SUPPORT',
	productPricing: 'SUBSCRIPTION',
	productPrice: 49,
	productDemoUrl: 'https://demo.example.com/supportpilot',
	productTags: ['telegram', 'crm'],
	productImages: ['uploads/product/one.png', 'uploads/product/two.png', 'uploads/product/three.png'],
	productDesc: 'Answers customer questions in Telegram.\nHands hard cases to your team.',
	productLikes: 128,
	productViews: 2300,
	updatedAt: '2026-10-02T12:00:00.000Z',
});

/** The owner query (gate + banner) and the detail query (the view below it) for one status. */
const loaded = (productStatus: 'ACTIVE' | 'PAUSED'): MockedResponse[] => [
	{
		request: { query: OwnerAgentQuery, variables: { productId: AGENT_ID } },
		result: { data: { getProduct: ownerAgent(productStatus) } },
	},
	{
		request: { query: AgentDetailQuery, variables: { productId: AGENT_ID } },
		result: { data: { getProduct: makeAgentDetail({ productStatus }) } },
	},
];

const statusMutation = (productStatus: 'ACTIVE' | 'PAUSED' | 'DELETE'): MockedResponse => ({
	request: { query: UpdateAgentStatusMutation, variables: { input: { _id: AGENT_ID, productStatus } } },
	result: {
		data: { updateProduct: { __typename: 'Product', _id: AGENT_ID, productStatus, updatedAt: '2026-10-20T12:00:00.000Z' } },
	},
});

const renderPreview = (me: Me, mocks: MockedResponse[], agentId = AGENT_ID) =>
	renderWithProviders(<AgentPreview agentId={agentId} />, { auth: { status: 'member', me }, mocks });

const notFound = () => screen.findByRole('heading', { name: 'Page not found' });

describe('AgentPreview (S3c)', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl(`/dashboard/agents/${AGENT_ID}`);
	});

	it('is a 404 for a malformed id, without asking the API', async () => {
		renderPreview(owner, [], 'abc');
		expect(await notFound()).toBeInTheDocument();
	});

	it("is a 404 for another creator's agent, even though the API returns it", async () => {
		renderPreview(otherCreator, loaded('ACTIVE'));
		expect(await notFound()).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /^Pause/ })).not.toBeInTheDocument();
	});

	it('shows a paused agent to its owner with the warning banner and Activate', async () => {
		renderPreview(owner, loaded('PAUSED'));

		expect(await screen.findByText(/This agent is paused/)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Activate SupportPilot' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Delete SupportPilot' })).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Pause SupportPilot' })).not.toBeInTheDocument();
		// The same view as the public page, without the parts that make no sense for the owner.
		expect(await screen.findByRole('heading', { level: 1, name: 'SupportPilot' })).toBeInTheDocument();
		expect(screen.queryByRole('heading', { name: 'Creator' })).not.toBeInTheDocument();
	});

	it('shows a live agent with a link to its public page', async () => {
		renderPreview(owner, loaded('ACTIVE'));

		expect(await screen.findByText(/This agent is live in the marketplace/)).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Open the public page' })).toHaveAttribute('href', `/agents/${AGENT_ID}`);
		expect(screen.getByRole('button', { name: 'Pause SupportPilot' })).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Activate SupportPilot' })).not.toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Edit SupportPilot' })).toHaveAttribute('href', `/dashboard/agents/${AGENT_ID}/edit`);
	});

	it('activates without a dialog and switches the banner from the server answer', async () => {
		const user = userEvent.setup();
		renderPreview(owner, [...loaded('PAUSED'), statusMutation('ACTIVE')]);

		await user.click(await screen.findByRole('button', { name: 'Activate SupportPilot' }));

		expect(await screen.findByText(/This agent is live in the marketplace/)).toBeInTheDocument();
		expect(screen.getByText('“SupportPilot” is active again.')).toBeInTheDocument();
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('deletes after confirming and goes back to My agents', async () => {
		const user = userEvent.setup();
		renderPreview(owner, [...loaded('ACTIVE'), statusMutation('DELETE')]);

		await user.click(await screen.findByRole('button', { name: 'Delete SupportPilot' }));
		const dialog = await screen.findByRole('dialog');
		await user.click(within(dialog).getByRole('button', { name: 'Delete agent' }));

		await waitFor(() => expect(mockRouter.asPath).toBe('/dashboard/agents'));
		expect(screen.queryByRole('heading', { name: 'Page not found' })).not.toBeInTheDocument();
	});
});
