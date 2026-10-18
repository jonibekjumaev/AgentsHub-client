import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { Box, Button, Link, Skeleton, Stack, Typography } from '@mui/material';
import { LockOutlined as LockOutlinedIcon, MailOutline as MailOutlineIcon, WhatsApp as WhatsAppIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { ErrorState } from '@/shared/ui/ErrorState';
import { radiusPx } from '@/theme/tokens';
import { AgentViewerQuery } from '../graphql/agentDetail';
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
	const { t } = useTranslation('agents');
	return (
		<Box role="status" aria-busy="true" aria-label={t('agents:detail.contacts.loading')} sx={boxSx}>
			<Skeleton variant="text" width="70%" aria-hidden="true" />
			<Skeleton variant="text" width="55%" aria-hidden="true" />
		</Box>
	);
};

/** Guests: why contacts are hidden, and a login link that comes back here (D-07/D-23). */
const GuestPrompt = () => {
	const { t } = useTranslation('agents');
	const { asPath } = useRouter();

	return (
		<Box sx={boxSx}>
			<Stack direction="row" spacing={2.5} alignItems="center">
				<LockOutlinedIcon aria-hidden="true" sx={{ color: 'primary.main', fontSize: 20 }} />
				<Typography component="h3" sx={{ fontSize: 14, fontWeight: 700 }}>
					{t('agents:detail.contacts.guestTitle')}
				</Typography>
			</Stack>
			<Typography variant="meta" sx={{ color: 'bodySoft' }}>
				{t('agents:detail.contacts.guestText')}
			</Typography>
			<Button component={NextLink} href={`/login?${new URLSearchParams({ next: asPath })}`} sx={{ height: 42 }}>
				{t('agents:detail.contacts.login')}
			</Button>
		</Box>
	);
};

/** Members: the creator's email / WhatsApp, fetched in the browser with the token (CLAUDE.md rule 11). */
const MemberContacts = ({ agentId }: { agentId: string }) => {
	const { t } = useTranslation('agents');
	const { data, loading, error, refetch } = useQuery(AgentViewerQuery, { variables: { productId: agentId } });

	if (loading && !data) return <LoadingContacts />;
	if (error && !data) {
		return <ErrorState error={error} title={t('agents:detail.contacts.error')} onRetry={() => void refetch()} />;
	}

	const email = data?.getProduct.memberData?.memberEmail;
	const whatsapp = data?.getProduct.memberData?.memberWhatsapp;
	if (!email && !whatsapp) {
		return (
			<Box sx={boxSx}>
				<Typography variant="meta" sx={{ color: 'bodySoft' }}>
					{t('agents:detail.contacts.none')}
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
			<Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
				{email &&
					row(
						<MailOutlineIcon aria-hidden="true" sx={{ color: 'success.main', fontSize: 20 }} />,
						t('agents:detail.contacts.email'),
						`mailto:${email}`,
						email,
					)}
				{whatsapp &&
					row(
						<WhatsAppIcon aria-hidden="true" sx={{ color: 'success.main', fontSize: 20 }} />,
						t('agents:detail.contacts.whatsapp'),
						whatsappHref(whatsapp),
						whatsapp,
					)}
			</Box>
			<Typography variant="caption" component="p">
				{t('agents:detail.contacts.visible')}
			</Typography>
		</Box>
	);
};

/**
 * DESIGN §4: contacts render only for signed-in ACTIVE members. The member query also records the
 * member's view of this agent (see AgentViewerQuery); guests, SSR and bots never count as a view.
 */
export const CreatorContacts = ({ agentId }: { agentId: string }) => {
	const { status, me } = useAuth();

	if (status === 'loading') return <LoadingContacts />;
	if (status === 'member' && me?.memberStatus === 'ACTIVE') return <MemberContacts agentId={agentId} />;
	return <GuestPrompt />;
};
