import { ApolloError } from '@apollo/client';
import type { MockedResponse } from '@apollo/client/testing';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Me } from '@/auth';
import { renderWithProviders } from '@/test/renderWithProviders';
import { OwnerAgentQuery, UpdateAgentMutation } from '../../graphql/agentForm';
import { EditAgent } from './AgentFormPages';

const AGENT_ID = '6ac7992dd87bde19b9216d01';
const owner = { _id: '6ac7992dd87bde19b9216c99', memberType: 'CREATOR', memberStatus: 'ACTIVE', memberNick: 'nova_labs' } as Me;
const otherCreator = { ...owner, _id: '6ac7992dd87bde19b9216c55', memberNick: 'someone' } as Me;

const stored = {
	__typename: 'Product',
	_id: AGENT_ID,
	memberId: owner._id,
	productStatus: 'PAUSED',
	productTitle: 'SupportPilot',
	productCategory: 'CUSTOMER_SUPPORT',
	productPricing: 'SUBSCRIPTION',
	productPrice: 49,
	productDemoUrl: 'https://demo.example.com',
	productTags: ['telegram'],
	productImages: ['uploads/product/a.png'],
	productDesc: 'Answers customer questions in Telegram.',
	productLikes: 3,
	productViews: 10,
	updatedAt: '2026-10-10T12:00:00.000Z',
};

const ownerQuery = (result: Partial<MockedResponse>): MockedResponse => ({
	request: { query: OwnerAgentQuery, variables: { productId: AGENT_ID } },
	...result,
});

const renderEdit = (me: Me, mocks: MockedResponse[], agentId = AGENT_ID) =>
	renderWithProviders(<EditAgent agentId={agentId} />, { auth: { status: 'member', me }, mocks });

const notFound = () => screen.findByRole('heading', { name: 'Page not found' });

describe('EditAgent', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl(`/dashboard/agents/${AGENT_ID}/edit`);
	});

	it('is a 404 for a malformed id, without asking the API', async () => {
		renderEdit(owner, [], 'abc');
		expect(await notFound()).toBeInTheDocument();
	});

	it.each([['NOT_FOUND'], ['BAD_REQUEST']])('is a 404 when the API answers %s', async (code) => {
		renderEdit(owner, [ownerQuery({ error: new ApolloError({ graphQLErrors: [{ message: 'x', extensions: { code } }] }) })]);
		expect(await notFound()).toBeInTheDocument();
	});

	it("is a 404 for another creator's agent, even though the API returns it", async () => {
		renderEdit(otherCreator, [ownerQuery({ result: { data: { getProduct: { ...stored, productStatus: 'ACTIVE' } } } })]);
		expect(await notFound()).toBeInTheDocument();
		expect(screen.queryByRole('textbox', { name: /^Title/ })).not.toBeInTheDocument();
	});

	it('loads the owner’s paused agent into the form, with the paused note', async () => {
		renderEdit(owner, [ownerQuery({ result: { data: { getProduct: stored } } })]);

		expect(await screen.findByRole('textbox', { name: /^Title/ })).toHaveValue('SupportPilot');
		expect(screen.getByRole('combobox', { name: /^Category/ })).toHaveValue('CUSTOMER_SUPPORT');
		expect(screen.getByRole('radio', { name: /Subscription/ })).toBeChecked();
		expect(screen.getByRole('spinbutton', { name: /Price per month/ })).toHaveValue(49);
		expect(screen.getByRole('button', { name: 'Remove tag telegram' })).toBeInTheDocument();
		expect(screen.getByRole('listitem', { name: 'Image 1 of 1' })).toBeInTheDocument();
		expect(screen.getByText(/This agent is paused/)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
	});

	it('saves only what changed (D-03: switching to Custom sends no price)', async () => {
		const user = userEvent.setup();
		renderEdit(owner, [
			ownerQuery({ result: { data: { getProduct: stored } } }),
			{
				request: { query: UpdateAgentMutation, variables: { input: { _id: AGENT_ID, productPricing: 'CUSTOM', productDemoUrl: null } } },
				result: {
					data: {
						updateProduct: {
							__typename: 'Product',
							_id: AGENT_ID,
							productStatus: 'PAUSED',
							productTitle: stored.productTitle,
							productCategory: stored.productCategory,
							productPricing: 'CUSTOM',
							productPrice: null,
							productDemoUrl: null,
							productTags: stored.productTags,
							productImages: stored.productImages,
							productDesc: stored.productDesc,
							updatedAt: '2026-10-18T12:00:00.000Z',
						},
					},
				},
			},
		]);

		await screen.findByRole('textbox', { name: /^Title/ });
		await user.click(screen.getByRole('radio', { name: /Custom/ }));
		await user.clear(screen.getByRole('textbox', { name: /^Demo URL/ }));
		await user.click(screen.getByRole('button', { name: 'Save changes' }));

		await waitFor(() => expect(mockRouter.asPath).toBe(`/dashboard/agents/${AGENT_ID}`));
		expect(screen.getByText('Changes to “SupportPilot” are saved.')).toBeInTheDocument();
	});

	it('shows a retryable error for other failures', async () => {
		renderEdit(owner, [ownerQuery({ error: new TypeError('Failed to fetch') })]);
		expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load the agent');
		expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
	});
});
