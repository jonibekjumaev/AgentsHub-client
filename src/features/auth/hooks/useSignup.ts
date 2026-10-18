import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { useAuth } from '@/auth';
import type { AuthErrorMode } from '@/apollo/errorLink';
import type { MemberInput } from '@/gql/graphql';
import { ErrorCode, getErrorCode, toErrorKey, type ErrorKey } from '@/shared/lib/errors';
import { SignupMutation } from '../graphql/auth';
import { safeNextPath } from './redirect';

const context: { authErrors: AuthErrorMode } = { authErrors: 'ignore' };

/** CONFLICT can't say which field is taken ("Already used member nick or phone"), so it is one form-level message. */
const toSignupErrorKey = (error: unknown): ErrorKey =>
	getErrorCode(error) === ErrorCode.Conflict ? 'errors:signup.conflict' : toErrorKey(error);

export const useSignup = () => {
	const router = useRouter();
	const { startSession } = useAuth();
	const [mutate, { loading, error, reset }] = useMutation(SignupMutation, { context });

	/** Resolves true after redirecting; false on error (read `errorKey`). */
	const signup = async (input: MemberInput): Promise<boolean> => {
		try {
			const { data } = await mutate({ variables: { input } });
			const member = data?.signup;
			if (!member?.accessToken) return false;

			await startSession(member.accessToken);
			await router.push(safeNextPath(router.query.next));
			return true;
		} catch {
			return false;
		}
	};

	return { signup, loading, errorKey: error ? toSignupErrorKey(error) : null, reset };
};
