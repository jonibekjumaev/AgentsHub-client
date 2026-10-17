import { setContext } from '@apollo/client/link/context';
import { getToken } from '@/auth/session';

/** Browser only: adds the Bearer token when the member is logged in. */
export const authLink = setContext((_, { headers }) => {
	const token = getToken();
	return {
		headers: {
			...headers,
			...(token ? { authorization: `Bearer ${token}` } : {}),
		},
	};
});
