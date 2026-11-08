import { useRef } from 'react';
import NextLink from 'next/link';
import { useQuery } from '@apollo/client';
import { Box, IconButton, Typography } from '@mui/material';
import { ChevronLeftRounded as ChevronLeftRoundedIcon, ChevronRightRounded as ChevronRightRoundedIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { AgentsListQuery, agentsHref, parseAgentFilters } from '@/features/agents';
import type { AgentCategory } from '@/gql/enums';
import { colors, home } from '@/theme/tokens';
import { CATEGORY_AGENT_NAMES, HOME_CATEGORIES, categoryAgentsVariables } from '../lib/home';
import { CategoryIcon, SectionTitle, categoryTint, displaySx, focusRingSx, frameSx } from './kit';

/** Card width + gap: one click of the arrows moves one card. */
export const CATEGORY_CARD_WIDTH = 290;
export const CATEGORY_SCROLL_STEP = CATEGORY_CARD_WIDTH + 16;

const CategoryCard = ({ category }: { category: AgentCategory }) => {
	const { t } = useTranslation(['home', 'common']);
	// Filled at build time (pages/index getStaticProps), so this reads the cache.
	const { data } = useQuery(AgentsListQuery, { variables: categoryAgentsVariables(category) });
	const names = (data?.getProducts.list ?? []).slice(0, CATEGORY_AGENT_NAMES).map((agent) => agent.productTitle);
	const [tint, ink] = categoryTint(category);

	return (
		<Box
			component="li"
			sx={{ flex: `0 0 ${CATEGORY_CARD_WIDTH}px`, scrollSnapAlign: 'start', display: 'flex' }}
		>
			<Box
				component={NextLink}
				href={agentsHref({ ...parseAgentFilters({}), categories: [category] })}
				sx={{
					flex: 1,
					minHeight: 300,
					boxSizing: 'border-box',
					display: 'flex',
					flexDirection: 'column',
					gap: 4.5,
					p: 6,
					borderRadius: home.radius.card,
					bgcolor: tint,
					color: 'ink',
					textDecoration: 'none',
					transition: 'transform 200ms ease',
					'&:hover': { transform: 'translateY(-3px)' },
					...focusRingSx,
				}}
			>
				<Box
					aria-hidden="true"
					sx={{ width: 56, height: 56, display: 'grid', placeItems: 'center', borderRadius: home.radius.tile, bgcolor: 'surface', color: ink }}
				>
					<CategoryIcon category={category} size={26} />
				</Box>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
					<Box component="span" sx={{ ...displaySx, fontSize: 26, lineHeight: 1.05 }}>
						{t(`common:enums.AgentCategory.${category}`)}
					</Box>
					<Typography component="span" sx={{ fontSize: 15, lineHeight: 1.45, color: 'body' }}>
						{t(`home:categories.items.${category}`)}
					</Typography>
				</Box>
				<Box sx={{ mt: 'auto', pt: 3.5, borderTop: 1, borderColor: home.softLine, display: 'flex', flexDirection: 'column', gap: 1 }}>
					<Typography component="span" sx={{ fontSize: 12, fontWeight: 600, color: 'bodySoft' }}>
						{names.length ? t('home:categories.agentsHere') : t('home:categories.noAgents')}
					</Typography>
					<Typography component="span" sx={{ fontSize: 15, fontWeight: 700, color: ink }}>
						{names.length ? names.join(', ') : t('home:categories.postBrief')}
					</Typography>
				</Box>
			</Box>
		</Box>
	);
};

const arrowSx = { width: 48, height: 48, border: 1, ...focusRingSx } as const;

/**
 * "Start with the job, not the tool": a swipeable row of the eight categories. Native horizontal
 * scrolling with scroll-snap (touch and trackpad work as is); the arrows scroll one card.
 */
export const CategorySlider = () => {
	const { t } = useTranslation('home');
	const track = useRef<HTMLUListElement>(null);
	const scroll = (direction: 1 | -1) => track.current?.scrollBy({ left: direction * CATEGORY_SCROLL_STEP, behavior: 'smooth' });

	return (
		<Box
			component="section"
			aria-labelledby="home-categories"
			sx={{ bgcolor: 'surface', borderTop: 1, borderBottom: 1, borderColor: 'borderSoft', overflow: 'hidden' }}
		>
			<Box sx={{ ...frameSx, py: { xs: 14, md: 22 }, display: 'flex', flexDirection: 'column', gap: 8 }}>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 5 }}>
					<Box sx={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 3 }}>
						<SectionTitle id="home-categories">{t('home:categories.title')}</SectionTitle>
						<Typography sx={{ fontSize: 17, lineHeight: 1.55, color: 'bodySoft' }}>{t('home:categories.text')}</Typography>
					</Box>
					<Box sx={{ display: 'flex', gap: 2.5 }}>
						<IconButton
							aria-label={t('home:categories.previous')}
							onClick={() => scroll(-1)}
							sx={{ ...arrowSx, borderColor: 'inputBorder', bgcolor: 'surface', color: 'ink', '&:hover': { bgcolor: 'ground' } }}
						>
							<ChevronLeftRoundedIcon />
						</IconButton>
						<IconButton
							aria-label={t('home:categories.next')}
							onClick={() => scroll(1)}
							sx={{ ...arrowSx, borderColor: home.footer, bgcolor: home.footer, color: colors.white, '&:hover': { bgcolor: 'ink' } }}
						>
							<ChevronRightRoundedIcon />
						</IconButton>
					</Box>
				</Box>
				<Box
					ref={track}
					component="ul"
					aria-label={t('home:categories.listLabel')}
					sx={{
						m: '0 -2px',
						p: '4px 2px 12px',
						listStyle: 'none',
						display: 'flex',
						gap: 4,
						overflowX: 'auto',
						scrollSnapType: 'x mandatory',
						scrollBehavior: 'smooth',
						scrollbarWidth: 'none',
						'&::-webkit-scrollbar': { display: 'none' },
						'@media (prefers-reduced-motion: reduce)': { scrollBehavior: 'auto' },
					}}
				>
					{HOME_CATEGORIES.map((category) => (
						<CategoryCard key={category} category={category} />
					))}
				</Box>
			</Box>
		</Box>
	);
};
