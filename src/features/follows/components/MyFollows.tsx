import { useState } from 'react';
import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { FollowList } from './FollowList';

type Kind = 'followers' | 'following';

/**
 * /dashboard/follows. The sidebar calls it "Followers" for creators and "Following" for users
 * (DESIGN §5), so that list opens first; the other is one tab away.
 */
export const MyFollows = () => {
	const { t } = useTranslation('follows');
	const { me } = useAuth();
	const [kind, setKind] = useState<Kind>(me?.memberType === 'CREATOR' ? 'followers' : 'following');
	if (!me) return null; // DashboardLayout renders this for a signed-in member only

	return (
		<Stack spacing={6}>
			<div>
				<Typography variant="h1">{t('follows:mine.title')}</Typography>
				<Typography sx={{ mt: 1.5, color: 'muted' }}>{t('follows:mine.subtitle')}</Typography>
			</div>
			<Box role="tablist" aria-label={t('follows:mine.tabsLabel')} sx={{ display: 'flex', gap: 6, borderBottom: 1, borderColor: 'border' }}>
				{(['followers', 'following'] as const).map((item) => {
					const selected = item === kind;
					return (
						<ButtonBase
							key={item}
							role="tab"
							id={`follows-tab-${item}`}
							aria-selected={selected}
							aria-controls="follows-panel"
							onClick={() => setKind(item)}
							sx={{
								py: 3,
								mb: '-1px',
								fontSize: 14,
								fontWeight: selected ? 800 : 600,
								color: selected ? 'ink' : 'body',
								borderBottom: 2,
								borderColor: selected ? 'primary.main' : 'transparent',
							}}
						>
							{t(`follows:listLabel.${item}`)}
						</ButtonBase>
					);
				})}
			</Box>
			<Box role="tabpanel" id="follows-panel" aria-labelledby={`follows-tab-${kind}`}>
				<FollowList key={kind} memberId={me._id} kind={kind} />
			</Box>
		</Stack>
	);
};
