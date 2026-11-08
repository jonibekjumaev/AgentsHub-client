import NextLink from 'next/link';
import { Box, Link, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import { FollowButton } from '@/features/follows';
import type { CatalogCreatorFragment } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { mediaUrl } from '@/shared/lib/media';
import { initialsOf } from '@/shared/ui/Avatar';
import { CategoryIcon, categoryTint } from '@/shared/ui/CategoryIcon';
import { RankBadge } from '@/shared/ui/RankBadge';
import { enterSx, focusVisibleSx } from '@/shared/ui/catalog';
import { colors, creatorCard, fonts, home, radiusPx } from '@/theme/tokens';
import { memberHref } from '../lib/creatorsQuery';

/** A creator without agents: neutral gray instead of a category tint. */
const NEUTRAL: readonly [string, string] = categoryTint('OTHER');

/** Top-ranked products of a creator, as returned by getCreators (D-45). */
type CreatorProduct = NonNullable<CatalogCreatorFragment['memberTopProducts']>[number];

const agentHref = (productId: string) => `/agents/${productId}`;

/** "$29 / mo", "$79", "Free" (green) or "Custom". */
const ProductPrice = ({ product }: { product: CreatorProduct }) => {
	const { t } = useTranslation('common');
	const format = useFormat();
	const { productPricing: pricing, productPrice: price } = product;
	if (pricing === 'FREE') {
		return (
			<Box component="span" sx={{ color: 'success.main' }}>
				{t('common:price.free')}
			</Box>
		);
	}
	if (pricing === 'CUSTOM' || price == null) return <>{t('common:price.custom')}</>;
	return (
		<>
			{format.price(price)}
			{pricing === 'SUBSCRIPTION' && ` ${t('common:price.perMonth')}`}
		</>
	);
};

/** One stat of the strip: a big number over a small label ("1 follower", "3 followers"). */
const Stat = ({ value, label, divider }: { value: string; label: string; divider: boolean }) => (
	<Box
		component="span"
		sx={{
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			gap: 0.25,
			px: 1,
			py: 2.5,
			borderLeft: divider ? 1 : 0,
			borderColor: 'border',
		}}
	>
		<Box
			component="span"
			sx={{
				fontFamily: fonts.display,
				fontSize: 22,
				fontWeight: 800,
				letterSpacing: '-0.02em',
				color: 'ink',
				lineHeight: 1.1,
			}}
		>
			{value}
		</Box>
		<Box component="span" sx={{ fontSize: 12, color: 'bodySoft' }}>
			{label}
		</Box>
	</Box>
);

type CreatorCardProps = { creator: CatalogCreatorFragment; index: number };

/**
 * One creator of /creators (agentshub-creators design, D-45): a cover in the main category's tint with the rank,
 * the avatar over it next to Follow, name and @handle, a 2-line bio, the stats strip, up to 2 agents, then the
 * categories the creator builds in. The #1 creator's card stands out.
 */
export const CreatorCard = ({ creator, index }: CreatorCardProps) => {
	const { t } = useTranslation(['creators', 'common']);
	const format = useFormat();
	const name = creator.memberFullName || creator.memberNick;
	const categories = creator.memberCategories ?? [];
	const [tint, ink] = categories.length ? categoryTint(categories[0]) : NEUTRAL;
	const agents = creator.memberActiveProducts ?? 0;
	const top = creator.memberTopProducts ?? [];
	const image = mediaUrl(creator.memberImage);
	const first = creator.memberRankPosition === 1;
	const following = (creator.meFollowed ?? []).some((item) => item.myFollowing);

	return (
		<Box
			component="article"
			aria-labelledby={`creator-${creator._id}`}
			sx={{
				flex: '1 1 auto',
				display: 'flex',
				flexDirection: 'column',
				borderRadius: home.radius.card,
				overflow: 'hidden',
				bgcolor: 'surface',
				border: 1,
				borderColor: first ? creatorCard.topBorder : 'border',
				boxShadow: first ? creatorCard.topShadow : 'none',
				...enterSx(index),
			}}
		>
			<Box sx={{ position: 'relative', height: 84, bgcolor: tint }}>
				<Box
					aria-hidden="true"
					sx={{
						position: 'absolute',
						inset: 0,
						backgroundImage: `radial-gradient(${alpha(ink, 0.3)} 1.2px, transparent 1.6px)`,
						backgroundSize: '16px 16px',
						opacity: creatorCard.coverDotsOpacity,
					}}
				/>
				<Box sx={{ position: 'absolute', top: 14, right: 14 }}>
					<RankBadge rank={creator.memberRankPosition} />
				</Box>
			</Box>

			<Box sx={{ flex: '1 1 auto', px: 5.5, pb: 5.5, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
				<Box sx={{ mt: '-34px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 3 }}>
					<Box
						aria-hidden="true"
						sx={{
							position: 'relative',
							flex: 'none',
							width: 72,
							height: 72,
							display: 'grid',
							placeItems: 'center',
							boxSizing: 'border-box',
							borderRadius: '22px',
							border: `4px solid ${colors.white}`,
							bgcolor: tint,
							color: ink,
							fontSize: 24,
							fontWeight: 800,
							overflow: 'hidden',
							boxShadow: creatorCard.avatarShadow,
							...(image && { backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }),
						}}
					>
						{!image && initialsOf(name)}
					</Box>
					<FollowButton memberId={creator._id} nick={creator.memberNick} following={following} variant="pill" />
				</Box>

				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
					<Typography
						id={`creator-${creator._id}`}
						variant="h2"
						sx={{
							fontFamily: fonts.display,
							fontSize: 24,
							lineHeight: 1.1,
							fontWeight: 700,
							letterSpacing: '-0.02em',
							overflowWrap: 'anywhere',
						}}
					>
						<Link
							component={NextLink}
							href={memberHref(creator._id)}
							underline="hover"
							sx={{ color: 'ink', ...focusVisibleSx }}
						>
							{name}
						</Link>
					</Typography>
					<Typography component="span" sx={{ fontSize: 14, color: 'muted' }}>
						@{creator.memberNick}
					</Typography>
				</Box>

				<Typography
					sx={{
						minHeight: '3em',
						fontSize: 15,
						lineHeight: 1.5,
						color: creator.memberDesc ? 'bodySoft' : creatorCard.emptyBio,
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
						overflowWrap: 'anywhere',
					}}
				>
					{creator.memberDesc || t('creators:card.noBio')}
				</Typography>

				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
						borderRadius: '14px',
						bgcolor: 'ground',
					}}
				>
					<Stat value={format.number(agents)} label={t('creators:stats.agents', { count: agents })} divider={false} />
					<Stat
						value={format.number(creator.memberFollowers)}
						label={t('creators:stats.followers', { count: creator.memberFollowers })}
						divider
					/>
					<Stat
						value={format.number(creator.memberLikes)}
						label={t('creators:stats.likes', { count: creator.memberLikes })}
						divider
					/>
				</Box>

				{agents > 0 ? (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
						<Typography component="h3" sx={{ fontSize: 13, fontWeight: 600, color: 'bodySoft' }}>
							{t('creators:card.agentsBy', { name })}
						</Typography>
						<Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
							{top.map((product) => {
								const [agentTint, agentInk] = categoryTint(product.productCategory);
								return (
									<li key={product._id}>
										<Box
											component={NextLink}
											href={agentHref(product._id)}
											sx={{
												display: 'flex',
												alignItems: 'center',
												gap: 2.5,
												minHeight: 44,
												px: 2,
												mx: -2,
												borderRadius: '10px',
												color: 'ink',
												textDecoration: 'none',
												transition: 'background-color 150ms',
												'&:hover': { bgcolor: 'neutralSoft' },
												...focusVisibleSx,
											}}
										>
											<Box
												component="span"
												aria-hidden="true"
												sx={{
													flex: 'none',
													width: 30,
													height: 30,
													display: 'grid',
													placeItems: 'center',
													borderRadius: '9px',
													bgcolor: agentTint,
													color: agentInk,
												}}
											>
												<CategoryIcon category={product.productCategory} size={15} />
											</Box>
											<Box
												component="span"
												sx={{
													flex: '1 1 auto',
													minWidth: 0,
													fontSize: 14,
													fontWeight: 600,
													whiteSpace: 'nowrap',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
												}}
											>
												{product.productTitle}
											</Box>
											<Box component="span" sx={{ flex: 'none', fontSize: 13, fontWeight: 700, color: 'body' }}>
												<ProductPrice product={product} />
											</Box>
										</Box>
									</li>
								);
							})}
						</Box>
						{agents > top.length && (
							<Link
								component={NextLink}
								href={memberHref(creator._id)}
								sx={{ alignSelf: 'flex-start', fontSize: 13, fontWeight: 700, pt: 0.5, ...focusVisibleSx }}
							>
								{t('creators:card.seeAll', { count: agents })}
							</Link>
						)}
					</Box>
				) : (
					<Typography
						sx={{
							px: 3.5,
							py: 3,
							borderRadius: '12px',
							border: '1px dashed',
							borderColor: 'inputBorder',
							fontSize: 14,
							color: 'muted',
						}}
					>
						{t('creators:card.noAgents')}
					</Typography>
				)}

				{categories.length > 0 && (
					<Box
						component="ul"
						aria-label={t('creators:card.buildsFor')}
						sx={{ mt: 'auto', p: 0, mb: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 1.5 }}
					>
						{categories.map((category) => {
							const [categoryBg, categoryInk] = categoryTint(category);
							return (
								<Box
									component="li"
									key={category}
									sx={{
										px: 2.5,
										py: 1,
										borderRadius: radiusPx.pill,
										bgcolor: categoryBg,
										color: categoryInk,
										fontSize: 12,
										fontWeight: 700,
									}}
								>
									{t(`common:enums.AgentCategory.${category}`)}
								</Box>
							);
						})}
					</Box>
				)}
			</Box>
		</Box>
	);
};
