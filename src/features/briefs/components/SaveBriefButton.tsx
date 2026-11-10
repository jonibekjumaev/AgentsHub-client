import { Button, ButtonBase } from '@mui/material';
import { Bookmark as BookmarkIcon, BookmarkBorder as BookmarkBorderIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { colors, home, radiusPx } from '@/theme/tokens';
import { useSaveBrief, type SaveTarget } from '../hooks/useSaveBrief';

type SaveBriefButtonProps = {
	brief: SaveTarget;
	/** icon: the 44 × 44 square of the feed row (agentshub-briefs design). labeled: "Save" / "Saved" on the detail page. */
	variant?: 'icon' | 'labeled';
};

/**
 * Save / unsave a brief (D-47): a toggle button with aria-pressed. Nothing for admins or on your own brief.
 * Inactive = aria-disabled (not `disabled`), so it keeps its place in the tab order while meSaved loads.
 */
export const SaveBriefButton = ({ brief, variant = 'icon' }: SaveBriefButtonProps) => {
	const { t } = useTranslation('briefs');
	const { hidden, saved, inactive, pending, toggle } = useSaveBrief(brief);
	if (hidden) return null;

	const icon = saved ? (
		<BookmarkIcon aria-hidden="true" sx={{ fontSize: 18 }} />
	) : (
		<BookmarkBorderIcon aria-hidden="true" sx={{ fontSize: 18 }} />
	);
	const common = {
		'aria-pressed': saved,
		'aria-disabled': inactive || undefined,
		'aria-busy': pending || undefined,
		onClick: () => void toggle(),
	};

	if (variant === 'labeled') {
		return (
			<Button
				variant="outlined"
				startIcon={icon}
				{...common}
				aria-label={t(saved ? 'briefs:save.unsave' : 'briefs:save.save', { title: brief.briefTitle })}
				sx={{
					height: 42,
					borderRadius: radiusPx.md,
					...(saved && { bgcolor: 'accentSoft', borderColor: 'accentBorder', color: 'primary.main' }),
					...(inactive && { opacity: 0.6, cursor: 'not-allowed' }),
				}}
			>
				{t(saved ? 'briefs:save.savedLabel' : 'briefs:save.label')}
			</Button>
		);
	}

	return (
		<ButtonBase
			{...common}
			aria-label={t(saved ? 'briefs:save.unsave' : 'briefs:save.save', { title: brief.briefTitle })}
			sx={{
				flex: 'none',
				width: 44,
				height: 44,
				borderRadius: home.radius.button,
				border: 1,
				borderColor: saved ? 'primary.main' : 'border',
				bgcolor: saved ? 'primary.main' : 'surface',
				color: saved ? colors.white : 'body',
				transition: 'background-color 200ms, color 200ms',
				'&:hover': { borderColor: 'primary.main' },
				'&:focus-visible': { outline: `3px solid ${home.focusRing}`, outlineOffset: '3px' },
				...(inactive && { cursor: 'not-allowed', opacity: 0.6 }),
			}}
		>
			{icon}
		</ButtonBase>
	);
};
