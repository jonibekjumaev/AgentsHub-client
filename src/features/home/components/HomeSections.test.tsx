import type { MockedResponse } from '@apollo/client/testing';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AgentsListQuery } from '@/features/agents';
import { BriefsListQuery } from '@/features/briefs';
import { CreatorsListQuery } from '@/features/creators';
import { renderWithProviders } from '@/test/renderWithProviders';
import { rankMedals } from '@/theme/tokens';
import { HOME_CATEGORIES, categoryAgentsVariables, homeAgentsVariables, latestBriefsVariables, topCreatorsVariables, type HomeAgentTab } from '../lib/home';
import { scoreColors } from './bento/tiles';
import { BriefsFeed, feedLoop } from './BriefsFeed';
import { CATEGORY_SCROLL_STEP, CategorySlider } from './CategorySlider';
import { Faq } from './Faq';
import { HowItWorks } from './HowItWorks';
import { RankedAgents } from './RankedAgents';
import { RankedCreators, medalColors } from './RankedCreators';

const agent = (index: number, patch: Record<string, unknown> = {}) => ({
	__typename: 'Product',
	_id: `6ac7992dd87bde19b9216f${String(index).padStart(2, '0')}`,
	productTitle: `Agent ${index}`,
	productCategory: 'CUSTOMER_SUPPORT',
	productPricing: 'SUBSCRIPTION',
	productPrice: 49,
	productImages: [],
	productLikes: 1,
	productViews: 3,
	memberData: { __typename: 'Member', _id: '6ac7992dd87bde19b9216c99', memberNick: 'seed_nova' },
	...patch,
});

const agentsMock = (variables: Record<string, unknown>, list: unknown[]): MockedResponse => ({
	request: { query: AgentsListQuery, variables },
	result: { data: { getProducts: { __typename: 'Products', list, metaCounter: [{ __typename: 'TotalCounter', total: list.length }] } } },
});

const creator = (index: number) => ({
	__typename: 'Member',
	_id: `6ac7992dd87bde19b9216e${String(index).padStart(2, '0')}`,
	memberNick: `creator_${index}`,
	memberFullName: `Creator ${index}`,
	memberImage: '',
	memberDesc: 'Practical agents.',
	memberRank: 10 - index,
	memberProducts: 2,
	memberFollowers: 1,
	memberLikes: 3,
});

const brief = (index: number) => ({
	__typename: 'Brief',
	_id: `6ac7992dd87bde19b9216d${String(index).padStart(2, '0')}`,
	briefTitle: `Brief ${index}`,
	briefContent: 'Need an agent.',
	briefCategory: 'AUTOMATION',
	briefStatus: 'OPEN',
	briefBudget: index === 0 ? 1200 : null,
	briefDeadline: null,
	briefViews: 1,
	briefComments: index,
	createdAt: '2026-10-10T00:00:00.000Z',
	closedAt: null,
	memberData: { __typename: 'Member', _id: '6ac7992dd87bde19b9216c20', memberNick: 'seed_ben' },
});

beforeEach(() => {
	mockRouter.setCurrentUrl('/');
});

describe('CategorySlider', () => {
	it('shows each category with its top agent names, or an invitation to post a brief', async () => {
		const mocks = HOME_CATEGORIES.map((category) =>
			agentsMock(categoryAgentsVariables(category), category === 'SALES' ? [agent(1, { productTitle: 'Lead Scout' }), agent(2, { productTitle: 'Closer' })] : []),
		);
		renderWithProviders(<CategorySlider />, { mocks, auth: { status: 'guest' } });

		const list = screen.getByRole('list', { name: 'Agent categories' });
		expect(within(list).getAllByRole('listitem')).toHaveLength(8);
		const sales = await within(list).findByRole('link', { name: /Sales/ });
		await waitFor(() => expect(sales).toHaveTextContent('Agents hereLead Scout, Closer'));
		expect(sales).toHaveAttribute('href', '/agents?category=sales');
		expect(within(list).getByRole('link', { name: /Marketing/ })).toHaveTextContent('No agents yetPost a brief for one');
	});

	it('scrolls one card per arrow click', async () => {
		const user = userEvent.setup();
		const scrollBy = vi.fn();
		Element.prototype.scrollBy = scrollBy;
		renderWithProviders(<CategorySlider />, { auth: { status: 'guest' } });

		await user.click(screen.getByRole('button', { name: 'Next categories' }));
		await user.click(screen.getByRole('button', { name: 'Previous categories' }));
		expect(scrollBy.mock.calls).toEqual([[{ left: CATEGORY_SCROLL_STEP, behavior: 'smooth' }], [{ left: -CATEGORY_SCROLL_STEP, behavior: 'smooth' }]]);
	});
});

describe('RankedAgents', () => {
	const tabMock = (tab: HomeAgentTab, list: unknown[]) => agentsMock(homeAgentsVariables(tab), list);

	it('shows the top list with positions and switches tabs', async () => {
		const user = userEvent.setup();
		renderWithProviders(<RankedAgents />, {
			mocks: [tabMock('top', [agent(1), agent(2)]), tabMock('free', [agent(3, { productTitle: 'Inbox Sorter', productPricing: 'FREE', productPrice: null })])],
			auth: { status: 'guest' },
		});

		const top = await screen.findByRole('list', { name: 'Top-ranked' });
		const cards = within(top).getAllByRole('listitem');
		expect(cards).toHaveLength(2);
		expect(within(cards[0]).getByLabelText('Number 1 in this list')).toBeInTheDocument();
		expect(within(cards[0]).getByRole('link', { name: 'View Agent 1' })).toHaveAttribute('href', `/agents/${agent(1)._id}`);
		expect(within(cards[0]).getByText('by @seed_nova')).toBeInTheDocument();
		expect(screen.getByRole('tab', { name: 'Top-ranked' })).toHaveAttribute('aria-selected', 'true');

		await user.click(screen.getByRole('tab', { name: 'Free' }));
		const free = await screen.findByRole('list', { name: 'Free' });
		expect(within(free).getByRole('heading', { name: 'Inbox Sorter' })).toBeInTheDocument();
		expect(screen.getByRole('tab', { name: 'Free' })).toHaveAttribute('aria-selected', 'true');
	});

	it('invites creators when a list is empty', async () => {
		renderWithProviders(<RankedAgents />, { mocks: [tabMock('top', [])], auth: { status: 'guest' } });
		expect(await screen.findByRole('heading', { name: 'No agents in this list yet' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Sell your agent' })).toHaveAttribute('href', '/signup');
	});
});

describe('RankedCreators', () => {
	it('lists the top creators with rank badges and counts', async () => {
		renderWithProviders(<RankedCreators />, {
			mocks: [{ request: { query: CreatorsListQuery, variables: topCreatorsVariables() }, result: { data: { getCreators: { __typename: 'Members', list: [creator(0), creator(1)], metaCounter: [] } } } }],
			auth: { status: 'guest' },
		});
		const list = await screen.findByRole('list', { name: 'Top Creators' });
		const cards = within(list).getAllByRole('listitem');
		expect(within(cards[0]).getByLabelText('Rank 1')).toHaveTextContent('1');
		expect(within(cards[0]).getByRole('link', { name: 'Creator 0' })).toHaveAttribute('href', `/members/${creator(0)._id}`);
		expect(cards[0]).toHaveTextContent('2 agents1 follower3 likes');
	});

	it('colors the badges #1–3 gold, silver, bronze (the /creators medals), then light grey', () => {
		expect(medalColors(1)).toEqual([rankMedals[1].bg, rankMedals[1].text]);
		expect(medalColors(3)).toEqual([rankMedals[3].bg, rankMedals[3].text]);
		expect(medalColors(6)).toEqual(['#EAECF0', '#344054']);
	});
});

describe('BriefsFeed', () => {
	it('repeats short lists up to four and doubles the loop; every repeat is a copy', () => {
		const loop = feedLoop(['a', 'b']);
		expect(loop.map(({ item }) => item)).toEqual(['a', 'b', 'a', 'b', 'a', 'b', 'a', 'b']);
		expect(loop.map(({ copy }) => copy)).toEqual([false, false, true, true, true, true, true, true]);
		expect(feedLoop([])).toEqual([]);
	});

	it('shows each open brief once to screen readers and Tab', async () => {
		renderWithProviders(<BriefsFeed />, {
			mocks: [{ request: { query: BriefsListQuery, variables: latestBriefsVariables() }, result: { data: { getBriefs: { __typename: 'Briefs', list: [brief(0), brief(1)], metaCounter: [] } } } }],
			auth: { status: 'guest' },
		});
		const links = await screen.findAllByRole('link', { name: /Brief \d/ });
		expect(links.map((link) => link.getAttribute('href'))).toEqual([`/briefs/${brief(0)._id}`, `/briefs/${brief(1)._id}`]);
		const hidden = document.querySelectorAll('a[aria-hidden="true"]');
		expect(hidden).toHaveLength(6);
		hidden.forEach((link) => expect(link).toHaveAttribute('tabindex', '-1'));
		expect(links[0]).toHaveTextContent('$1,200');
		expect(links[1]).toHaveTextContent('Open to offers');
	});

	it('is left out without open briefs', async () => {
		const { container } = renderWithProviders(<BriefsFeed />, {
			mocks: [{ request: { query: BriefsListQuery, variables: latestBriefsVariables() }, result: { data: { getBriefs: { __typename: 'Briefs', list: [], metaCounter: [] } } } }],
			auth: { status: 'guest' },
		});
		await new Promise((resolve) => setTimeout(resolve, 20));
		expect(container).toBeEmptyDOMElement();
	});
});

describe('HowItWorks', () => {
	it('shows the example window of the chosen side and step', async () => {
		const user = userEvent.setup();
		renderWithProviders(<HowItWorks />, { auth: { status: 'guest' } });

		expect(screen.getByRole('heading', { name: 'Answer customer emails' })).toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: /No match\? Post a brief/ }));
		expect(screen.getByRole('button', { name: /No match\? Post a brief/ })).toHaveAttribute('aria-pressed', 'true');
		expect(screen.getByRole('heading', { name: 'Shipment status updates in Slack' })).toBeInTheDocument();

		await user.click(screen.getByRole('tab', { name: 'For creators' }));
		expect(screen.getByRole('tab', { name: 'For creators' })).toHaveAttribute('aria-selected', 'true');
		// A new side starts at its first step.
		expect(screen.getByRole('heading', { name: 'Blog Drafter' })).toBeInTheDocument();
		expect(screen.getByText('Demo link')).toBeInTheDocument();
	});
});

describe('Faq', () => {
	it('opens one answer at a time, the first one to start', async () => {
		const user = userEvent.setup();
		renderWithProviders(<Faq />, { auth: { status: 'guest' } });

		const pricing = screen.getByRole('button', { name: 'How does pricing work?' });
		const brief = screen.getByRole('button', { name: 'What is a brief?' });
		expect(pricing).toHaveAttribute('aria-expanded', 'true');
		expect(brief).toHaveAttribute('aria-expanded', 'false');

		await user.click(brief);
		expect(brief).toHaveAttribute('aria-expanded', 'true');
		expect(pricing).toHaveAttribute('aria-expanded', 'false');
		expect(screen.getByRole('region', { name: 'What is a brief?' })).toHaveTextContent(/Budget and deadline are optional/);

		await user.click(brief);
		expect(brief).toHaveAttribute('aria-expanded', 'false');
	});
});

describe('bento demos', () => {
	it('colors lead scores by band', () => {
		expect(scoreColors(92)[0]).toBe('#C01048');
		expect(scoreColors(74)[0]).toBe('#F79009');
		expect(scoreColors(58)[0]).toBe('#4338CA');
		expect(scoreColors(31)[0]).toBe('#98A2B3');
	});
});
