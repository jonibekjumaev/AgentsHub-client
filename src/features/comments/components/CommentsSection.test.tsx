import type { MockedResponse } from '@apollo/client/testing';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Me } from '@/auth';
import { renderWithProviders } from '@/test/renderWithProviders';
import { CommentsQuery, CreateCommentMutation, DeleteCommentMutation, RemoveCommentByAdminMutation } from '../graphql/comments';
import { briefCommentTarget, commentsVariables } from '../lib/comments';
import { CommentsSection } from './CommentsSection';

const BRIEF_ID = '6ac7992dd87bde19b9216d01';
const AUTHOR_ID = '6ac7992dd87bde19b9216d99';
const ME_ID = '6ac7992dd87bde19b9216c99';
const target = briefCommentTarget(BRIEF_ID);

const me = { _id: ME_ID, memberType: 'CREATOR', memberStatus: 'ACTIVE', memberNick: 'nova_labs' } as Me;

const comment = (index: number, memberId: string, nick: string, content: string) => ({
	__typename: 'Comment' as const,
	_id: `6ac7992dd87bde19b9216e${String(index).padStart(2, '0')}`,
	commentContent: content,
	commentGroup: 'BRIEF' as const,
	commentRefId: BRIEF_ID,
	memberId,
	createdAt: '2026-10-19T10:00:00.000Z',
	memberData: { __typename: 'Member' as const, _id: memberId, memberNick: nick, memberFullName: '', memberImage: '' },
});

const listMock = (list: ReturnType<typeof comment>[], total = list.length, limit = 20): MockedResponse => ({
	request: { query: CommentsQuery, variables: commentsVariables(target, limit) },
	result: { data: { getComments: { __typename: 'Comments', list, metaCounter: [{ __typename: 'TotalCounter', total }] } } },
});

const question = comment(1, ME_ID, 'nova_labs', 'Do you use the WhatsApp Business app?');
const answer = comment(2, AUTHOR_ID, 'dilnoza_bakes', 'The Business app for now.');

describe('CommentsSection (§3.8)', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl(`/briefs/${BRIEF_ID}`);
	});

	it('lists comments oldest first with the Author badge and delete on own comments only', async () => {
		renderWithProviders(<CommentsSection target={target} authorId={AUTHOR_ID} canPost />, {
			mocks: [listMock([question, answer])],
			auth: { status: 'member', me },
		});

		const list = await screen.findByRole('list', { name: /Questions and answers/ });
		const [first, second] = within(list).getAllByRole('listitem');
		expect(first).toHaveTextContent('Do you use the WhatsApp Business app?');
		expect(within(first).getByRole('button', { name: 'Delete your comment' })).toBeInTheDocument();
		expect(within(first).queryByText('Author')).not.toBeInTheDocument();
		expect(within(second).getByText('Author')).toBeInTheDocument();
		expect(within(second).queryByRole('button', { name: 'Delete your comment' })).not.toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /Questions and answers · 2/ })).toBeInTheDocument();
	});

	it('treats NOT_FOUND as "not available", not as "no comments"', async () => {
		renderWithProviders(<CommentsSection target={target} canPost />, {
			mocks: [
				{
					request: { query: CommentsQuery, variables: commentsVariables(target) },
					result: { errors: [{ message: 'No data found!', extensions: { code: 'NOT_FOUND' } }] },
				},
			],
			auth: { status: 'guest' },
		});

		expect(await screen.findByText("Comments aren't available for this page.")).toBeInTheDocument();
		expect(screen.queryByText('No questions yet. Be the first to ask.')).not.toBeInTheDocument();
	});

	it('posts a trimmed comment, then reloads the list', async () => {
		const user = userEvent.setup();
		const created = comment(3, ME_ID, 'nova_labs', 'Is Telegram fine too?');

		renderWithProviders(<CommentsSection target={target} authorId={AUTHOR_ID} canPost />, {
			mocks: [
				listMock([]),
				{
					request: {
						query: CreateCommentMutation,
						variables: { input: { commentGroup: 'BRIEF', commentRefId: BRIEF_ID, commentContent: 'Is Telegram fine too?' } },
					},
					result: { data: { createComment: created } },
				},
				listMock([created]),
			],
			auth: { status: 'member', me },
		});

		const box = await screen.findByRole('textbox', { name: /Ask a question/ });
		await user.type(box, '  Is Telegram fine too?  ');
		await user.click(screen.getByRole('button', { name: 'Post question' }));

		expect(await screen.findByText('Your question is posted.')).toBeInTheDocument();
		expect(await screen.findByText('Is Telegram fine too?', { selector: 'p' })).toBeInTheDocument();
		await waitFor(() => expect(box).toHaveValue(''));
	});

	it('does not send an empty comment', async () => {
		const user = userEvent.setup();
		renderWithProviders(<CommentsSection target={target} canPost />, { mocks: [listMock([])], auth: { status: 'member', me } });

		await user.click(await screen.findByRole('button', { name: 'Post question' }));
		expect(await screen.findByText('Write 1 to 1000 characters.')).toBeInTheDocument();
	});

	it('deletes an own comment after confirming', async () => {
		const user = userEvent.setup();
		renderWithProviders(<CommentsSection target={target} canPost />, {
			mocks: [
				listMock([question]),
				{
					request: { query: DeleteCommentMutation, variables: { input: { _id: question._id, commentStatus: 'DELETE' } } },
					result: { data: { updateComment: { __typename: 'Comment', _id: question._id, commentStatus: 'DELETE' } } },
				},
				listMock([]),
			],
			auth: { status: 'member', me },
		});

		await user.click(await screen.findByRole('button', { name: 'Delete your comment' }));
		const dialog = await screen.findByRole('dialog');
		await user.click(within(dialog).getByRole('button', { name: 'Delete comment' }));

		expect(await screen.findByText('Your comment was deleted.')).toBeInTheDocument();
		expect(await screen.findByText('No questions yet. Be the first to ask.')).toBeInTheDocument();
	});

	it('lets an admin remove any member\'s comment with removeCommentByAdmin (§3.12)', async () => {
		const user = userEvent.setup();
		const admin = { ...me, memberType: 'ADMIN' } as Me;
		renderWithProviders(<CommentsSection target={target} canPost />, {
			mocks: [
				listMock([answer]),
				{
					request: { query: RemoveCommentByAdminMutation, variables: { commentId: answer._id } },
					result: { data: { removeCommentByAdmin: { __typename: 'Comment', _id: answer._id } } },
				},
				listMock([]),
			],
			auth: { status: 'member', me: admin },
		});

		await user.click(await screen.findByRole('button', { name: 'Remove the comment by @dilnoza_bakes' }));
		const dialog = await screen.findByRole('dialog');
		await user.click(within(dialog).getByRole('button', { name: 'Delete comment' }));

		expect(await screen.findByText('The comment was removed.')).toBeInTheDocument();
		expect(await screen.findByText('No questions yet. Be the first to ask.')).toBeInTheDocument();
	});

	it('shows the locked note instead of the box when posting is closed', async () => {
		renderWithProviders(<CommentsSection target={target} canPost={false} lockedNote="This brief is closed." />, {
			mocks: [listMock([answer])],
			auth: { status: 'member', me },
		});

		expect(await screen.findByText('This brief is closed.')).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Post question' })).not.toBeInTheDocument();
	});
});
