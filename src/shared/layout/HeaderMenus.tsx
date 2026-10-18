import NextLink from 'next/link';
import { Box, Button, Divider, Drawer, IconButton, ListItemIcon, Menu, MenuItem, Stack, Typography } from '@mui/material';
import {
	Close as CloseIcon,
	Logout as LogoutIcon,
	PersonOutline as PersonOutlineIcon,
	SettingsOutlined as SettingsOutlinedIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import type { Me } from '@/auth';
import { Avatar } from '@/shared/ui/Avatar';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';
import { NavLinks } from './NavLinks';
import { SETTINGS_HREF, dashboardHref, memberDisplayName, profileHref } from './navigation';

/**
 * The popups Header opens on click. They live in their own chunk (Header loads them with next/dynamic
 * on the first open), so Menu, Drawer, Modal and the focus trap stay out of every page's First Load JS.
 */

type AccountMenuPopupProps = {
	me: Me;
	id: string;
	anchorEl: HTMLElement | null;
	onClose: () => void;
};

export const AccountMenuPopup = ({ me, id, anchorEl, onClose }: AccountMenuPopupProps) => {
	const { t } = useTranslation('common');
	const { logout } = useAuth();

	return (
		<Menu
			id={id}
			anchorEl={anchorEl}
			open={Boolean(anchorEl)}
			onClose={onClose}
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
			<MenuItem component={NextLink} href={profileHref(me)} onClick={onClose}>
				<ListItemIcon>
					<PersonOutlineIcon fontSize="small" />
				</ListItemIcon>
				{t('common:header.myProfile')}
			</MenuItem>
			<MenuItem component={NextLink} href={SETTINGS_HREF} onClick={onClose}>
				<ListItemIcon>
					<SettingsOutlinedIcon fontSize="small" />
				</ListItemIcon>
				{t('common:header.settings')}
			</MenuItem>
			<Divider />
			<MenuItem
				onClick={() => {
					onClose();
					void logout();
				}}
			>
				<ListItemIcon>
					<LogoutIcon fontSize="small" />
				</ListItemIcon>
				{t('common:header.logout')}
			</MenuItem>
		</Menu>
	);
};

type MobileDrawerProps = {
	id: string;
	open: boolean;
	onClose: () => void;
};

/** < md: the header items in a drawer. */
export const MobileDrawer = ({ id, open, onClose }: MobileDrawerProps) => {
	const { t } = useTranslation('common');
	const { status, me, logout } = useAuth();

	return (
		<Drawer
			id={id}
			anchor="right"
			open={open}
			onClose={onClose}
			PaperProps={{
				role: 'dialog',
				'aria-modal': true,
				'aria-label': t('common:nav.mobileMenu'),
				sx: { width: 300, maxWidth: '85vw', p: 4 },
			}}
		>
			<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
				<Logo onClick={onClose} />
				<IconButton aria-label={t('common:nav.closeMenu')} onClick={onClose}>
					<CloseIcon />
				</IconButton>
			</Stack>

			<NavLinks column onNavigate={onClose} />
			<Divider sx={{ my: 4 }} />

			{status === 'member' && me && (
				<Stack spacing={2}>
					<Stack direction="row" spacing={3} alignItems="center" sx={{ px: 3, pb: 2 }}>
						<Avatar memberId={me._id} name={memberDisplayName(me)} image={me.memberImage} />
						<Typography variant="meta" component="span">
							{t('common:header.signedInAs', {
								nick: me.memberNick,
								role: t(`common:enums.MemberType.${me.memberType}`),
							})}
						</Typography>
					</Stack>
					<Button component={NextLink} href={dashboardHref(me.memberType)} onClick={onClose}>
						{t('common:header.dashboard')}
					</Button>
					<Button component={NextLink} href={profileHref(me)} variant="outlined" onClick={onClose}>
						{t('common:header.myProfile')}
					</Button>
					<Button component={NextLink} href={SETTINGS_HREF} variant="outlined" onClick={onClose}>
						{t('common:header.settings')}
					</Button>
					<Button
						variant="outlined"
						startIcon={<LogoutIcon />}
						onClick={() => {
							onClose();
							void logout();
						}}
					>
						{t('common:header.logout')}
					</Button>
				</Stack>
			)}
			{status === 'guest' && (
				<Stack spacing={2}>
					<Button component={NextLink} href="/login" variant="outlined" onClick={onClose}>
						{t('common:header.login')}
					</Button>
					<Button component={NextLink} href="/signup" onClick={onClose}>
						{t('common:header.signup')}
					</Button>
				</Stack>
			)}

			<Box sx={{ mt: 4 }}>
				<LanguageSwitcher onSwitch={onClose} />
			</Box>
		</Drawer>
	);
};
