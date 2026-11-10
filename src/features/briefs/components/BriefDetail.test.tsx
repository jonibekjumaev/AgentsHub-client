import type { ReactNode } from 'react';
import type { MockedResponse } from '@apollo/client/testing';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Me } from '@/auth';
import { CommentsQuery, briefCommentTarget, commentsVariables } from '@/features/comments';
import { renderWithProviders } from '@/test/renderWithProviders';
import { BriefDetailQuery, BriefViewerQuery } from '../graphql/briefs';
import { SaveBriefMutation } from '../graphql/saved';
import { AUTHOR_ID, BRIEF_ID, makeBriefDetail } from '../test/fixtures';
import { BriefDetail } from './BriefDetail';

vi.mock('next/head', () => ({ default: ({ children }: { children: ReactNode }) => <>{children}</> }));

const detailMock = (brief = makeBriefDetail()): MockedResponse => ({
	request: { query: BriefDetailQuery, variables: { briefId: BRIEF_ID } },
	result: { data: { getBrief: brief } },
});

const commentsMock = (): MockedResponse => ({
	request: { query: CommentsQuery, variables: commentsVariables(briefCommentTarget(BRIEF_ID)) },
	result: { data: { getComments: { __typename: 'Comments', list: [], metaCounter: [{ __typename: 'TotalCounter', total: 0 }] } } },
});

const viewerMock = (meSaved: boolean | null = false): MockedResponse => ({
	request: { query: BriefViewerQuery, variables: { briefId: BRIEF_ID } },
	result: {
		data: {
			getBrief: {
				__typename: 'Brief',
				_id: BRIEF_ID,
				briefViews: 42,
				meSaved,
				memberData: { __typename: 'Member', _id: AUTHOR_ID, memberEmail: 'orders@bakery.test', memberWhatsapp: '+998901234567' },
			},
		},
	},
});

const creator = { _id: '6ac7992dd87bde19b9216c99', memberType: 'CREATOR', memberStatus: 'ACTIVE', memberNick: 'nova_labs' } as Me;

describe('BriefDetail (S4)', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl(`/briefs/${BRIEF_ID}`);
	});

	it('renders an open brief for a guest per BriefDetail.html', async () => {
		renderWithProviders(<BriefDetail briefId={BRIEF_ID} />, { mocks: [detailMock(), commentsMock()], auth: { status: 'guest' } });

		expect(await screen.findByRole('heading', { level: 1, name: 'AI agent to take WhatsApp orders for a bakery' })).toBeInTheDocument();
		const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' });
		expect(within(crumbs).getByRole('link', { name: 'Briefs' })).toHaveAttribute('href', '/briefs');

		expect(screen.getByText('$500')).toBeInTheDocument();
		expect(screen.getByText('USD')).toBeInTheDocument();
		expect(screen.getByText(/We are a small bakery/).textContent).toContain('\n');
		expect(screen.getByRole('link', { name: 'Profile of @dilnoza_bakes' })).toHaveAttribute('href', `/members/${AUTHOR_ID}`);
		expect(screen.getByText('2 briefs')).toBeInTheDocument();

		// Contacts and the comment box are for members (D-07/D-23, §3.8).
		expect(screen.getByRole('link', { name: 'Log in to see contacts' })).toHaveAttribute('href', `/login?next=%2Fbriefs%2F${BRIEF_ID}`);
		expect(await screen.findByText('No questions yet. Be the first to ask.')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Log in to comment' })).toBeInTheDocument();
		expect(screen.queryByRole('textbox', { name: /Ask a question/ })).not.toBeInTheDocument();
	});

	describe('Save (D-47)', () => {
		const saveButton = () => screen.findByRole('button', { name: /AI agent to take WhatsApp orders for a bakery$/ });

		it('a creator saves the brief; the button turns into "Saved"', async () => {
			const user = userEvent.setup();
			const saveMock: MockedResponse = {
				request: { query: SaveBriefMutation, variables: { briefId: BRIEF_ID } },
				delay: 50,
				result: { data: { saveBrief: { __typename: 'Brief', _id: BRIEF_ID, meSaved: true } } },
			};
			renderWithProviders(<BriefDetail briefId={BRIEF_ID} />, {
				mocks: [detailMock(), commentsMock(), viewerMock(false), saveMock],
				auth: { status: 'member', me: creator },
			});

			const save = await saveButton();
			await waitFor(() => expect(save).not.toHaveAttribute('aria-disabled'));
			expect(save).toHaveAccessibleName('Save brief: AI agent to take WhatsApp orders for a bakery');
			expect(save).toHaveTextContent('Save');

			await user.click(save);
			const saved = screen.getByRole('button', { name: 'Remove from saved: AI agent to take WhatsApp orders for a bakery' });
			expect(saved).toHaveAttribute('aria-pressed', 'true');
			expect(saved).toHaveTextContent('Saved');
		});

		it('a guest sees the button; it sends them to login and back', async () => {
			const user = userEvent.setup();
			renderWithProviders(<BriefDetail briefId={BRIEF_ID} />, { mocks: [detailMock(), commentsMock()], auth: { status: 'guest' } });

			await user.click(await saveButton());
			expect(mockRouter.asPath).toBe(`/login?next=${encodeURIComponent(`/briefs/${BRIEF_ID}`)}`);
		});

		it('the author of the brief gets no Save button', async () => {
			const author = { ...creator, _id: AUTHOR_ID, memberType: 'USER' } as Me;
			renderWithProviders(<BriefDetail briefId={BRIEF_ID} />, {
				mocks: [detailMock(), commentsMock(), viewerMock(false)],
				auth: { status: 'member', me: author },
			});

			expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
			expect(screen.queryByRole('button', { name: /Save brief/ })).not.toBeInTheDocument();
		});
	});

	it('keeps a closed brief readable, with its comments but no comment box (D-30)', async () => {
		const closed = makeBriefDetail({ briefStatus: 'CLOSED', closedAt: '2026-10-15T10:00:00.000Z' });
		renderWithProviders(<BriefDetail briefId={BRIEF_ID} />, {
			mocks: [detailMock(closed), commentsMock(), viewerMock()],
			auth: { status: 'member', me: creator },
		});

		expect(await screen.findByText('Closed')).toBeInTheDocument();
		expect(screen.getByText(/Closed on/)).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Briefs' })).toHaveAttribute('href', '/briefs?status=closed');
		expect(await screen.findByText(/This brief is closed/)).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Post question' })).not.toBeInTheDocument();
	});

	it('shows contacts, the comment box and the creator hint to a signed-in creator', async () => {
		renderWithProviders(<BriefDetail briefId={BRIEF_ID} />, {
			mocks: [detailMock(), commentsMock(), viewerMock()],
			auth: { status: 'member', me: creator },
		});

		expect(await screen.findByRole('link', { name: 'orders@bakery.test' })).toHaveAttribute('href', 'mailto:orders@bakery.test');
		expect(screen.getByRole('link', { name: '+998901234567' })).toHaveAttribute('href', 'https://wa.me/998901234567');
		expect(screen.getByText('Visible because you are signed in.')).toBeInTheDocument();
		expect(await screen.findByRole('button', { name: 'Post question' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Go to my agents' })).toHaveAttribute('href', '/dashboard/agents');
	});

	it('uses the feed language: status and category pills, "Open to offers" without a budget (D-04)', async () => {
		renderWithProviders(<BriefDetail briefId={BRIEF_ID} />, {
			mocks: [detailMock(makeBriefDetail({ briefBudget: null, briefDeadline: null })), commentsMock()],
			auth: { status: 'guest' },
		});

		const title = await screen.findByRole('heading', { level: 1, name: 'AI agent to take WhatsApp orders for a bakery' });
		const band = title.closest('header') as HTMLElement;
		expect(within(band).getByText('Open')).toBeInTheDocument();
		expect(within(band).getByText('Sales')).toBeInTheDocument();
		expect(screen.getAllByText('Open to offers').length).toBeGreaterThan(0);
		expect(screen.getByText('No deadline')).toBeInTheDocument();
	});

	it('marks a passed deadline on an open brief (D-05: never closed automatically)', async () => {
		renderWithProviders(<BriefDetail briefId={BRIEF_ID} />, {
			mocks: [detailMock(makeBriefDetail({ briefDeadline: '2020-01-10T00:00:00.000Z' })), commentsMock()],
			auth: { status: 'guest' },
		});

		expect(await screen.findByText('The deadline has passed.')).toBeInTheDocument();
		// still OPEN (nothing closes it), shown as past its deadline
		expect(screen.getByText('Past deadline')).toBeInTheDocument();
	});
});
