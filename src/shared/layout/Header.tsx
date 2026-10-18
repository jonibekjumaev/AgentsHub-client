import { useId, useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Box, Button, Divider, Drawer, IconButton, Link, ListItemIcon, Menu, MenuItem, Stack, Typography } from '@mui/material';
import {
	Close as CloseIcon,
	Logout as LogoutIcon,
	Menu as MenuIcon,
	PersonOutline as PersonOutlineIcon,
	SettingsOutlined as SettingsOutlinedIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import type { Me } from '@/auth';
import { Avatar } from '@/shared/ui/Avatar';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';
import { SkipLink } from './SkipLink';
import { MAIN_NAV, SETTINGS_HREF, dashboardHref, isActive } from './navigation';

const profileHref = (me: Me) => `/members/${me._id}`;
const displayName = (me: Me) => me.memberFullName || me.memberNick;

/** Main nav links; a row in the header, a column in the drawer. */
const NavLinks = ({ column = false, onNavigate }: { column?: boolean; onNavigate?: () => void }) => {
	const { t } = useTranslation('common');
	const { pathname } = useRouter();

	return (
		<Box
			component="nav"
			aria-label={t('common:nav.label')}
			sx={{ display: 'flex', flexDirection: column ? 'column' : 'row', gap: column ? 1 : 6 }}
		>
			{MAIN_NAV.map((item) => {
				const active = isActive(pathname, item);
				return (
					<Link
						key={item.href}
						component={NextLink}
						href={item.href}
						underline="none"
						aria-current={active ? 'page' : undefined}
						onClick={onNavigate}
						sx={{
							fontSize: column ? 15 : 14,
							fontWeight: active ? 700 : 600,
							color: active ? 'primary.main' : 'body',
							'&:hover': { color: 'primary.main' },
							...(column && { py: 2.5, px: 3, borderRadius: 2, bgcolor: active ? 'accentSoft' : 'transparent' }),
						}}
					>
						{t(item.labelKey)}
					</Link>
				);
			})}
		</Box>
	);
};

const AccountMenu = ({ me }: { me: Me }) => {
	const { t } = useTranslation('common');
	const { logout } = useAuth();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const menuId = useId();
	const open = Boolean(anchor);
	const close = () => setAnchor(null);

	return (
		<>
			<IconButton
				aria-label={t('common:header.accountMenu', { nick: me.memberNick })}
				aria-haspopup="menu"
				aria-expanded={open}
				aria-controls={open ? menuId : undefined}
				onClick={(event) => setAnchor(event.currentTarget)}
				sx={{ p: 0 }}
			>
				<Avatar memberId={me._id} name={displayName(me)} image={me.memberImage} />
			</IconButton>
			<Menu
				id={menuId}
				anchorEl={anchor}
				open={open}
				onClose={close}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				slotProps={{ paper: { sx: { minWidth: 220, mt: 2 } } }}
			>
				{/* Not focusable (no tabindex), so arrow keys skip it. */}
				<Box component="li" role="none" sx={{ px: 4, pt: 2, pb: 3 }}>
					<Typography variant="meta">
						{t('common:header.signedInAs', {
							nick: me.memberNick,
							role: t(`common:enums.MemberType.${me.memberType}`),
						})}
					</Typography>
				</Box>
				<MenuItem component={NextLink} href={profileHref(me)} onClick={close}>
					<ListItemIcon>
						<PersonOutlineIcon fontSize="small" />
					</ListItemIcon>
					{t('common:header.myProfile')}
				</MenuItem>
				<MenuItem component={NextLink} href={SETTINGS_HREF} onClick={close}>
					<ListItemIcon>
						<SettingsOutlinedIcon fontSize="small" />
					</ListItemIcon>
					{t('common:header.settings')}
				</MenuItem>
				<Divider />
				<MenuItem
					onClick={() => {
						close();
						void logout();
					}}
				>
					<ListItemIcon>
						<LogoutIcon fontSize="small" />
					</ListItemIcon>
					{t('common:header.logout')}
				</MenuItem>
			</Menu>
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

/** < md: the same items in a drawer. */
const MobileMenu = () => {
	const { t } = useTranslation('common');
	const { status, me, logout } = useAuth();
	const [open, setOpen] = useState(false);
	const drawerId = useId();
	const close = () => setOpen(false);

	return (
		<Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto' }}>
			<IconButton
				aria-label={t('common:nav.openMenu')}
				aria-expanded={open}
				aria-controls={open ? drawerId : undefined}
				onClick={() => setOpen(true)}
				sx={{ color: 'ink' }}
			>
				<MenuIcon />
			</IconButton>
			<Drawer
				id={drawerId}
				anchor="right"
				open={open}
				onClose={close}
				PaperProps={{
					role: 'dialog',
					'aria-modal': true,
					'aria-label': t('common:nav.mobileMenu'),
					sx: { width: 300, maxWidth: '85vw', p: 4 },
				}}
			>
				<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
					<Logo onClick={close} />
					<IconButton aria-label={t('common:nav.closeMenu')} onClick={close}>
						<CloseIcon />
					</IconButton>
				</Stack>

				<NavLinks column onNavigate={close} />
				<Divider sx={{ my: 4 }} />

				{status === 'member' && me && (
					<Stack spacing={2}>
						<Stack direction="row" spacing={3} alignItems="center" sx={{ px: 3, pb: 2 }}>
							<Avatar memberId={me._id} name={displayName(me)} image={me.memberImage} />
							<Typography variant="meta" component="span">
								{t('common:header.signedInAs', {
									nick: me.memberNick,
									role: t(`common:enums.MemberType.${me.memberType}`),
								})}
							</Typography>
						</Stack>
						<Button component={NextLink} href={dashboardHref(me.memberType)} onClick={close}>
							{t('common:header.dashboard')}
						</Button>
						<Button component={NextLink} href={profileHref(me)} variant="outlined" onClick={close}>
							{t('common:header.myProfile')}
						</Button>
						<Button component={NextLink} href={SETTINGS_HREF} variant="outlined" onClick={close}>
							{t('common:header.settings')}
						</Button>
						<Button
							variant="outlined"
							startIcon={<LogoutIcon />}
							onClick={() => {
								close();
								void logout();
							}}
						>
							{t('common:header.logout')}
						</Button>
					</Stack>
				)}
				{status === 'guest' && (
					<Stack spacing={2}>
						<Button component={NextLink} href="/login" variant="outlined" onClick={close}>
							{t('common:header.login')}
						</Button>
						<Button component={NextLink} href="/signup" onClick={close}>
							{t('common:header.signup')}
						</Button>
					</Stack>
				)}

				<Box sx={{ mt: 4 }}>
					<LanguageSwitcher onSwitch={close} />
				</Box>
			</Drawer>
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
