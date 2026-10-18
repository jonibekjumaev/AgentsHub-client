import type { MockedResponse } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Me } from '@/auth';
import { renderWithProviders } from '@/test/renderWithProviders';
import { AgentViewerQuery } from '../graphql/agentDetail';
import { AGENT_ID, CREATOR_ID } from '../test/fixtures';
import { CreatorContacts } from './CreatorContacts';

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

const viewerMock = (memberEmail: string | null, memberWhatsapp: string | null): MockedResponse => ({
	request: { query: AgentViewerQuery, variables: { productId: AGENT_ID } },
	result: {
		data: {
			getProduct: {
				__typename: 'Product',
				_id: AGENT_ID,
				productViews: 2301,
				meLiked: [],
				memberData: { __typename: 'Member', _id: CREATOR_ID, memberEmail, memberWhatsapp },
			},
		},
	},
});

describe('CreatorContacts', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl(`/agents/${AGENT_ID}`);
	});

	it('shows guests a login prompt that comes back to this agent, and asks the API nothing', () => {
		// No mocks: a query would leave the box loading instead of showing the prompt.
		renderWithProviders(<CreatorContacts agentId={AGENT_ID} />, { auth: { status: 'guest' } });

		expect(screen.getByRole('heading', { name: 'Contacts are for members' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Log in to contact' })).toHaveAttribute(
			'href',
			`/login?next=%2Fagents%2F${AGENT_ID}`,
		);
		expect(screen.queryByText('Email')).not.toBeInTheDocument();
	});

	it('shows a skeleton while the session is unknown', () => {
		renderWithProviders(<CreatorContacts agentId={AGENT_ID} />, { auth: { status: 'loading' } });
		expect(screen.getByRole('status', { name: 'Loading contacts…' })).toBeInTheDocument();
		expect(screen.queryByRole('link', { name: 'Log in to contact' })).not.toBeInTheDocument();
	});

	it('loads and links the contacts for a signed-in member', async () => {
		renderWithProviders(<CreatorContacts agentId={AGENT_ID} />, {
			auth: { status: 'member', me: member },
			mocks: [viewerMock('hello@nova.dev', '+998901112233')],
		});

		expect(screen.getByRole('status', { name: 'Loading contacts…' })).toBeInTheDocument();
		const email = await screen.findByRole('link', { name: 'hello@nova.dev' });
		expect(email).toHaveAttribute('href', 'mailto:hello@nova.dev');
		expect(screen.getByRole('link', { name: '+998901112233' })).toHaveAttribute('href', 'https://wa.me/998901112233');
		expect(screen.getByText('Visible because you are signed in.')).toBeInTheDocument();
	});

	it('says so when the creator has no contacts', async () => {
		renderWithProviders(<CreatorContacts agentId={AGENT_ID} />, {
			auth: { status: 'member', me: member },
			mocks: [viewerMock(null, null)],
		});
		expect(await screen.findByText('This creator hasn’t added contact details yet.')).toBeInTheDocument();
	});

	it('shows an error with retry when the contacts fail to load', async () => {
		const user = userEvent.setup();
		renderWithProviders(<CreatorContacts agentId={AGENT_ID} />, {
			auth: { status: 'member', me: member },
			mocks: [
				{ request: { query: AgentViewerQuery, variables: { productId: AGENT_ID } }, error: new TypeError('Failed to fetch') },
				viewerMock('hello@nova.dev', null),
			],
		});

		const alert = await screen.findByRole('alert');
		expect(alert).toHaveTextContent('We couldn’t load the contacts');
		await user.click(within(alert).getByRole('button', { name: 'Try again' }));
		expect(await screen.findByRole('link', { name: 'hello@nova.dev' })).toBeInTheDocument();
	});

	it('treats a non-ACTIVE member like a guest', () => {
		renderWithProviders(<CreatorContacts agentId={AGENT_ID} />, {
			auth: { status: 'member', me: { ...member, memberStatus: 'BLOCK' } },
		});
		expect(screen.getByRole('link', { name: 'Log in to contact' })).toBeInTheDocument();
	});
});
