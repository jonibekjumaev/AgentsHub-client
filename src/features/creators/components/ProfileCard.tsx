import type { ReactNode } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { Box, Button, IconButton, Link, Skeleton, Stack, Typography } from '@mui/material';
import {
	AutoAwesomeOutlined as AutoAwesomeOutlinedIcon,
	BlockOutlined as BlockOutlinedIcon,
	CalendarMonthOutlined as CalendarMonthOutlinedIcon,
	ContentCopyOutlined as ContentCopyOutlinedIcon,
	LinkOutlined as LinkOutlinedIcon,
	LockOutlined as LockOutlinedIcon,
	MailOutline as MailOutlineIcon,
	VisibilityOutlined as VisibilityOutlinedIcon,
	WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { FollowButton } from '@/features/follows';
import { MemberStatus } from '@/gql/enums';
import type { MemberProfileQuery as MemberProfileData } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui/Avatar';
import { ErrorState } from '@/shared/ui/ErrorState';
import { useToast } from '@/shared/ui/toast';
import { visuallyHidden } from '@/shared/ui/visuallyHidden';
import { gradients, radiusPx, shadows } from '@/theme/tokens';
import { MemberViewerQuery } from '../graphql/creators';

type Member = MemberProfileData['getMember'];

/** Signed-in ACTIVE members load contacts + meFollowed in the browser; guests and SSR never do. */
const useMemberViewer = (memberId: string) => {
	const { status, me } = useAuth();
	const isMember = status === 'member' && me?.memberStatus === 'ACTIVE';
	const query = useQuery(MemberViewerQuery, { variables: { memberId }, skip: !isMember });
	return { ...query, isMember, status };
};

type Viewer = ReturnType<typeof useMemberViewer>;

/** Copies text and confirms with a toast. The Clipboard API is missing on plain-http origins: then an error toast. */
const useCopy = () => {
	const { t } = useTranslation('creators');
	const toast = useToast();
	return async (value: string, done: string) => {
		try {
			await navigator.clipboard.writeText(value);
			toast.success(done);
		} catch {
			toast.error(t('creators:profile.copyFailed'));
		}
	};
};

const contactBoxSx = { display: 'grid', gap: 3, p: 3, border: 1, borderColor: 'border', borderRadius: radiusPx.md, bgcolor: 'surface', minWidth: 0 } as const;

const IconTile = ({ children, locked }: { children: ReactNode; locked?: boolean }) => (
	<Box
		aria-hidden="true"
		sx={{
			flex: 'none',
			display: 'grid',
			placeItems: 'center',
			width: 40,
			height: 40,
			borderRadius: radiusPx.sm,
			bgcolor: locked ? 'neutralSoft' : 'successSoft',
			color: locked ? 'muted' : 'success.main',
			'& svg': { fontSize: 20 },
		}}
	>
		{children}
	</Box>
);

type ContactRowProps = { icon: ReactNode; label: string; value: string; href: string };

const ContactRow = ({ icon, label, value, href }: ContactRowProps) => {
	const { t } = useTranslation('creators');
	const copy = useCopy();
	return (
		<Stack direction="row" spacing={3} alignItems="center" sx={{ minWidth: 0 }}>
			<IconTile>{icon}</IconTile>
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Typography variant="caption" component="p">
					{label}
				</Typography>
				<Link href={href} sx={{ fontWeight: 700, fontSize: 14, overflowWrap: 'anywhere', fontVariantNumeric: 'tabular-nums' }}>
					{value}
				</Link>
			</Box>
			<IconButton
				size="small"
				aria-label={t('creators:profile.contacts.copy', { label })}
				onClick={() => void copy(value, t('creators:profile.contacts.copied', { label }))}
				sx={{ color: 'muted' }}
			>
				<ContentCopyOutlinedIcon fontSize="small" />
			</IconButton>
		</Stack>
	);
};

/**
 * Members see the real contacts with copy buttons. Guests get a locked placeholder: the API never sends
 * them contacts (D-07/D-23), so the dots are not a blurred real number.
 */
const ContactsBox = ({ viewer }: { viewer: Viewer }) => {
	const { t } = useTranslation('creators');
	const { asPath } = useRouter();

	if (viewer.status === 'loading') return null;
	if (!viewer.isMember) {
		return (
			<Box sx={contactBoxSx}>
				<Stack direction="row" spacing={3} alignItems="center">
					<IconTile locked>
						<LockOutlinedIcon />
					</IconTile>
					<Box sx={{ minWidth: 0 }}>
						<Typography variant="caption" component="p">
							{t('creators:profile.contacts.label')}
						</Typography>
						<Typography aria-hidden="true" sx={{ fontWeight: 700, letterSpacing: '0.2em', color: 'muted' }}>
							•••• ••• ••••
						</Typography>
						<Box component="span" sx={visuallyHidden}>
							{t('creators:profile.contacts.hidden')}
						</Box>
					</Box>
				</Stack>
				<Typography variant="caption" component="p">
					{t('creators:profile.contacts.guest')}
				</Typography>
				<Button component={NextLink} href={`/login?${new URLSearchParams({ next: asPath })}`} variant="outlined" size="small" fullWidth>
					{t('creators:profile.contacts.login')}
				</Button>
			</Box>
		);
	}
	if (!viewer.data) {
		if (viewer.error) return <ErrorState error={viewer.error} title={t('creators:profile.contacts.error')} onRetry={() => void viewer.refetch()} />;
		return <Skeleton variant="rounded" height={72} aria-hidden="true" />;
	}
	const { memberEmail: email, memberWhatsapp: whatsapp } = viewer.data.getMember;
	if (!email && !whatsapp) {
		return (
			<Box sx={contactBoxSx}>
				<Typography variant="body2" sx={{ color: 'bodySoft' }}>
					{t('creators:profile.contacts.none')}
				</Typography>
			</Box>
		);
	}
	return (
		<Box sx={contactBoxSx}>
			{whatsapp && (
				<ContactRow
					icon={<WhatsAppIcon />}
					label={t('creators:profile.contacts.whatsapp')}
					value={whatsapp}
					href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
				/>
			)}
			{email && <ContactRow icon={<MailOutlineIcon />} label={t('creators:profile.contacts.email')} value={email} href={`mailto:${email}`} />}
			<Typography variant="caption" component="p" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
				<VisibilityOutlinedIcon aria-hidden="true" sx={{ fontSize: 14 }} />
				{t('creators:profile.contacts.visible')}
			</Typography>
		</Box>
	);
};

/**
 * The profile card (member-profile design): cover, avatar over the cover's edge, name + role badge,
 * handle, member since, bio; then contacts, Follow and "copy profile link".
 * Phones: one column. 600–899px: identity left, actions right. md+: one column in the sidebar.
 */
export const ProfileCard = ({ member }: { member: Member }) => {
	const { t } = useTranslation(['creators', 'common']);
	const format = useFormat();
	const copy = useCopy();
	const viewer = useMemberViewer(member._id);
	const name = member.memberFullName || member.memberNick;
	const since = new Intl.DateTimeFormat(format.locale, { month: 'long', year: 'numeric' }).format(new Date(member.createdAt));
	const meFollowed = viewer.data?.getMember.meFollowed;
	const following = meFollowed ? meFollowed.some((item) => item.myFollowing) : null;

	return (
		<Box
			component="section"
			aria-label={t('creators:profile.cardLabel', { name })}
			sx={{ bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: radiusPx.xl, overflow: 'hidden', boxShadow: shadows.soft }}
		>
			<Box
				aria-hidden="true"
				sx={{
					position: 'relative',
					height: { xs: 72, sm: 104, md: 88 },
					backgroundImage: gradients.profileCover,
					'&::after': {
						content: '""',
						position: 'absolute',
						inset: 0,
						backgroundImage: gradients.profileCoverDots,
						backgroundSize: '12px 12px',
						maskImage: 'linear-gradient(90deg, transparent, #000)',
						WebkitMaskImage: 'linear-gradient(90deg, transparent, #000)',
					},
				}}
			/>
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'minmax(0, 1fr) 300px', md: 'minmax(0, 1fr)' },
					alignItems: { sm: 'end', md: 'stretch' },
					gap: { xs: 4, sm: 8, md: 6 },
					px: { xs: 4, sm: 8, md: 6 },
					pb: { xs: 4, sm: 8, md: 6 },
				}}
			>
				<Box sx={{ display: 'grid', gap: 2, minWidth: 0 }}>
					<Box
						sx={{
							position: 'relative',
							zIndex: 1,
							width: 'fit-content',
							mt: '-48px',
							p: '4px',
							bgcolor: 'surface',
							borderRadius: radiusPx.xl,
							boxShadow: shadows.raised,
						}}
					>
						<Avatar memberId={member._id} name={name} image={member.memberImage} size={96} radius={14} />
					</Box>
					<Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" alignItems="center" sx={{ mt: 2 }}>
						<Typography variant="h1" sx={{ fontSize: { xs: 20, md: 22 }, overflowWrap: 'anywhere' }}>
							{name}
						</Typography>
						<Box
							component="span"
							sx={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: 1,
								px: 2.5,
								py: 0.5,
								borderRadius: radiusPx.pill,
								bgcolor: 'accentSoft',
								color: 'primary.main',
								fontSize: 12,
								fontWeight: 800,
							}}
						>
							<AutoAwesomeOutlinedIcon aria-hidden="true" sx={{ fontSize: 14 }} />
							{t(`common:enums.MemberType.${member.memberType}`)}
						</Box>
					</Stack>
					<Typography sx={{ color: 'body', fontWeight: 600 }}>@{member.memberNick}</Typography>
					<Typography variant="caption" component="p" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
						<CalendarMonthOutlinedIcon aria-hidden="true" sx={{ fontSize: 14 }} />
						{t('creators:profile.memberSince', { date: since })}
					</Typography>
					{member.memberDesc && (
						<Typography variant="body2" sx={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere', color: 'body', lineHeight: 1.6, mt: 1 }}>
							{member.memberDesc}
						</Typography>
					)}
					{member.memberStatus === MemberStatus.Block && (
						<Stack direction="row" spacing={2} alignItems="center" sx={{ color: 'dangerInk' }}>
							<BlockOutlinedIcon aria-hidden="true" fontSize="small" />
							<Typography variant="body2" sx={{ color: 'inherit', fontWeight: 600 }}>
								{t('creators:profile.blocked')}
							</Typography>
						</Stack>
					)}
				</Box>

				<Box sx={{ display: 'grid', gap: 3, minWidth: 0 }}>
					<ContactsBox viewer={viewer} />
					<Box sx={{ display: 'flex', gap: 2 }}>
						{member.memberStatus === MemberStatus.Active && (
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<FollowButton memberId={member._id} nick={member.memberNick} following={following} variant="solid" fullWidth />
							</Box>
						)}
						<IconButton
							aria-label={t('creators:profile.share')}
							onClick={() => void copy(window.location.href, t('creators:profile.shareDone'))}
							sx={{ flex: 'none', width: 44, height: 44, border: 1, borderColor: 'inputBorder', borderRadius: radiusPx.sm, color: 'body', ml: 'auto' }}
						>
							<LinkOutlinedIcon fontSize="small" />
						</IconButton>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};
