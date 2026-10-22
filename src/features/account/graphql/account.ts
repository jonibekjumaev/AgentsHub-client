import { graphql } from '@/gql';

/** The signed-in member's editable profile (getMe returns the own contacts, D-33). */
export const AccountQuery = graphql(`
	query Account {
		getMe {
			_id
			memberType
			memberNick
			memberFullName
			memberImage
			memberPhone
			memberEmail
			memberWhatsapp
			memberDesc
		}
	}
`);

/**
 * updateMember (§3.1): no password here (D-24). Returns the stored member; Apollo merges it into
 * Member:<id>, so the header (MeQuery) updates without a refetch.
 */
export const UpdateAccountMutation = graphql(`
	mutation UpdateAccount($input: MemberUpdate!) {
		updateMember(input: $input) {
			_id
			memberNick
			memberFullName
			memberImage
			memberPhone
			memberEmail
			memberWhatsapp
			memberDesc
		}
	}
`);

/** D-24: returns true, no new token; other sessions stay signed in. */
export const ChangePasswordMutation = graphql(`
	mutation ChangePassword($input: ChangePasswordInput!) {
		changePassword(input: $input)
	}
`);

/** One profile picture: "uploads/member/<uuid>.png". */
export const UploadAvatarMutation = graphql(`
	mutation UploadAvatar($file: Upload!) {
		imageUploader(file: $file, target: "member")
	}
`);
