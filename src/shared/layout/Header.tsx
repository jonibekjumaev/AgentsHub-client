import { useId, useState } from 'react';
import NextLink from 'next/link';
import dynamic from 'next/dynamic';
import { Box, Button, IconButton, Stack } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import type { Me } from '@/auth';
import { Avatar } from '@/shared/ui/Avatar';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';
import { NavLinks } from './NavLinks';
import { SkipLink } from './SkipLink';
import { dashboardHref, memberDisplayName } from './navigation';

// Click-only popups: loaded on the first open, then kept mounted so their close transition still plays.
const AccountMenuPopup = dynamic(() => import('./HeaderMenus').then((mod) => mod.AccountMenuPopup), { ssr: false });
const MobileDrawer = dynamic(() => import('./HeaderMenus').then((mod) => mod.MobileDrawer), { ssr: false });

const AccountMenu = ({ me }: { me: Me }) => {
	const { t } = useTranslation('common');
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const [loaded, setLoaded] = useState(false);
	const menuId = useId();
	const open = Boolean(anchor);

	return (
		<>
			<IconButton
				aria-label={t('common:header.accountMenu', { nick: me.memberNick })}
				aria-haspopup="menu"
				aria-expanded={open}
				aria-controls={open ? menuId : undefined}
				onClick={(event) => {
					setAnchor(event.currentTarget);
					setLoaded(true);
				}}
				sx={{ p: 0 }}
			>
				<Avatar memberId={me._id} name={memberDisplayName(me)} image={me.memberImage} />
			</IconButton>
			{loaded && <AccountMenuPopup me={me} id={menuId} anchorEl={anchor} onClose={() => setAnchor(null)} />}
		</>
	);
};

/** Right side of the desktop header, by auth status. */
const AuthActions = () => {
	const { t } = useTranslation('common');
	const { status, me } = useAuth();

	// Session unknown (SSR, first render, getMe in flight): reserve the space, show neither state.
	if (status === 'loading') return <Box aria-hidden="true" sx={{ width: 180, height: 40 }} />;

	if (status === 'member' && me) {
		return (
			<Stack direction="row" spacing={3} alignItems="center">
				<Button component={NextLink} href={dashboardHref(me.memberType)} variant="outlined" sx={{ height: 40 }}>
					{t('common:header.dashboard')}
				</Button>
				<AccountMenu me={me} />
			</Stack>
		);
	}

	return (
		<Stack direction="row" spacing={2} alignItems="center">
			<Button component={NextLink} href="/login" variant="outlined" sx={{ height: 40 }}>
				{t('common:header.login')}
			</Button>
			<Button component={NextLink} href="/signup" sx={{ height: 40 }}>
				{t('common:header.signup')}
			</Button>
		</Stack>
	);
};

/** < md: the menu button; the drawer itself is loaded on the first open. */
const MobileMenu = () => {
	const { t } = useTranslation('common');
	const [open, setOpen] = useState(false);
	const [loaded, setLoaded] = useState(false);
	const drawerId = useId();

	return (
		<Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto' }}>
			<IconButton
				aria-label={t('common:nav.openMenu')}
				aria-expanded={open}
				aria-controls={open ? drawerId : undefined}
				onClick={() => {
					setOpen(true);
					setLoaded(true);
				}}
				sx={{ color: 'ink' }}
			>
				<MenuIcon />
			</IconButton>
			{loaded && <MobileDrawer id={drawerId} open={open} onClose={() => setOpen(false)} />}
		</Box>
	);
};

/** DESIGN §3 Navigation: logo, main nav, language + auth actions; a drawer below md. */
export const Header = () => (
	<Box component="header" sx={{ bgcolor: 'surface', borderBottom: 1, borderColor: 'border' }}>
		<SkipLink />
		<Box
			sx={{
				maxWidth: 1200,
				mx: 'auto',
				px: { xs: 4, sm: 6 },
				minHeight: 64,
				display: 'flex',
				alignItems: 'center',
				gap: 8,
			}}
		>
			<Logo />
			<Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 8, flex: 1 }}>
				<NavLinks />
				<Stack direction="row" spacing={3} alignItems="center" sx={{ ml: 'auto' }}>
					<LanguageSwitcher />
					<AuthActions />
				</Stack>
			</Box>
			<MobileMenu />
		</Box>
	</Box>
);
