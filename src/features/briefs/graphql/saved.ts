import { graphql } from '@/gql';

/**
 * Save / unsave a brief (D-47). Idempotent, not a toggle: a double click or a retried request can't flip it back.
 * Both answer with the brief's _id and meSaved, so Apollo updates Brief:<id> on every page that shows it.
 */
export const SaveBriefMutation = graphql(`
	mutation SaveBrief($briefId: String!) {
		saveBrief(briefId: $briefId) {
			_id
			meSaved
		}
	}
`);

export const UnsaveBriefMutation = graphql(`
	mutation UnsaveBrief($briefId: String!) {
		unsaveBrief(briefId: $briefId) {
			_id
			meSaved
		}
	}
`);

/** /dashboard/saved-briefs: the member's saved briefs, latest saved first; OPEN and CLOSED only (D-47). */
export const SavedBriefsQuery = graphql(`
	query SavedBriefs($input: OrdinaryInquiry!) {
		getSavedBriefs(input: $input) {
			list {
				...BriefCard
			}
			metaCounter {
				total
			}
		}
	}
`);
