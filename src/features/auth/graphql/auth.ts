import { graphql } from '@/gql';

// login/signup responses have no contacts (no token yet) — AuthProvider loads the full member afterwards.
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
