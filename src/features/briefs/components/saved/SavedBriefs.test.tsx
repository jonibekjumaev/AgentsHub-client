import type { MockedResponse } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Me } from '@/auth';
import { renderWithProviders } from '@/test/renderWithProviders';
import { SavedBriefsQuery } from '../../graphql/saved';
import { makeBrief } from '../../test/fixtures';
import { SAVED_BRIEFS_PAGE_SIZE, SavedBriefs } from './SavedBriefs';

const me = {
	_id: '6ac7992dd87bde19b9216c99',
	memberType: 'CREATOR',
	memberStatus: 'ACTIVE',
	memberNick: 'nova_labs',
} as Me;

const savedMock = (briefs: ReturnType<typeof makeBrief>[]): MockedResponse => ({
	request: { query: SavedBriefsQuery, variables: { input: { page: 1, limit: SAVED_BRIEFS_PAGE_SIZE } } },
	result: {
		data: {
			getSavedBriefs: {
				__typename: 'Briefs',
				list: briefs,
				metaCounter: briefs.length ? [{ __typename: 'TotalCounter', total: briefs.length }] : [],
			},
		},
	},
});

describe('SavedBriefs (D-47)', () => {
	it('lists the saved briefs as feed rows, each with its Save button on; a closed one keeps its pill', async () => {
		const open = makeBrief({ meSaved: true }, 0);
		const closed = makeBrief({ meSaved: true, briefStatus: 'CLOSED', closedAt: '2026-10-25T10:00:00.000Z' }, 1);
		renderWithProviders(<SavedBriefs />, { auth: { status: 'member', me }, mocks: [savedMock([open, closed])] });

		const list = await screen.findByRole('list', { name: 'Saved briefs' });
		const rows = within(list).getAllByRole('listitem');
		expect(rows).toHaveLength(2);
		expect(within(rows[0]).getByRole('link', { name: open.briefTitle })).toHaveAttribute('href', `/briefs/${open._id}`);
		expect(within(rows[0]).getByRole('button', { name: `Remove from saved: ${open.briefTitle}` })).toHaveAttribute(
			'aria-pressed',
			'true',
		);
		expect(within(rows[1]).getByText('Closed')).toBeInTheDocument();
	});

	it('explains an empty list with a way to the briefs', async () => {
		renderWithProviders(<SavedBriefs />, { auth: { status: 'member', me }, mocks: [savedMock([])] });

		expect(await screen.findByRole('heading', { name: 'No saved briefs yet' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Browse briefs' })).toHaveAttribute('href', '/briefs');
	});

	it('shows an error with a retry', async () => {
		const failure: MockedResponse = {
			request: { query: SavedBriefsQuery, variables: { input: { page: 1, limit: SAVED_BRIEFS_PAGE_SIZE } } },
			error: new Error('Network down'),
		};
		renderWithProviders(<SavedBriefs />, { auth: { status: 'member', me }, mocks: [failure] });

		expect(await screen.findByRole('alert')).toBeInTheDocument();
	});
});
