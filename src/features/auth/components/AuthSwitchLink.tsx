import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Link } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { safeNextPath } from '../hooks/redirect';

type AuthSwitchLinkProps = {
	to: 'login' | 'signup';
	/** i18n keys of the lead-in text and the link label. */
	promptKey: string;
	linkKey: string;
};

/** "New here? Create an account" — links to the other auth page, keeping a safe `next`. */
export const AuthSwitchLink = ({ to, promptKey, linkKey }: AuthSwitchLinkProps) => {
	const { t } = useTranslation('auth');
	const { query } = useRouter();
	const next = safeNextPath(query.next);

	return (
		<>
			{t(promptKey)}{' '}
			<Link component={NextLink} href={{ pathname: `/${to}`, query: next === '/' ? {} : { next } }} sx={{ fontWeight: 700 }}>
				{t(linkKey)}
			</Link>
		</>
	);
};
