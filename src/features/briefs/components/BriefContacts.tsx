import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Box, Button, Link, Skeleton, Stack, Typography } from '@mui/material';
import { LockOutlined as LockOutlinedIcon, MailOutline as MailOutlineIcon, WhatsApp as WhatsAppIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { ErrorState } from '@/shared/ui/ErrorState';
import { radiusPx } from '@/theme/tokens';
import { useBriefViewer } from '../hooks/useBriefViewer';
import { whatsappHref } from '../lib/detail';

const boxSx = {
	display: 'flex',
	flexDirection: 'column',
	gap: 2.5,
	p: 4,
	borderRadius: radiusPx.md,
	bgcolor: 'ground',
} as const;

const LoadingContacts = () => {
	const { t } = useTranslation('briefs');
	return (
		<Box role="status" aria-busy="true" aria-label={t('briefs:detail.contacts.loading')} sx={boxSx}>
			<Skeleton variant="text" width="70%" aria-hidden="true" />
			<Skeleton variant="text" width="55%" aria-hidden="true" />
		</Box>
	);
};

/** Guests: why contacts are hidden, and a login link that comes back here (D-07/D-23). */
const GuestPrompt = () => {
	const { t } = useTranslation('briefs');
	const { asPath } = useRouter();

	return (
		<Box sx={boxSx}>
			<Stack direction="row" spacing={2.5} alignItems="center">
				<LockOutlinedIcon aria-hidden="true" sx={{ color: 'primary.main', fontSize: 20 }} />
				<Typography component="h3" sx={{ fontSize: 14, fontWeight: 700 }}>
					{t('briefs:detail.contacts.guestTitle')}
				</Typography>
			</Stack>
			<Typography variant="meta" sx={{ color: 'bodySoft' }}>
				{t('briefs:detail.contacts.guestText')}
			</Typography>
			<Button component={NextLink} href={`/login?${new URLSearchParams({ next: asPath })}`} sx={{ height: 42 }}>
				{t('briefs:detail.contacts.login')}
			</Button>
		</Box>
	);
};

const MemberContacts = ({ viewer }: { viewer: ReturnType<typeof useBriefViewer> }) => {
	const { t } = useTranslation('briefs');
	const { data, error, refetch } = viewer;

	if (!data && !error) return <LoadingContacts />;
	if (error && !data) {
		return <ErrorState error={error} title={t('briefs:detail.contacts.error')} onRetry={() => void refetch()} />;
	}

	const email = data?.getBrief.memberData?.memberEmail;
	const whatsapp = data?.getBrief.memberData?.memberWhatsapp;
	if (!email && !whatsapp) {
		return (
			<Box sx={boxSx}>
				<Typography variant="meta" sx={{ color: 'bodySoft' }}>
					{t('briefs:detail.contacts.none')}
				</Typography>
			</Box>
		);
	}

	const row = (icon: JSX.Element, label: string, href: string, text: string) => (
		<Stack component="li" direction="row" spacing={2.5} alignItems="center" sx={{ minWidth: 0 }}>
			{icon}
			<Box sx={{ minWidth: 0 }}>
				<Typography variant="caption" component="span" sx={{ display: 'block' }}>
					{label}
				</Typography>
				<Link href={href} sx={{ fontSize: 14, fontWeight: 700, overflowWrap: 'anywhere' }}>
					{text}
				</Link>
			</Box>
		</Stack>
	);

	return (
		<Box sx={boxSx}>
			<Typography component="h3" sx={{ fontSize: 14, fontWeight: 700 }}>
				{t('briefs:detail.contacts.title')}
			</Typography>
			<Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
				{email &&
					row(
						<MailOutlineIcon aria-hidden="true" sx={{ color: 'success.main', fontSize: 20 }} />,
						t('briefs:detail.contacts.email'),
						`mailto:${email}`,
						email,
					)}
				{whatsapp &&
					row(
						<WhatsAppIcon aria-hidden="true" sx={{ color: 'success.main', fontSize: 20 }} />,
						t('briefs:detail.contacts.whatsapp'),
						whatsappHref(whatsapp),
						whatsapp,
					)}
			</Box>
			<Typography variant="caption" component="p">
				{t('briefs:detail.contacts.visible')}
			</Typography>
		</Box>
	);
};

/**
 * DESIGN §4: the author's contacts render only for signed-in ACTIVE members. The member query also
 * records this member's view (OPEN briefs, not the owner's); guests, SSR and bots never count.
 * The author themself sees nothing here: their own contacts are in their settings.
 */
export const BriefContacts = ({ briefId, authorId }: { briefId: string; authorId?: string | null }) => {
	const viewer = useBriefViewer(briefId);

	if (viewer.viewer === 'guest') return <GuestPrompt />;
	if (!viewer.me) return <LoadingContacts />;
	if (authorId && viewer.me._id === authorId) return null;
	return <MemberContacts viewer={viewer} />;
};
