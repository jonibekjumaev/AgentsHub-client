import { graphql } from '@/gql';

// Only the token is kept; AuthProvider loads the member (with contacts) through getMe afterwards.
export const LoginMutation = graphql(`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
			_id
			memberType
			accessToken
		}
	}
`);

export const SignupMutation = graphql(`
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
			_id
			memberType
			accessToken
		}
	}
`);
