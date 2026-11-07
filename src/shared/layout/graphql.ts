import { graphql } from '@/gql';

/**
 * The counters next to the dashboard sidebar items. Same Member:<id> as the overview and the
 * profile, so a refetch there updates the sidebar too.
 */
export const DashboardNavCountsQuery = graphql(`
	query DashboardNavCounts {
		getMe {
			_id
			memberProducts
			memberBriefs
			memberArticles
			memberFollowers
			memberFollowings
		}
	}
`);
