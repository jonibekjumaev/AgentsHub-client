import { graphql } from '@/gql';

/**
 * The API has no "me" query. `checkAuth` is guarded, so it validates the token (UNAUTHENTICATED /
 * blocked FORBIDDEN); `getMember` alone is public and would silently treat a bad token as a guest.
 */
export const MeQuery = graphql(`
	query Me($memberId: String!) {
		checkAuth
		getMember(memberId: $memberId) {
			_id
			memberType
			memberStatus
			memberNick
			memberFullName
			memberImage
			memberPhone
			memberEmail
			memberWhatsapp
		}
	}
`);
