import type { MockedResponse } from '@apollo/client/testing';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Me } from '@/auth';
import { renderWithProviders } from '@/test/renderWithProviders';
import { CreateBriefMutation } from '../../graphql/myBriefs';
import { NewBrief } from './BriefFormPages';

const user = { _id: '6ac7992dd87bde19b9216d99', memberType: 'USER', memberStatus: 'ACTIVE', memberNick: 'dilnoza_bakes' } as Me;
const NEW_ID = '6ac7992dd87bde19b9216d55';
const CONTENT = 'Customers order by WhatsApp. Confirm the order and add a row to our sheet.';

const createMock = (input: Record<string, unknown>): MockedResponse => ({
	request: { query: CreateBriefMutation, variables: { input } },
	result: { data: { createBrief: { __typename: 'Brief', _id: NEW_ID, briefTitle: input.briefTitle, briefStatus: 'OPEN' } } },
});

describe('NewBrief (S5)', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/dashboard/briefs/new');
	});

	it('shows every rule on an empty submit', async () => {
		const ui = userEvent.setup();
		renderWithProviders(<NewBrief />, { auth: { status: 'member', me: user } });

		await ui.click(screen.getByRole('button', { name: 'Publish brief' }));
		expect(await screen.findByText('Enter a title.')).toBeInTheDocument();
		expect(screen.getByText('Choose a category.')).toBeInTheDocument();
		expect(screen.getByText('Describe what you need.')).toBeInTheDocument();
		expect(screen.getByText('Enter a budget, or tick “Open to offers”.')).toBeInTheDocument();
	});

	it('publishes an "open to offers" brief without a budget or deadline and opens its page', async () => {
		const ui = userEvent.setup();
		renderWithProviders(<NewBrief />, {
			auth: { status: 'member', me: user },
			mocks: [createMock({ briefTitle: 'WhatsApp orders', briefCategory: 'SALES', briefContent: CONTENT })],
		});

		await ui.type(screen.getByRole('textbox', { name: /Title/ }), '  WhatsApp orders ');
		await ui.selectOptions(screen.getByRole('combobox', { name: /Category/ }), 'SALES');
		await ui.type(screen.getByRole('textbox', { name: /What do you need/ }), CONTENT);
		await ui.click(screen.getByRole('checkbox', { name: 'Open to offers (no fixed budget)' }));
		expect(screen.getByRole('spinbutton', { name: /Budget in USD/ })).toBeDisabled();
		await ui.click(screen.getByRole('button', { name: 'Publish brief' }));

		await waitFor(() => expect(mockRouter.asPath).toBe(`/briefs/${NEW_ID}`));
		expect(screen.getByText('“WhatsApp orders” is published.')).toBeInTheDocument();
	});
});
