import { graphql } from '@/gql';

/** One row of "My briefs" (MyBriefs.html). */
export const MyBriefRowFragment = graphql(`
	fragment MyBriefRow on Brief {
		_id
		briefTitle
		briefCategory
		briefStatus
		briefBudget
		briefDeadline
		briefViews
		briefComments
		createdAt
		updatedAt
		closedAt
	}
`);

/**
 * The signed-in USER's OPEN + CLOSED briefs (FRONTEND_MIGRATION §3.7), plus the tab counts:
 * `open` and `closed` ask for one row only, to read metaCounter. One request for the whole page.
 */
export const MyBriefsQuery = graphql(`
	query MyBriefs($input: MyBriefsInquiry!) {
		list: getMyBriefs(input: $input) {
			list {
				...MyBriefRow
			}
			metaCounter {
				total
			}
		}
		open: getMyBriefs(input: { page: 1, limit: 1, search: { briefStatus: OPEN } }) {
			metaCounter {
				total
			}
		}
		closed: getMyBriefs(input: { page: 1, limit: 1, search: { briefStatus: CLOSED } }) {
			metaCounter {
				total
			}
		}
	}
`);

/**
 * Close, reopen or delete (D-30). Reopening a brief whose deadline has passed sends a new deadline
 * (or null) in the same call (D-31).
 */
export const UpdateBriefStatusMutation = graphql(`
	mutation UpdateBriefStatus($input: BriefUpdate!) {
		updateBrief(input: $input) {
			_id
			briefStatus
			briefDeadline
			closedAt
			updatedAt
		}
	}
`);

/** The brief to edit, with the token. OPEN and CLOSED are returned to everyone, so ownership is checked on memberId. */
export const OwnerBriefQuery = graphql(`
	query OwnerBrief($briefId: String!) {
		getBrief(briefId: $briefId) {
			_id
			memberId
			briefStatus
			briefTitle
			briefCategory
			briefContent
			briefBudget
			briefDeadline
			updatedAt
		}
	}
`);

export const CreateBriefMutation = graphql(`
	mutation CreateBrief($input: BriefInput!) {
		createBrief(input: $input) {
			_id
			briefTitle
			briefStatus
		}
	}
`);

export const UpdateBriefMutation = graphql(`
	mutation UpdateBrief($input: BriefUpdate!) {
		updateBrief(input: $input) {
			_id
			briefStatus
			briefTitle
			briefCategory
			briefContent
			briefBudget
			briefDeadline
			updatedAt
		}
	}
`);
