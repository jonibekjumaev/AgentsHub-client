import { graphql } from '@/gql';

/** The member of the stored token, with their own contacts (D-33). Logged in only. */
export const MeQuery = graphql(`
	query Me {
		getMe {
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
