import type { ReactNode } from 'react';
import type { MockedResponse } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { AgentsListQuery } from '../graphql/agents';
import { AgentDetailQuery } from '../graphql/agentDetail';
import { moreFromVariables } from '../lib/detail';
import { AGENT_ID, CREATOR_ID, makeAgent, makeAgentDetail } from '../test/fixtures';
import { AgentDetail } from './AgentDetail';
import { AgentDetailSeo } from './AgentDetailSeo';

// next/head needs Next's head manager; render its children in place so the tags can be read.
vi.mock('next/head', () => ({ default: ({ children }: { children: ReactNode }) => <>{children}</> }));

const SITE = 'https://agentshub.test';

const detailMock = (agent = makeAgentDetail()): MockedResponse => ({
	request: { query: AgentDetailQuery, variables: { productId: AGENT_ID } },
	result: { data: { getProduct: agent } },
	maxUsageCount: 2, // AgentDetail and AgentDetailSeo
});

const moreMock = (agents: ReturnType<typeof makeAgent>[]): MockedResponse => ({
	request: { query: AgentsListQuery, variables: moreFromVariables(CREATOR_ID) },
	result: {
		data: { getProducts: { __typename: 'Products', list: agents, metaCounter: [{ __typename: 'TotalCounter', total: agents.length }] } },
	},
});

const renderDetail = (mocks: MockedResponse[]) =>
	renderWithProviders(<AgentDetail agentId={AGENT_ID} />, { mocks, auth: { status: 'guest' } });

describe('AgentDetail', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl(`/agents/${AGENT_ID}`);
	});

	it('renders the public agent per AgentDetail.html', async () => {
		renderDetail([detailMock(), moreMock([])]);

		expect(await screen.findByRole('heading', { level: 1, name: 'SupportPilot' })).toBeInTheDocument();

		const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' });
		expect(within(crumbs).getByRole('link', { name: 'Agents' })).toHaveAttribute('href', '/agents');
		expect(within(crumbs).getByRole('link', { name: 'Customer support' })).toHaveAttribute(
			'href',
			'/agents?category=customer-support',
		);
		expect(within(crumbs).getByText('SupportPilot')).toHaveAttribute('aria-current', 'page');

		expect(screen.getByText('$49')).toBeInTheDocument();
		expect(screen.getByText('Subscription · billed monthly · USD')).toBeInTheDocument();
		expect(screen.getByText('128 likes')).toBeInTheDocument();
		expect(screen.getByText('2.3K views')).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Questions' })).toBeInTheDocument();
	});

	it('keeps the description plain text with its line breaks (white-space: pre-line)', async () => {
		renderDetail([detailMock(makeAgentDetail({ productDesc: '<b>Bold?</b>\nSecond line' })), moreMock([])]);

		const description = await screen.findByText(/Second line/);
		expect(description.textContent).toBe('<b>Bold?</b>\nSecond line');
		expect(description.querySelector('b')).toBeNull();
		expect(description).toHaveStyle({ whiteSpace: 'pre-line' });
	});

	it('opens the demo in a new tab without referrer, opener or endorsement', async () => {
		renderDetail([detailMock(), moreMock([])]);

		const demo = await screen.findByRole('link', { name: /Open live demo/ });
		expect(demo).toHaveAttribute('href', 'https://demo.example.com/supportpilot');
		expect(demo).toHaveAttribute('target', '_blank');
		expect(demo).toHaveAttribute('rel', 'nofollow ugc noopener noreferrer');
		expect(demo).toHaveAccessibleName('Open live demo (opens in a new tab)');
	});

	it('never links a demo URL that is not http(s)', async () => {
		renderDetail([detailMock(makeAgentDetail({ productDemoUrl: 'javascript:alert(1)' })), moreMock([])]);
		await screen.findByRole('heading', { level: 1 });
		expect(screen.queryByRole('link', { name: /Open live demo/ })).not.toBeInTheDocument();
	});

	it('links tags to the filtered list and the creator to their profile', async () => {
		renderDetail([detailMock(), moreMock([])]);

		const tags = await screen.findByRole('list', { name: 'Tags' });
		expect(within(tags).getByRole('link', { name: 'Show agents tagged telegram' })).toHaveAttribute('href', '/agents?tag=telegram');
		expect(screen.getByRole('link', { name: 'View profile of @nova_labs' })).toHaveAttribute('href', `/members/${CREATOR_ID}`);
		expect(screen.getByText('4 agents · 312 followers')).toBeInTheDocument();
		// Guests get the login prompt instead of contacts.
		expect(screen.getByRole('link', { name: 'Log in to contact' })).toBeInTheDocument();
	});

	it('lists other agents of the creator, leaving out this one', async () => {
		renderDetail([
			detailMock(),
			moreMock([makeAgent({ _id: AGENT_ID, productTitle: 'SupportPilot' }), makeAgent({ productTitle: 'LeadCatcher' }, 5)]),
		]);

		const section = await screen.findByRole('region', { name: 'More from @nova_labs' });
		expect(within(section).getAllByRole('link')).toHaveLength(1);
		expect(within(section).getByRole('link', { name: /LeadCatcher/ })).toHaveAttribute('href', '/agents/6ac7992dd87bde19b9216c05');
	});

	it('shows the error state when the agent cannot be loaded in the browser', async () => {
		renderDetail([
			{ request: { query: AgentDetailQuery, variables: { productId: AGENT_ID } }, error: new TypeError('Failed to fetch') },
		]);
		expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load this agent');
	});
});

describe('AgentDetailSeo', () => {
	it('renders title, trimmed description, og:image from the first image and a query-free canonical', async () => {
		mockRouter.setCurrentUrl(`/agents/${AGENT_ID}?utm_source=x`);
		renderWithProviders(
			<>
				<AgentDetailSeo agentId={AGENT_ID} />
				<AgentDetail agentId={AGENT_ID} />
			</>,
			{ mocks: [detailMock(makeAgentDetail({ productDesc: `Answers questions.\n\n${'Long text. '.repeat(40)}` })), moreMock([])], auth: { status: 'guest' } },
		);

		await screen.findByRole('heading', { level: 1 });
		const meta = (selector: string, name: string) => document.querySelector(selector)?.getAttribute(name);

		expect(document.title).toBe('SupportPilot · AgentsHub');
		const description = meta('meta[name="description"]', 'content') ?? '';
		expect(description.startsWith('Answers questions. Long text.')).toBe(true);
		expect(description.length).toBeLessThanOrEqual(160);
		expect(description.endsWith('…')).toBe(true);
		expect(meta('meta[property="og:image"]', 'content')).toBe('http://localhost:3005/uploads/product/one.png');
		expect(meta('link[rel="canonical"]', 'href')).toBe(`${SITE}/agents/${AGENT_ID}`);
	});
});
