import { graphql } from '@/gql';

/**
 * One row of the /briefs list (Briefs.html). Public fields only: no contacts. meSaved (D-47) is null in the server
 * render (no token); BriefsCatalog asks once more with the token for a signed-in member.
 */
export const BriefCardFragment = graphql(`
	fragment BriefCard on Brief {
		_id
		briefTitle
		briefContent
		briefCategory
		briefStatus
		briefBudget
		briefDeadline
		briefViews
		briefComments
		createdAt
		closedAt
		meSaved
		memberData {
			_id
			memberNick
		}
	}
`);

/** /briefs list. Public: SSR runs it without a token (CLAUDE.md rules 11–12). OPEN by default (§3.6). */
export const BriefsListQuery = graphql(`
	query BriefsList($input: BriefsInquiry!) {
		getBriefs(input: $input) {
			list {
				...BriefCard
			}
			metaCounter {
				total
			}
		}
	}
`);

/**
 * /briefs/[id] public data. OPEN and CLOSED briefs are readable by everyone, a DELETE one by nobody
 * (D-30 → NOT_FOUND). SSR runs it without a token: no view is recorded, no contacts asked for.
 */
export const BriefDetailQuery = graphql(`
	query BriefDetail($briefId: String!) {
		getBrief(briefId: $briefId) {
			_id
			briefTitle
			briefContent
			briefCategory
			briefStatus
			briefBudget
			briefDeadline
			briefViews
			briefComments
			createdAt
			updatedAt
			closedAt
			memberData {
				_id
				memberNick
				memberFullName
				memberImage
				memberBriefs
			}
		}
	}
`);

/**
 * Signed-in ACTIVE members only, in the browser after auth. The token makes the API return the
 * author's contacts (D-07/D-23), this member's meSaved (D-47) and record their view once (OPEN briefs,
 * never the owner's, §3.6).
 */
export const BriefViewerQuery = graphql(`
	query BriefViewer($briefId: String!) {
		getBrief(briefId: $briefId) {
			_id
			briefViews
			meSaved
			memberData {
				_id
				memberEmail
				memberWhatsapp
			}
		}
	}
`);

/** Live counts next to the /briefs filters (D-44). Public, no page or sort. */
export const BriefFacetsQuery = graphql(`
	query BriefFacets($input: BISearch!) {
		getBriefFacets(input: $input) {
			categories {
				value
				count
			}
			budgetTypes {
				value
				count
			}
			statuses {
				value
				count
			}
		}
	}
`);

/** The /briefs live badge (D-44): open briefs not past their deadline, and the sum of their fixed budgets. */
export const OpenBriefStatsQuery = graphql(`
	query OpenBriefStats {
		getOpenBriefStats {
			openNow
			budgetTotal
		}
	}
`);
