import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { useAuth } from '@/auth';
import type { AuthErrorMode } from '@/apollo/errorLink';
import type { LoginInput } from '@/gql/graphql';
import { ErrorReason, getErrorCode, getErrorReason, type ErrorKey } from '@/shared/lib/errors';
import { LoginMutation } from '../graphql/auth';
import { safeNextPath } from './redirect';

const context: { authErrors: AuthErrorMode } = { authErrors: 'ignore' };

/** D-27: one message for every failed login. Blocked (correct password only) and network get their own. */
const toLoginErrorKey = (error: unknown): ErrorKey => {
	if (getErrorCode(error) === 'NETWORK') return 'errors:network';
	if (getErrorReason(error) === ErrorReason.MemberBlocked) return 'errors:login.blocked';
	return 'errors:login.invalid';
};

export const useLogin = () => {
	const router = useRouter();
	const { startSession } = useAuth();
	const [mutate, { loading, error, reset }] = useMutation(LoginMutation, { context });

	/** Resolves true after redirecting; false on error (read `errorKey`). */
	const login = async (input: LoginInput): Promise<boolean> => {
		try {
			const { data } = await mutate({ variables: { input } });
			const member = data?.login;
			if (!member?.accessToken) return false;

			await startSession(member.accessToken);
			await router.push(safeNextPath(router.query.next));
			return true;
		} catch {
			return false;
		}
	};

	return { login, loading, errorKey: error ? toLoginErrorKey(error) : null, reset };
};
