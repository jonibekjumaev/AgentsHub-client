import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { setToken, useAuth } from '@/auth';
import type { AuthErrorMode } from '@/apollo/errorLink';
import type { MemberInput } from '@/gql/graphql';
import { toErrorKey } from '@/shared/lib/errors';
import { SignupMutation } from '../graphql/auth';
import { safeNextPath } from './redirect';

const context: { authErrors: AuthErrorMode } = { authErrors: 'ignore' };

export const useSignup = () => {
	const router = useRouter();
	const { refetchMe } = useAuth();
	const [mutate, { loading, error, reset }] = useMutation(SignupMutation, { context });

	/** Resolves true after redirecting; false on error (read `errorKey`; field errors come in slice S1). */
	const signup = async (input: MemberInput): Promise<boolean> => {
		try {
			const { data } = await mutate({ variables: { input } });
			const member = data?.signup;
			if (!member?.accessToken) return false;

			setToken(member.accessToken, member._id);
			await refetchMe();
			await router.push(safeNextPath(router.query.next));
			return true;
		} catch {
			return false;
		}
	};

	return { signup, loading, errorKey: error ? toErrorKey(error) : null, reset };
};
