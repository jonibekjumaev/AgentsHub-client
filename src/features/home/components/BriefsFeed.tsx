import NextLink from 'next/link';
import { useQuery } from '@apollo/client';
import { Box, Button, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import { BriefBudget, BriefDeadline, BriefsListQuery, briefHref } from '@/features/briefs';
import type { BriefCardFragment } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { home } from '@/theme/tokens';
import { latestBriefsVariables } from '../lib/home';
import { SectionTitle, focusRingSx, frameSx, outlineButtonSx } from './kit';

/** Fewer briefs than this would leave a gap in the 470px box, so the list is repeated up to it. */
export const FEED_MIN_ITEMS = 4;
/** Seconds per brief, so the speed stays the same with more or fewer briefs. */
const SECONDS_PER_ITEM = 11;

const scrollUp = keyframes`
	from { transform: translateY(0); }
	to { transform: translateY(-50%); }
`;

/**
 * One loop of the feed: the briefs, repeated until there are at least FEED_MIN_ITEMS. `copy` is false
 * only for the first appearance of each brief; every repeat is hidden from screen readers and Tab.
 */
export const feedLoop = <T,>(items: T[]): { item: T; copy: boolean }[] => {
	if (items.length === 0) return [];
	const once: { item: T; copy: boolean }[] = [];
	for (let index = 0; once.length < Math.max(items.length, FEED_MIN_ITEMS); index += 1) {
		once.push({ item: items[index % items.length], copy: index >= items.length });
	}
	return [...once, ...once.map(({ item }) => ({ item, copy: true }))];
};

const FeedItem = ({ brief, copy }: { brief: BriefCardFragment; copy: boolean }) => {
	const { t } = useTranslation(['home', 'briefs', 'common']);
	const format = useFormat();
	return (
		<Box
			component={NextLink}
			href={briefHref(brief._id)}
			aria-hidden={copy || undefined}
			tabIndex={copy ? -1 : undefined}
			sx={{
				mb: 3.5,
				display: 'grid',
				gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'minmax(0, 1fr) auto' },
				gap: { xs: 3, sm: '8px 24px' },
				px: 6,
				py: 5.5,
				borderRadius: home.radius.step,
				bgcolor: 'surface',
				border: 1,
				borderColor: 'border',
				color: 'ink',
				textDecoration: 'none',
				transition: 'border-color 200ms',
				'&:hover': { borderColor: 'accentBorder' },
				...focusRingSx,
				outlineOffset: '-3px',
			}}
		>
			<Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
				<Box component="span" sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
					<Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: 13, fontWeight: 700, color: 'success.main' }}>
						<Box component="span" aria-hidden="true" sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'success.main' }} />
						{t('home:briefs.open')}
					</Box>
					<Box component="span" sx={{ px: 2.25, py: 0.75, borderRadius: '999px', bgcolor: 'accentSoft', fontSize: 12, fontWeight: 600, color: 'primary.main' }}>
						{t(`common:enums.AgentCategory.${brief.briefCategory}`)}
					</Box>
				</Box>
				<Box component="span" sx={{ fontSize: 19, fontWeight: 700, overflowWrap: 'anywhere' }}>
					{brief.briefTitle}
				</Box>
				<Box
					component="span"
					sx={{
						fontSize: 15,
						lineHeight: 1.5,
						color: 'bodySoft',
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
					}}
				>
					{brief.briefContent}
				</Box>
				<Box component="span" sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 4, rowGap: 1.5, fontSize: 13, color: 'muted' }}>
					{brief.memberData && <span>@{brief.memberData.memberNick}</span>}
					<time dateTime={brief.createdAt} suppressHydrationWarning>
						{format.relative(brief.createdAt)}
					</time>
					<span>
						{brief.briefComments
							? t('briefs:card.comments', { count: brief.briefComments, formatted: format.number(brief.briefComments) })
							: t('home:briefs.noComments')}
					</span>
				</Box>
			</Box>
			<Box component="span" sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 1, textAlign: { sm: 'right' } }}>
				<BriefBudget budget={brief.briefBudget} size={24} />
				<BriefDeadline brief={brief} />
			</Box>
		</Box>
	);
};

/**
 * "Businesses are asking for": the newest open briefs scrolling up slowly in a seamless loop. Hover or
 * keyboard focus pauses it; under reduced motion the box scrolls by hand and shows each brief once.
 */
export const BriefsFeed = () => {
	const { t } = useTranslation('home');
	const { data } = useQuery(BriefsListQuery, { variables: latestBriefsVariables() });
	const briefs = data?.getBriefs.list ?? [];
	if (briefs.length === 0) return null;
	const loop = feedLoop(briefs);
	const duration = Math.max(briefs.length, FEED_MIN_ITEMS) * SECONDS_PER_ITEM;

	return (
		<Box component="section" aria-labelledby="home-briefs" sx={{ ...frameSx, py: { xs: 16, md: 24 }, display: 'flex', flexDirection: 'column', gap: 6 }}>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 3 }}>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
					<SectionTitle id="home-briefs" sx={{ fontSize: 'clamp(28px, 3.2vw, 42px)' }}>
						{t('home:briefs.title')}
					</SectionTitle>
					<Typography sx={{ fontSize: 16, color: 'bodySoft' }}>{t('home:briefs.text')}</Typography>
				</Box>
				<Button component={NextLink} href="/briefs" variant="outlined" sx={{ ...outlineButtonSx, ...focusRingSx }}>
					{t('home:briefs.all')}
				</Button>
			</Box>
			<Box
				sx={{
					position: 'relative',
					height: 470,
					overflow: 'hidden',
					WebkitMaskImage: home.fadeYFeed,
					maskImage: home.fadeYFeed,
					'&:hover [data-feed], &:focus-within [data-feed]': { animationPlayState: 'paused' },
					'@media (prefers-reduced-motion: reduce)': { overflowY: 'auto', WebkitMaskImage: 'none', maskImage: 'none' },
				}}
			>
				<Box
					data-feed=""
					sx={{
						display: 'flex',
						flexDirection: 'column',
						animation: `${scrollUp} ${duration}s linear infinite`,
						'@media (prefers-reduced-motion: reduce)': {
							animation: 'none',
							// Each brief once: the repeats only exist for the loop.
							'& > [aria-hidden="true"]': { display: 'none' },
						},
					}}
				>
					{loop.map(({ item, copy }, index) => (
						<FeedItem key={`${item._id}-${index}`} brief={item} copy={copy} />
					))}
				</Box>
			</Box>
		</Box>
	);
};
