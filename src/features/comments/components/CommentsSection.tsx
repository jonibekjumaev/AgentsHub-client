import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useApolloClient, useMutation, useQuery, type ApolloCache } from '@apollo/client';
import { Box, Button, Link, OutlinedInput, Skeleton, Stack, Typography } from '@mui/material';
import { DeleteOutline as DeleteOutlineIcon, ForumOutlined as ForumOutlinedIcon, LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { CommentStatus } from '@/gql/enums';
import type { CommentItemFragment } from '@/gql/graphql';
import { ErrorCode, getErrorCode, toErrorKey } from '@/shared/lib/errors';
import { useFormat } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui/Avatar';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { ErrorState } from '@/shared/ui/ErrorState';
import { FormField } from '@/shared/ui/FormField';
import { SubmitButton } from '@/shared/ui/SubmitButton';
import { useToast } from '@/shared/ui/toast';
import { radiusPx } from '@/theme/tokens';
import { CommentsQuery, CreateCommentMutation, DeleteCommentMutation, RemoveCommentByAdminMutation } from '../graphql/comments';
import {
	COMMENTS_PAGE_SIZE,
	COMMENT_MAX,
	commentsVariables,
	isValidComment,
	normalizeComment,
	type CommentTarget,
} from '../lib/comments';

const cardSx = {
	display: 'flex',
	flexDirection: 'column',
	gap: 4,
	p: 6,
	bgcolor: 'surface',
	border: 1,
	borderColor: 'border',
	borderRadius: radiusPx.lg,
} as const;

const noteSx = { p: 4, borderRadius: radiusPx.md, bgcolor: 'ground', alignItems: 'center' } as const;

const memberHref = (memberId: string) => `/members/${memberId}`;

/** Keeps the target's own counter (briefComments / productComments) in step with the list (B19). */
const shiftCounter = (cache: ApolloCache<unknown>, target: CommentTarget, delta: 1 | -1) => {
	const id = cache.identify({ __typename: target.counter.typename, _id: target.refId });
	if (!id) return;
	cache.modify({
		id,
		fields: { [target.counter.field]: (value: number) => Math.max(0, (value ?? 0) + delta) },
	});
};

type CommentsSectionProps = {
	target: CommentTarget;
	/** The target's owner: their comments get the "Author" badge. */
	authorId?: string | null;
	/** False on a CLOSED brief or a PAUSED product: the list stays, the box goes (§3.8). */
	canPost: boolean;
	/** Shown instead of the box when `canPost` is false; nothing when left out. */
	lockedNote?: string;
	/** Placeholder of the box; the default is the generic one. */
	placeholder?: string;
	/** Texts for a discussion that isn't Q&A (articles): heading, field label and submit button. */
	labels?: { title?: string; field?: string; submit?: string };
};

const ListSkeleton = () => {
	const { t } = useTranslation('comments');
	return (
		<Stack spacing={4} role="status" aria-busy="true" aria-label={t('comments:loading')}>
			{[0, 1].map((index) => (
				<Stack key={index} direction="row" spacing={3}>
					<Skeleton variant="circular" width={36} height={36} aria-hidden="true" />
					<Box sx={{ flex: 1 }}>
						<Skeleton variant="text" width="30%" aria-hidden="true" />
						<Skeleton variant="text" width="80%" aria-hidden="true" />
					</Box>
				</Stack>
			))}
		</Stack>
	);
};

type CommentRowProps = {
	comment: CommentItemFragment;
	isAuthor: boolean;
	isMine: boolean;
	/** An admin may remove anyone's comment (removeCommentByAdmin); their own goes the normal way. */
	isModerator: boolean;
	onDelete: () => void;
};

const CommentRow = ({ comment, isAuthor, isMine, isModerator, onDelete }: CommentRowProps) => {
	const { t } = useTranslation('comments');
	const format = useFormat();
	const member = comment.memberData;
	const nick = member?.memberNick ?? t('comments:unknownMember');

	return (
		<Stack component="li" direction="row" spacing={3} sx={{ minWidth: 0 }}>
			<Avatar memberId={comment.memberId} name={member?.memberFullName || nick} image={member?.memberImage} size={36} />
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" alignItems="center">
					{member ? (
						<Link component={NextLink} href={memberHref(member._id)} sx={{ color: 'ink', fontWeight: 800, fontSize: 14 }}>
							@{nick}
						</Link>
					) : (
						<Typography component="span" sx={{ fontWeight: 800, fontSize: 14 }}>
							@{nick}
						</Typography>
					)}
					{isAuthor && (
						<Box
							component="span"
							sx={{ px: 2, py: 0.25, borderRadius: radiusPx.pill, bgcolor: 'accentSoft', color: 'primary.main', fontSize: 11, fontWeight: 800 }}
						>
							{t('comments:author')}
						</Box>
					)}
					<Typography variant="meta" component="span">
						·{' '}
						<time dateTime={comment.createdAt} suppressHydrationWarning>
							{format.relative(comment.createdAt)}
						</time>
					</Typography>
					{(isMine || isModerator) && (
						<Button
							size="small"
							color="error"
							variant="text"
							startIcon={<DeleteOutlineIcon />}
							onClick={onDelete}
							aria-label={t(isMine ? 'comments:deleteLabel' : 'comments:removeLabel', { nick })}
							sx={{ ml: 'auto', height: 28, minWidth: 0 }}
						>
							{t('comments:delete')}
						</Button>
					)}
				</Stack>
				{/* Plain text from a member (CLAUDE.md rule 7). */}
				<Typography sx={{ mt: 1, whiteSpace: 'pre-line', overflowWrap: 'anywhere', color: 'body', fontSize: 15 }}>
					{comment.commentContent}
				</Typography>
			</Box>
		</Stack>
	);
};

type CommentFormProps = {
	target: CommentTarget;
	placeholder?: string;
	labels?: CommentsSectionProps['labels'];
	onPosted: () => Promise<void> | void;
};

const CommentForm = ({ target, placeholder, labels, onPosted }: CommentFormProps) => {
	const { t } = useTranslation(['comments', 'errors']);
	const toast = useToast();
	const id = useId();
	const [text, setText] = useState('');
	const [touched, setTouched] = useState(false);
	const [create, { loading }] = useMutation(CreateCommentMutation);

	const valid = isValidComment(text);
	const error = touched && !valid ? t('comments:form.invalid', { max: COMMENT_MAX }) : undefined;

	const onSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setTouched(true);
		if (!valid || loading) return;
		try {
			await create({
				variables: { input: { commentGroup: target.group, commentRefId: target.refId, commentContent: normalizeComment(text) } },
				update: (cache) => shiftCounter(cache, target, 1),
			});
			setText('');
			setTouched(false);
			toast.success(t('comments:form.posted'));
			await onPosted();
		} catch (caught) {
			// NOT_FOUND: closed / paused / deleted in the meantime (§3.8). Keep the text so nothing is lost.
			toast.error(t(getErrorCode(caught) === ErrorCode.NotFound ? 'comments:errors.closed' : toErrorKey(caught)));
		}
	};

	return (
		<Box component="form" noValidate onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<FormField id={id} label={labels?.field ?? t('comments:form.label')} error={error} counter={{ count: text.length, max: COMMENT_MAX }}>
				{(control) => (
					<OutlinedInput
						multiline
						minRows={3}
						fullWidth
						value={text}
						onChange={(event) => setText(event.target.value)}
						onBlur={() => text && setTouched(true)}
						placeholder={placeholder ?? t('comments:form.placeholder')}
						error={Boolean(error)}
						id={control.id}
						inputProps={{
							maxLength: COMMENT_MAX,
							'aria-describedby': control['aria-describedby'],
							'aria-invalid': control['aria-invalid'],
						}}
					/>
				)}
			</FormField>
			<Stack direction="row" spacing={3} useFlexGap flexWrap="wrap" alignItems="center" justifyContent="space-between">
				<Typography variant="caption">{t('comments:form.public')}</Typography>
				<SubmitButton loading={loading} sx={{ height: 40 }}>
					{labels?.submit ?? t('comments:form.submit')}
				</SubmitButton>
			</Stack>
		</Box>
	);
};

const GuestPrompt = () => {
	const { t } = useTranslation('comments');
	const { asPath } = useRouter();
	return (
		<Stack direction="row" spacing={3} useFlexGap flexWrap="wrap" sx={noteSx}>
			<LockOutlinedIcon aria-hidden="true" sx={{ color: 'primary.main', fontSize: 20 }} />
			<Typography variant="body2" sx={{ color: 'bodySoft', flex: 1, minWidth: 180 }}>
				{t('comments:guest.text')}
			</Typography>
			<Button component={NextLink} href={`/login?${new URLSearchParams({ next: asPath })}`} variant="outlined" sx={{ height: 38 }}>
				{t('comments:guest.login')}
			</Button>
		</Stack>
	);
};

/**
 * Questions and answers under a brief or an agent (FRONTEND_MIGRATION §3.8, BriefDetail.html).
 * Public list (guests too), oldest first, "Show more" in steps. Members post and delete their own
 * comments; the server confirms first (no optimistic rows), then the list re-runs and the target's
 * counter moves by one in the cache.
 */
export const CommentsSection = ({ target, authorId, canPost, lockedNote, placeholder, labels }: CommentsSectionProps) => {
	const { t } = useTranslation(['comments', 'errors']);
	const { status, me } = useAuth();
	const toast = useToast();
	const client = useApolloClient();
	const headingId = useId();
	const [limit, setLimit] = useState(COMMENTS_PAGE_SIZE);
	const { data, previousData, loading, error, refetch } = useQuery(CommentsQuery, {
		variables: commentsVariables(target, limit),
	});
	const [remove, { loading: removing }] = useMutation(DeleteCommentMutation);
	const [removeByAdmin, { loading: removingByAdmin }] = useMutation(RemoveCommentByAdminMutation);
	const [pendingDelete, setPendingDelete] = useState<{ id: string; mine: boolean } | null>(null);
	const isAdmin = me?.memberType === 'ADMIN';
	const [dialogOpen, setDialogOpen] = useState(false);

	// While "Show more" loads, keep the comments already on screen.
	const shown = data ?? previousData;
	const comments = shown?.getComments.list ?? [];
	const total = shown?.getComments.metaCounter?.[0]?.total ?? 0;

	/** After a post the new comment is the last one: make sure the limit reaches it. */
	const reloadToEnd = async () => {
		const needed = total + 1;
		if (needed > limit) setLimit(Math.ceil(needed / COMMENTS_PAGE_SIZE) * COMMENTS_PAGE_SIZE);
		else await refetch();
	};

	const confirmDelete = async () => {
		if (!pendingDelete) return;
		try {
			if (pendingDelete.mine) {
				await remove({
					variables: { input: { _id: pendingDelete.id, commentStatus: CommentStatus.Delete } },
					update: (cache) => shiftCounter(cache, target, -1),
				});
				toast.success(t('comments:deleted'));
			} else {
				// the list only shows ACTIVE comments, so the server lowers the counter too (B19)
				await removeByAdmin({
					variables: { commentId: pendingDelete.id },
					update: (cache) => shiftCounter(cache, target, -1),
				});
				toast.success(t('comments:removed'));
			}
		} catch (caught) {
			toast.error(t(getErrorCode(caught) === ErrorCode.NotFound ? 'comments:errors.changed' : toErrorKey(caught)));
		}
		setDialogOpen(false);
		await client.refetchQueries({ include: [CommentsQuery] });
	};

	const body = () => {
		if (loading && !shown) return <ListSkeleton />;
		if (error && !shown) {
			// The target is gone or hidden: not the same as "no comments" (§3.8).
			if (getErrorCode(error) === ErrorCode.NotFound) {
				return (
					<Typography variant="body2" sx={{ color: 'bodySoft' }}>
						{t('comments:unavailable')}
					</Typography>
				);
			}
			return <ErrorState error={error} title={t('comments:errorTitle')} onRetry={() => void refetch()} />;
		}
		if (comments.length === 0) {
			return (
				<Stack direction="row" spacing={3} sx={noteSx}>
					<ForumOutlinedIcon aria-hidden="true" sx={{ color: 'muted' }} />
					<Typography variant="body2" sx={{ color: 'bodySoft' }}>
						{t('comments:empty')}
					</Typography>
				</Stack>
			);
		}
		return (
			<>
				<Box
					component="ul"
					aria-labelledby={headingId}
					sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}
				>
					{comments.map((comment) => (
						<CommentRow
							key={comment._id}
							comment={comment}
							isAuthor={Boolean(authorId) && comment.memberId === authorId}
							isMine={Boolean(me) && comment.memberId === me?._id}
							isModerator={isAdmin}
							onDelete={() => {
								setPendingDelete({ id: comment._id, mine: comment.memberId === me?._id });
								setDialogOpen(true);
							}}
						/>
					))}
				</Box>
				{comments.length < total && (
					<Button
						variant="outlined"
						onClick={() => setLimit((value) => value + COMMENTS_PAGE_SIZE)}
						disabled={loading}
						sx={{ alignSelf: 'flex-start', height: 38 }}
					>
						{t('comments:showMore', { count: total - comments.length })}
					</Button>
				)}
			</>
		);
	};

	const footer = () => {
		if (!canPost) {
			if (!lockedNote) return null;
			return (
				<Stack direction="row" spacing={3} sx={noteSx}>
					<LockOutlinedIcon aria-hidden="true" sx={{ color: 'muted', fontSize: 20 }} />
					<Typography variant="body2" sx={{ color: 'bodySoft' }}>
						{lockedNote}
					</Typography>
				</Stack>
			);
		}
		if (status === 'loading') return null;
		if (status !== 'member') return <GuestPrompt />;
		return <CommentForm target={target} placeholder={placeholder} labels={labels} onPosted={reloadToEnd} />;
	};

	return (
		<Box component="section" aria-labelledby={headingId} sx={cardSx}>
			<Typography id={headingId} variant="h2" sx={{ fontSize: 20 }}>
				{labels?.title ?? t('comments:title')}
				{shown && (
					<>
						{' '}
						<Box component="span" sx={{ color: 'muted', fontWeight: 600 }}>
							· {total}
						</Box>
					</>
				)}
			</Typography>
			{body()}
			{footer()}
			<ConfirmDialog
				open={dialogOpen}
				title={t('comments:confirm.title')}
				text={t('comments:confirm.text')}
				confirmLabel={t('comments:confirm.confirm')}
				destructive
				loading={removing || removingByAdmin}
				onConfirm={() => void confirmDelete()}
				onCancel={() => setDialogOpen(false)}
			/>
		</Box>
	);
};
