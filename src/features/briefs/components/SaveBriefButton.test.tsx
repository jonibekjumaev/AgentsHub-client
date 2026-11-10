import { ApolloError, useQuery } from '@apollo/client';
import type { MockedResponse } from '@apollo/client/testing';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Me } from '@/auth';
import { renderWithProviders } from '@/test/renderWithProviders';
import { BriefsListQuery } from '../graphql/briefs';
import { SaveBriefMutation, UnsaveBriefMutation } from '../graphql/saved';
import { DEFAULT_BRIEF_FILTERS, briefsListVariables } from '../lib/listQuery';
import { AUTHOR_ID, makeBrief } from '../test/fixtures';
import { SaveBriefButton } from './SaveBriefButton';

const member = {
	_id: '6ac7992dd87bde19b9216c99',
	memberType: 'CREATOR',
	memberStatus: 'ACTIVE',
	memberNick: 'nova_labs',
} as Me;
const variables = briefsListVariables(DEFAULT_BRIEF_FILTERS);

const listMock = (meSaved: boolean | null): MockedResponse => ({
	request: { query: BriefsListQuery, variables },
	result: {
		data: {
			getBriefs: {
				__typename: 'Briefs',
				list: [makeBrief({ meSaved }, 1)],
				metaCounter: [{ __typename: 'TotalCounter', total: 1 }],
			},
		},
	},
});
const brief = makeBrief({}, 1);

const mutationMock = (
	query: typeof SaveBriefMutation | typeof UnsaveBriefMutation,
	field: string,
	meSaved: boolean,
): MockedResponse => ({
	request: { query, variables: { briefId: brief._id } },
	delay: 50,
	result: { data: { [field]: { __typename: 'Brief', _id: brief._id, meSaved } } },
});

/** The feed wiring: the button reads the brief from the list query, so cache writes re-render it. */
const Harness = () => {
	const { data } = useQuery(BriefsListQuery, { variables });
	const first = data?.getBriefs.list[0];
	return first ? (
		<>
			<h2>{first.briefTitle}</h2>
			<SaveBriefButton brief={first} />
		</>
	) : null;
};

const saveButton = () => screen.findByRole('button', { name: `Save brief: ${brief.briefTitle}` });

describe('SaveBriefButton (D-47)', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/briefs?category=sales');
	});

	it('sends a guest to login and back, without a request', async () => {
		const user = userEvent.setup();
		renderWithProviders(<Harness />, { mocks: [listMock(null)], auth: { status: 'guest' } });

		await user.click(await saveButton());
		expect(mockRouter.asPath).toBe(`/login?next=${encodeURIComponent('/briefs?category=sales')}`);
	});

	it('saves at once (optimistic) and keeps the server answer', async () => {
		const user = userEvent.setup();
		renderWithProviders(<Harness />, {
			mocks: [listMock(false), mutationMock(SaveBriefMutation, 'saveBrief', true)],
			auth: { status: 'member', me: member },
		});

		const save = await saveButton();
		expect(save).toHaveAttribute('aria-pressed', 'false');
		await user.click(save);

		const saved = screen.getByRole('button', { name: `Remove from saved: ${brief.briefTitle}` });
		expect(saved).toHaveAttribute('aria-pressed', 'true');
		await waitFor(() => expect(saved).not.toHaveAttribute('aria-disabled'));
	});

	it('unsaves a saved brief with unsaveBrief, not a toggle of saveBrief', async () => {
		const user = userEvent.setup();
		renderWithProviders(<Harness />, {
			mocks: [listMock(true), mutationMock(UnsaveBriefMutation, 'unsaveBrief', false)],
			auth: { status: 'member', me: member },
		});

		await user.click(await screen.findByRole('button', { name: `Remove from saved: ${brief.briefTitle}` }));
		expect(screen.getByRole('button', { name: `Save brief: ${brief.briefTitle}` })).toHaveAttribute(
			'aria-pressed',
			'false',
		);
	});

	it('rolls back and shows a toast when the save fails', async () => {
		const user = userEvent.setup();
		const failure: MockedResponse = {
			request: { query: SaveBriefMutation, variables: { briefId: brief._id } },
			delay: 50,
			error: new ApolloError({ graphQLErrors: [{ message: 'No data found!', extensions: { code: 'NOT_FOUND' } }] }),
		};
		renderWithProviders(<Harness />, { mocks: [listMock(false), failure], auth: { status: 'member', me: member } });

		await user.click(await saveButton());
		expect(await screen.findByRole('alert')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: `Save brief: ${brief.briefTitle}` })).toHaveAttribute(
			'aria-pressed',
			'false',
		);
	});

	it("is inactive for a member while their meSaved is unknown (the server render's list)", async () => {
		const user = userEvent.setup();
		renderWithProviders(<Harness />, { mocks: [listMock(null)], auth: { status: 'member', me: member } });

		const save = await saveButton();
		expect(save).toHaveAttribute('aria-disabled', 'true');
		await user.click(save); // no mock for the mutation: a request would fail the test with a toast
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
		expect(save).toHaveAttribute('aria-pressed', 'false');
	});

	it.each([
		['an admin (no library)', { ...member, memberType: 'ADMIN' } as Me],
		['the author of the brief', { ...member, _id: AUTHOR_ID, memberType: 'USER' } as Me],
	])('is not shown to %s', async (_label, me) => {
		renderWithProviders(<Harness />, { mocks: [listMock(false)], auth: { status: 'member', me } });

		expect(await screen.findByRole('heading', { name: brief.briefTitle })).toBeInTheDocument();
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});
});
