import type { ReactNode } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { useQuery } from '@apollo/client';
import { Box, Button, Chip, Link, Skeleton, Stack, Typography } from '@mui/material';
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { CommentsSection, productCommentTarget } from '@/features/comments';
import { FollowButton } from '@/features/follows';
import type { AgentDetailQuery as AgentDetailData } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { mediaUrl } from '@/shared/lib/media';
import { Avatar } from '@/shared/ui/Avatar';
import { ErrorState } from '@/shared/ui/ErrorState';
import { PriceTag } from '@/shared/ui/PriceTag';
import { visuallyHidden } from '@/shared/ui/visuallyHidden';
import {
	CategoryPill,
	NightBand,
	NightBreadcrumbs,
	cardLabelSx,
	detailAsideSx,
	detailGridSx,
	pageCardSx,
	pageFrameSx,
} from '@/shared/ui/page';
import { fonts, home, radiusPx } from '@/theme/tokens';
import { AgentsListQuery } from '../graphql/agents';
import { AgentDetailQuery } from '../graphql/agentDetail';
import { MORE_FROM_SHOWN, isExternalHttpUrl, moreFromVariables } from '../lib/detail';
import { DEFAULT_FILTERS, agentsHref } from '../lib/listQuery';
import { agentHref } from './AgentCard';
import { AgentGallery } from './AgentGallery';
import { CreatorContacts } from './CreatorContacts';
import { LikeButton } from './LikeButton';

type Agent = AgentDetailData['getProduct'];
type Creator = NonNullable<Agent['memberData']>;

const cardSx = pageCardSx;

const statBoxSx = {
	flex: 1,
	display: 'grid',
	placeItems: 'center',
	height: 42,
	borderRadius: radiusPx.md,
	bgcolor: 'ground',
	fontSize: 14,
	fontWeight: 600,
	color: 'bodySoft',
} as const;

const memberHref = (memberId: string) => `/members/${memberId}`;

/** 'public': /agents/[id]. 'owner': the creator's preview (S3c) — no breadcrumbs, like button, contacts or "More from". */
export type AgentDetailVariant = 'public' | 'owner';

const Breadcrumbs = ({ agent }: { agent: Agent }) => {
	const { t } = useTranslation(['agents', 'common']);
	return (
		<NightBreadcrumbs
			label={t('agents:detail.breadcrumb')}
			items={[
				{ label: t('common:nav.agents'), href: agentsHref(DEFAULT_FILTERS) },
				{
					label: t(`common:enums.AgentCategory.${agent.productCategory}`),
					href: agentsHref({ ...DEFAULT_FILTERS, categories: [agent.productCategory] }),
				},
				{ label: agent.productTitle },
			]}
		/>
	);
};

/** The update date (server and browser may sit in different time zones: the browser's date wins). */
const Updated = ({ agent }: { agent: Agent }) => {
	const { t } = useTranslation('agents');
	const format = useFormat();
	return (
		<time dateTime={agent.updatedAt} suppressHydrationWarning>
			{t('agents:detail.updated', { date: format.date(agent.updatedAt) })}
		</time>
	);
};

/** Price, demo link, like and views (AgentDetail.html right column, first card). */
const PriceBox = ({ agent, owner }: { agent: Agent; owner: boolean }) => {
	const { t } = useTranslation('agents');
	const format = useFormat();
	const demoUrl = isExternalHttpUrl(agent.productDemoUrl) ? agent.productDemoUrl : null;

	return (
		<Box sx={cardSx}>
			<Box sx={{ '& > :first-of-type': { fontFamily: fonts.display, letterSpacing: '-0.03em' } }}>
				<PriceTag pricing={agent.productPricing} price={agent.productPrice} size="large" />
				<Typography variant="meta" sx={{ mt: 1.5 }}>
					{t(`agents:detail.price.${agent.productPricing}`)}
				</Typography>
			</Box>
			{demoUrl && (
				<Button
					component="a"
					href={demoUrl}
					target="_blank"
					// User-supplied external link: no referrer, no window.opener, no SEO endorsement.
					rel="nofollow ugc noopener noreferrer"
					variant="outlined"
					startIcon={<OpenInNewIcon />}
					sx={{ height: 46 }}
				>
					{t('agents:detail.demo')}{' '}
					<Box component="span" sx={visuallyHidden}>
						{t('agents:detail.newTab')}
					</Box>
				</Button>
			)}
			<Stack direction="row" spacing={2}>
				{owner ? (
					// The owner can't like their own agent (D-22): the count only.
					<Box sx={statBoxSx}>
						{t('agents:detail.likes', { count: agent.productLikes, formatted: format.compact(agent.productLikes) })}
					</Box>
				) : (
					<LikeButton agentId={agent._id} creatorId={agent.memberData?._id} likes={agent.productLikes} />
				)}
				<Box sx={statBoxSx}>
					{t('agents:detail.views', { count: agent.productViews, formatted: format.compact(agent.productViews) })}
				</Box>
			</Stack>
		</Box>
	);
};

const CreatorBox = ({ agentId, creator }: { agentId: string; creator: Creator }) => {
	const { t } = useTranslation('agents');
	const name = creator.memberFullName || creator.memberNick;

	return (
		<Box sx={cardSx}>
			<Typography component="h2" sx={cardLabelSx}>
				{t('agents:detail.creator.title')}
			</Typography>
			<Stack direction="row" spacing={3} alignItems="center" sx={{ minWidth: 0 }}>
				<Avatar memberId={creator._id} name={name} image={creator.memberImage} size={48} />
				<Box sx={{ minWidth: 0 }}>
					<Link
						component={NextLink}
						href={memberHref(creator._id)}
						aria-label={t('agents:detail.creator.profile', { nick: creator.memberNick })}
						sx={{ color: 'ink', fontWeight: 800, overflowWrap: 'anywhere' }}
					>
						@{creator.memberNick}
					</Link>
					<Typography variant="meta">
						{t('agents:detail.creator.agents', { count: creator.memberProducts })} ·{' '}
						{t('agents:detail.creator.followers', { count: creator.memberFollowers })}
					</Typography>
				</Box>
			</Stack>
			<FollowButton memberId={creator._id} nick={creator.memberNick} fullWidth />
			<CreatorContacts agentId={agentId} />
		</Box>
	);
};

/** The author was deleted (D-38): the API sends memberData null. No profile link, follow or contacts. */
const DeletedAuthorBox = () => {
	const { t } = useTranslation(['agents', 'common']);
	return (
		<Box sx={cardSx}>
			<Typography component="h2" sx={cardLabelSx}>
				{t('agents:detail.creator.title')}
			</Typography>
			<Stack direction="row" spacing={3} alignItems="center">
				<Avatar memberId="deleted" name={t('common:deletedMember')} size={48} />
				<Typography sx={{ color: 'muted', fontWeight: 800 }}>{t('common:deletedMember')}</Typography>
			</Stack>
		</Box>
	);
};

/** Other ACTIVE agents of the same creator; prefetched by SSR, hidden when there are none. */
const MoreFromCreator = ({ agentId, creator }: { agentId: string; creator: Creator }) => {
	const { t } = useTranslation(['agents', 'common']);
	const { data } = useQuery(AgentsListQuery, { variables: moreFromVariables(creator._id) });
	const others = (data?.getProducts.list ?? []).filter((agent) => agent._id !== agentId).slice(0, MORE_FROM_SHOWN);
	if (others.length === 0) return null;

	return (
		<Box component="section" aria-labelledby="more-from-creator" sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
			<Typography id="more-from-creator" variant="h2" sx={{ fontFamily: fonts.display, letterSpacing: '-0.02em' }}>
				{t('agents:detail.moreFrom', { nick: creator.memberNick })}
			</Typography>
			<Box
				component="ul"
				sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 5, m: 0, p: 0, listStyle: 'none' }}
			>
				{others.map((agent) => {
					const src = mediaUrl(agent.productImages[0]);
					return (
						<li key={agent._id}>
							<Link
								component={NextLink}
								href={agentHref(agent._id)}
								underline="none"
								sx={{
									display: 'flex',
									gap: 3.5,
									alignItems: 'center',
									p: 4,
									bgcolor: 'surface',
									border: 1,
									borderColor: 'border',
									borderRadius: home.radius.card,
									color: 'ink',
									transition: 'border-color 200ms',
									'&:hover': { borderColor: 'primary.main' },
								}}
							>
								<Box
									sx={{
										position: 'relative',
										flex: 'none',
										width: 52,
										height: 52,
										borderRadius: radiusPx.md,
										overflow: 'hidden',
										bgcolor: 'accentSoft',
									}}
								>
									{src && <Image src={src} alt="" fill sizes="52px" style={{ objectFit: 'cover' }} />}
								</Box>
								<Box sx={{ minWidth: 0 }}>
									<Typography sx={{ fontWeight: 800, overflowWrap: 'anywhere' }}>{agent.productTitle}</Typography>
									<Typography variant="meta" component="span" sx={{ display: 'inline-flex', gap: 1, alignItems: 'baseline' }}>
										{t(`common:enums.AgentCategory.${agent.productCategory}`)} ·{' '}
										<PriceTag pricing={agent.productPricing} price={agent.productPrice} />
									</Typography>
								</Box>
							</Link>
						</li>
					);
				})}
			</Box>
		</Box>
	);
};

const DetailSkeleton = () => {
	const { t } = useTranslation('common');
	return (
		<Box role="status" aria-busy="true" aria-label={t('common:status.loading')} sx={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
			<Box sx={{ flex: '999 1 560px', minWidth: 0 }}>
				<Skeleton variant="text" width="60%" sx={{ fontSize: 40 }} aria-hidden="true" />
				<Skeleton variant="rounded" sx={{ mt: 4, aspectRatio: '16 / 10', height: 'auto' }} aria-hidden="true" />
			</Box>
			<Box sx={{ flex: '1 1 340px', minWidth: 0 }}>
				<Skeleton variant="rounded" height={220} aria-hidden="true" />
			</Box>
		</Box>
	);
};

/**
 * /agents/[id], in the catalog language: the night band (breadcrumb, category pill, title, update date), the gallery
 * and "About" cards, an aside with the price + like and the creator + contacts, then questions and "More from".
 * Public data comes from the SSR cache; contacts load after auth.
 * variant 'owner' renders the same view inside the dashboard preview; that page loads the data itself.
 */
export const AgentDetail = ({ agentId, variant = 'public' }: { agentId: string; variant?: AgentDetailVariant }) => {
	const { t } = useTranslation(['agents', 'common']);
	const { data, loading, error, refetch } = useQuery(AgentDetailQuery, { variables: { productId: agentId } });
	const agent = data?.getProduct;
	const owner = variant === 'owner';

	const container = (children: ReactNode) =>
		// Inside the dashboard the layout already sets the width and padding.
		owner ? <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</Box> : <Box sx={pageFrameSx}>{children}</Box>;

	if (loading && !agent) return container(<DetailSkeleton />);
	if (!agent) return container(<ErrorState error={error} title={t('agents:detail.errorTitle')} onRetry={() => void refetch()} />);
	const creator = agent.memberData;
	const tags = agent.productTags ?? [];

	const content = (
		<>
			{/*
			  DOM order = the mobile order: (owner: header), gallery, price + creator, about, questions.
			  From md the price + creator column moves to the right and spans every row.
			*/}
			<Box sx={{ ...detailGridSx, gridTemplateRows: { md: owner ? 'auto auto auto 1fr' : 'auto auto 1fr' } }}>
				{owner && (
					// The dashboard preview has no night band: the title sits in the page, as before.
					<Box component="header" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
						<Stack direction="row" spacing={2} alignItems="center" useFlexGap flexWrap="wrap">
							<CategoryPill category={agent.productCategory} />
							<Typography variant="meta" component="span">
								<Updated agent={agent} />
							</Typography>
						</Stack>
						<Typography
							variant="h1"
							sx={{ fontFamily: fonts.display, fontSize: { xs: 32, md: 40 }, letterSpacing: '-0.03em', overflowWrap: 'anywhere' }}
						>
							{agent.productTitle}
						</Typography>
					</Box>
				)}
				<Box sx={{ ...cardSx, p: { xs: 3, sm: 4 } }}>
					<AgentGallery title={agent.productTitle} images={agent.productImages} />
				</Box>
				<Box component="aside" sx={detailAsideSx}>
					<PriceBox agent={agent} owner={owner} />
					{!owner && (creator ? <CreatorBox agentId={agent._id} creator={creator} /> : <DeletedAuthorBox />)}
				</Box>
				<Box component="section" aria-labelledby="agent-about" sx={cardSx}>
					<Typography id="agent-about" variant="h2" sx={{ fontSize: 20, fontFamily: fonts.display, letterSpacing: '-0.02em' }}>
						{t('agents:detail.about')}
					</Typography>
					{/* Plain text from the creator (CLAUDE.md rule 7). */}
					<Typography sx={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere', color: 'body', lineHeight: 1.7 }}>
						{agent.productDesc}
					</Typography>
					{tags.length > 0 && (
						<Box
							component="ul"
							aria-label={t('agents:detail.tagsLabel')}
							sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, m: 0, p: 0, listStyle: 'none' }}
						>
							{tags.map((tag) => (
								<li key={tag}>
									<Chip
										component={NextLink}
										href={agentsHref({ ...DEFAULT_FILTERS, tags: [tag] })}
										clickable
										label={`#${tag}`}
										aria-label={t('agents:detail.tagLink', { tag })}
										sx={{ borderRadius: radiusPx.pill, bgcolor: 'neutralSoft', color: 'body', fontWeight: 600, height: 28 }}
									/>
								</li>
							))}
						</Box>
					)}
				</Box>
				{/* §3.8: everyone reads; members ask on ACTIVE agents; a PAUSED agent (owner preview) takes no new comments. */}
				<CommentsSection
					target={productCommentTarget(agent._id)}
					authorId={creator?._id}
					canPost={agent.productStatus === 'ACTIVE'}
				/>
			</Box>
			{creator && !owner && <MoreFromCreator agentId={agent._id} creator={creator} />}
		</>
	);

	if (owner) return container(content);

	return (
		<>
			<NightBand
				title={agent.productTitle}
				top={<Breadcrumbs agent={agent} />}
				pills={<CategoryPill category={agent.productCategory} />}
				meta={
					<>
						<Updated agent={agent} />
						{creator && ` · @${creator.memberNick}`}
					</>
				}
			/>
			{container(content)}
		</>
	);
};
