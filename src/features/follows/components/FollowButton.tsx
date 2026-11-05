import { Button } from '@mui/material';
import { Check as CheckIcon, PersonAddAlt1Outlined as PersonAddIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { useFollow } from '../hooks/useFollow';

type FollowButtonProps = {
	memberId: string;
	nick: string;
	/** A better answer than the id list, when the page has one (profile meFollowed). */
	following?: boolean | null;
	size?: 'small' | 'medium';
	fullWidth?: boolean;
	/**
	 * soft (default): accentSoft pill for lists. solid: the profile's main action — a filled button
	 * while not following; "Following" turns into "Unfollow" on hover so the click is predictable.
	 */
	variant?: 'soft' | 'solid';
};

/**
 * Follow / Following toggle (DESIGN §3 Soft button, aria-pressed). Hidden on your own card or profile
 * (following yourself is refused, §3.9). Hidden from admins: they can't follow anyone (D-40).
 * Guests see it and go to login.
 */
export const FollowButton = ({ memberId, nick, following: known, size = 'medium', fullWidth, variant = 'soft' }: FollowButtonProps) => {
	const { t } = useTranslation('follows');
	const { me } = useAuth();
	const { following, isSelf, pending, loading, toggle } = useFollow(memberId, known);
	if (isSelf || me?.memberType === 'ADMIN') return null;

	const inactive = pending || loading;
	const solid = variant === 'solid';
	const colorsSx = following
		? { bgcolor: 'surface', borderColor: solid ? 'inputBorder' : 'border', color: 'ink' }
		: solid
			? { bgcolor: 'primary.main', borderColor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'accentHover', borderColor: 'accentHover' } }
			: { bgcolor: 'accentSoft', borderColor: 'accentBorder', color: 'primary.main' };
	return (
		<Button
			variant="outlined"
			size={size}
			fullWidth={fullWidth}
			aria-pressed={following}
			aria-disabled={inactive || undefined}
			aria-busy={loading || undefined}
			aria-label={t(following ? 'follows:followingLabel' : 'follows:followLabel', { nick })}
			startIcon={following ? <CheckIcon /> : <PersonAddIcon />}
			onClick={() => {
				if (!inactive) void toggle(nick);
			}}
			sx={{
				flex: 'none',
				...colorsSx,
				...(solid && following && { '& .label-hover': { display: 'none' }, '&:hover .label-on': { display: 'none' }, '&:hover .label-hover': { display: 'inline' } }),
				...(inactive && { opacity: 0.6, cursor: 'not-allowed' }),
			}}
		>
			{solid && following ? (
				<>
					<span className="label-on">{t('follows:following')}</span>
					<span className="label-hover" aria-hidden="true">
						{t('follows:unfollow')}
					</span>
				</>
			) : (
				t(following ? 'follows:following' : 'follows:follow')
			)}
		</Button>
	);
};
