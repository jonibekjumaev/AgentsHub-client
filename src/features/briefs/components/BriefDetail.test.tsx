import type { ReactNode } from 'react';
import type { MockedResponse } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Me } from '@/auth';
import { CommentsQuery, briefCommentTarget, commentsVariables } from '@/features/comments';
import { renderWithProviders } from '@/test/renderWithProviders';
import { BriefDetailQuery, BriefViewerQuery } from '../graphql/briefs';
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

const viewerMock = (): MockedResponse => ({
	request: { query: BriefViewerQuery, variables: { briefId: BRIEF_ID } },
	result: {
		data: {
			getBrief: {
				__typename: 'Brief',
				_id: BRIEF_ID,
				briefViews: 42,
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

	it('marks a passed deadline on an open brief (D-05: never closed automatically)', async () => {
		renderWithProviders(<BriefDetail briefId={BRIEF_ID} />, {
			mocks: [detailMock(makeBriefDetail({ briefDeadline: '2020-01-10T00:00:00.000Z' })), commentsMock()],
			auth: { status: 'guest' },
		});

		expect(await screen.findByText('The deadline has passed.')).toBeInTheDocument();
	});
});
