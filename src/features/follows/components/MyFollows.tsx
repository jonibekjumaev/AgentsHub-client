import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { FOLLOWS_TABS, followsHref, followsTab } from '@/shared/layout/navigation';
import { FollowList } from './FollowList';

/**
 * /dashboard/follows?tab=followers|following. The sidebar has an item for each list, so the open
 * list lives in the URL (?tab=); without it a creator sees followers first, a user who they follow.
 */
export const MyFollows = () => {
	const { t } = useTranslation('follows');
	const { me } = useAuth();
	const { query } = useRouter();
	if (!me) return null; // DashboardLayout renders this for a signed-in member only
	const kind = followsTab(query.tab, me.memberType);

	return (
		<Stack spacing={6}>
			<div>
				<Typography variant="h1">{t('follows:mine.title')}</Typography>
				<Typography sx={{ mt: 1.5, color: 'muted' }}>{t('follows:mine.subtitle')}</Typography>
			</div>
			<Box role="tablist" aria-label={t('follows:mine.tabsLabel')} sx={{ display: 'flex', gap: 6, borderBottom: 1, borderColor: 'border' }}>
				{FOLLOWS_TABS.map((item) => {
					const selected = item === kind;
					return (
						<ButtonBase
							key={item}
							component={NextLink}
							href={followsHref(item)}
							replace
							shallow
							scroll={false}
							role="tab"
							id={`follows-tab-${item}`}
							aria-selected={selected}
							aria-controls="follows-panel"
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
