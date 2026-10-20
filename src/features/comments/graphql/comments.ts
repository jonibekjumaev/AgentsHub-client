import { graphql } from '@/gql';

/** One comment as the list shows it. memberData is the author (no contacts are asked for). */
export const CommentItemFragment = graphql(`
	fragment CommentItem on Comment {
		_id
		commentContent
		commentGroup
		commentRefId
		memberId
		createdAt
		memberData {
			_id
			memberNick
			memberFullName
			memberImage
		}
	}
`);

/**
 * Comments of one target. Public (§3.8): BRIEF comments are readable for OPEN and CLOSED briefs, PRODUCT
 * comments for ACTIVE products. `search.commentGroup` is required next to `commentRefId` (D-16).
 * NOT_FOUND means the target is not available, not "no comments".
 */
export const CommentsQuery = graphql(`
	query Comments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				...CommentItem
			}
			metaCounter {
				total
			}
		}
	}
`);

/** Logged-in members; OPEN briefs / ACTIVE products only, else NOT_FOUND (§3.8). */
export const CreateCommentMutation = graphql(`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
			...CommentItem
		}
	}
`);

/** Deleting is an update to DELETE, own comments only; the target's counter drops by 1 (B19). */
export const DeleteCommentMutation = graphql(`
	mutation DeleteComment($input: CommentUpdate!) {
		updateComment(input: $input) {
			_id
			commentStatus
		}
	}
`);
