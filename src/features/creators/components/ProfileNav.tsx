import type { ReactNode } from 'react';
import NextLink from 'next/link';
import { Box, Link, Typography } from '@mui/material';
import {
	ArticleOutlined as ArticleOutlinedIcon,
	AssignmentOutlined as AssignmentOutlinedIcon,
	HowToRegOutlined as HowToRegOutlinedIcon,
	PeopleOutline as PeopleOutlineIcon,
	SmartToyOutlined as SmartToyOutlinedIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import type { MemberProfileQuery as MemberProfileData } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { radiusPx, shadows } from '@/theme/tokens';
import { isCreator, profileTabHref, type ProfileTab } from '../lib/profile';

type Member = MemberProfileData['getMember'];

export type NavGroup = 'work' | 'community';

export const NAV_GROUPS: { key: NavGroup; items: ProfileTab[] }[] = [
	{ key: 'work', items: ['work'] },
	{ key: 'community', items: ['articles', 'followers', 'following'] },
];

export const navGroupOf = (tab: ProfileTab): NavGroup => (tab === 'work' ? 'work' : 'community');

/** Label, count and icon of a section; the work section is agents for creators, open briefs for users. */
export const useProfileSections = (member: Member) => {
	const { t } = useTranslation('creators');
	const creator = isCreator(member.memberType);
	const iconSx = { fontSize: 18 } as const;
	const sections: Record<ProfileTab, { label: string; count: number; icon: ReactNode }> = {
		work: creator
			? { label: t('creators:profile.tabs.agents'), count: member.memberProducts, icon: <SmartToyOutlinedIcon aria-hidden="true" sx={iconSx} /> }
			: { label: t('creators:profile.tabs.briefs'), count: member.memberBriefs, icon: <AssignmentOutlinedIcon aria-hidden="true" sx={iconSx} /> },
		articles: { label: t('creators:profile.tabs.articles'), count: member.memberArticles, icon: <ArticleOutlinedIcon aria-hidden="true" sx={iconSx} /> },
		followers: { label: t('creators:profile.tabs.followers'), count: member.memberFollowers, icon: <PeopleOutlineIcon aria-hidden="true" sx={iconSx} /> },
		following: { label: t('creators:profile.tabs.following'), count: member.memberFollowings, icon: <HowToRegOutlinedIcon aria-hidden="true" sx={iconSx} /> },
	};
	return sections;
};

/**
 * Section nav (member-profile design). md+: a card in the sidebar with grouped rows, the current one tinted
 * with an accent bar on the left. Phones/tablets: a sticky, horizontally scrolling row. One element for
 * both, so the URL tab (?tab=…) and the tests see a single nav.
 */
export const ProfileNav = ({ member, tab }: { member: Member; tab: ProfileTab }) => {
	const { t } = useTranslation('creators');
	const format = useFormat();
	const sections = useProfileSections(member);

	return (
		<Box
			component="nav"
			aria-label={t('creators:profile.tabs.label')}
			sx={{
				position: { xs: 'sticky', md: 'static' },
				top: 8,
				zIndex: 10,
				bgcolor: 'surface',
				border: 1,
				borderColor: 'border',
				borderRadius: { xs: radiusPx.md, md: radiusPx.xl },
				boxShadow: { xs: shadows.soft, md: 'none' },
				p: { xs: 1, md: 2 },
			}}
		>
			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'row', md: 'column' },
					overflowX: { xs: 'auto', md: 'visible' },
					scrollbarWidth: 'none',
					'&::-webkit-scrollbar': { display: 'none' },
				}}
			>
				{NAV_GROUPS.map((group, index) => (
					<Box
						key={group.key}
						sx={{
							display: { xs: 'flex', md: 'block' },
							flex: 'none',
							...(index > 0 && { ml: { xs: 1, md: 0 }, pl: { xs: 1, md: 0 }, borderLeft: { xs: 1, md: 0 }, borderColor: 'border', mt: { md: 2 } }),
						}}
					>
						<Typography
							id={`profile-nav-${group.key}`}
							variant="overline"
							component="p"
							sx={{ display: { xs: 'none', md: 'block' }, color: 'muted', px: 3, pt: 2, pb: 1 }}
						>
							{t(`creators:profile.groups.${group.key}`)}
						</Typography>
						<Box
							component="ul"
							aria-labelledby={`profile-nav-${group.key}`}
							sx={{ m: 0, p: 0, listStyle: 'none', display: { xs: 'flex', md: 'grid' }, gap: 0.5 }}
						>
							{group.items.map((key) => {
								const current = key === tab;
								const { label, count, icon } = sections[key];
								return (
									<li key={key}>
										<Link
											component={NextLink}
											href={profileTabHref(member._id, key)}
											shallow
											scroll={false}
											underline="none"
											aria-current={current ? 'page' : undefined}
											sx={{
												position: 'relative',
												display: 'flex',
												alignItems: 'center',
												gap: { xs: 2, md: 3 },
												height: 40,
												px: 3,
												whiteSpace: 'nowrap',
												borderRadius: radiusPx.sm,
												fontSize: 14,
												fontWeight: current ? 700 : 600,
												color: current ? 'primary.main' : 'body',
												bgcolor: current ? 'accentSoft' : 'transparent',
												transition: 'background-color 150ms ease, color 150ms ease',
												'&:hover': current ? undefined : { bgcolor: 'ground', color: 'ink' },
												'& svg': { color: current ? 'primary.main' : 'muted' },
												// md+: accent bar on the card's inner edge.
												'&::before': {
													content: '""',
													display: { xs: 'none', md: 'block' },
													position: 'absolute',
													left: -8,
													top: 10,
													bottom: 10,
													width: 3,
													borderRadius: '0 3px 3px 0',
													bgcolor: 'primary.main',
													transform: current ? 'scaleY(1)' : 'scaleY(0)',
													transition: 'transform 150ms ease',
												},
											}}
										>
											{icon}
											<Box component="span" sx={{ flex: { md: 1 } }}>
												{label}
											</Box>{' '}
											<Box
												component="span"
												sx={{
													display: 'grid',
													placeItems: 'center',
													minWidth: 24,
													height: 20,
													px: 1.5,
													borderRadius: radiusPx.pill,
													bgcolor: current ? 'primary.main' : 'ground',
													color: current ? 'primary.contrastText' : 'body',
													fontSize: 12,
													fontWeight: 700,
													fontVariantNumeric: 'tabular-nums',
												}}
											>
												{format.number(count ?? 0)}
											</Box>
										</Link>
									</li>
								);
							})}
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	);
};
