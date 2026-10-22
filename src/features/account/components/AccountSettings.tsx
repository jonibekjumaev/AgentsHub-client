import { useQuery } from '@apollo/client';
import { Skeleton, Stack, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { ErrorState } from '@/shared/ui/ErrorState';
import { AccountQuery } from '../graphql/account';
import { fromAccount } from '../lib/accountForm';
import { PasswordForm } from './PasswordForm';
import { ProfileForm } from './ProfileForm';

/** /dashboard/settings: profile and password. Own data, loaded in the browser with the token (rule 11). */
export const AccountSettings = () => {
	const { t } = useTranslation('account');
	// Always the stored values: a settings form must not start from a stale cache.
	const { data, loading, error, refetch } = useQuery(AccountQuery, { fetchPolicy: 'network-only' });
	const member = data?.getMe;

	return (
		<Stack spacing={6} sx={{ maxWidth: 860 }}>
			<div>
				<Typography variant="h1">{t('account:title')}</Typography>
				<Typography sx={{ mt: 1.5, color: 'muted' }}>{t('account:subtitle')}</Typography>
			</div>
			{loading && !member && (
				<Stack spacing={4} role="status" aria-busy="true" aria-label={t('account:loading')}>
					<Skeleton variant="rounded" height={420} aria-hidden="true" />
					<Skeleton variant="rounded" height={260} aria-hidden="true" />
				</Stack>
			)}
			{error && !member && <ErrorState error={error} title={t('account:errorTitle')} onRetry={() => void refetch()} />}
			{member && (
				<>
					<ProfileForm memberId={member._id} initialValues={fromAccount(member)} />
					<PasswordForm />
				</>
			)}
		</Stack>
	);
};
