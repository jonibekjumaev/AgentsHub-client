import { graphql } from '@/gql';

/**
 * Who viewed the signed-in member's profile (D-42): one row per visitor with their latest visit,
 * newest first, last 90 days. Members who browse privately are only counted (privateCount).
 */
export const ProfileVisitorsQuery = graphql(`
	query ProfileVisitors($input: OrdinaryInquiry!) {
		getProfileVisitors(input: $input) {
			list {
				_id
				visitedAt
				visitor {
					_id
					memberType
					memberNick
					memberFullName
					memberImage
					memberFollowers
				}
			}
			metaCounter {
				total
			}
			privateCount
		}
	}
`);
