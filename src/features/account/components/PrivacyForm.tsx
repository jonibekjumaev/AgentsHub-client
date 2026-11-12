import { useId } from 'react';
import { useMutation } from '@apollo/client';
import { Box, FormControlLabel, Switch, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { toErrorKey } from '@/shared/lib/errors';
import { useToast } from '@/shared/ui/toast';
import { home } from '@/theme/tokens';
import { UpdateBrowsePrivatelyMutation } from '../graphql/account';

type PrivacyFormProps = { browsePrivately: boolean };

/**
 * D-42 "Browse privately": saved as soon as it is switched (no Save button). The switch shows the stored
 * value: Apollo writes the mutation result into Member:<id>, AccountQuery re-renders with it. While the
 * request runs the switch is disabled, so it never shows a value the server has not accepted.
 */
export const PrivacyForm = ({ browsePrivately }: PrivacyFormProps) => {
	const { t } = useTranslation(['account', 'errors']);
	const toast = useToast();
	const hintId = useId();
	const [update, { loading }] = useMutation(UpdateBrowsePrivatelyMutation);

	const onChange = async (checked: boolean) => {
		try {
			await update({ variables: { input: { memberBrowsePrivately: checked } } });
			toast.success(t(checked ? 'account:privacy.on' : 'account:privacy.off'));
		} catch (error) {
			toast.error(t(toErrorKey(error)));
		}
	};

	return (
		<Box
			component="section"
			aria-labelledby="privacy-settings"
			sx={{ p: 6, bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: home.radius.card }}
		>
			<Typography id="privacy-settings" variant="h2" sx={{ fontSize: 20 }}>
				{t('account:privacy.title')}
			</Typography>
			<FormControlLabel
				sx={{ mt: 3, ml: 0, gap: 3, alignItems: 'flex-start' }}
				control={
					<Switch
						checked={browsePrivately}
						disabled={loading}
						onChange={(event) => void onChange(event.target.checked)}
						inputProps={{ role: 'switch', 'aria-describedby': hintId }}
					/>
				}
				label={
					<Box sx={{ pt: 1 }}>
						<Typography sx={{ fontWeight: 700, color: 'ink' }}>{t('account:privacy.label')}</Typography>
						<Typography id={hintId} variant="body2" sx={{ mt: 0.5, color: 'muted' }}>
							{t('account:privacy.hint')}
						</Typography>
					</Box>
				}
			/>
		</Box>
	);
};
