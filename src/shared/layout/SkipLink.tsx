import { Link } from '@mui/material';
import { useTranslation } from 'next-i18next';

export const MAIN_CONTENT_ID = 'main-content';

/** First focusable element on every page: jumps keyboard users past the header. */
export const SkipLink = () => {
	const { t } = useTranslation('common');

	return (
		<Link
			href={`#${MAIN_CONTENT_ID}`}
			sx={{
				position: 'absolute',
				left: 16,
				top: -48,
				zIndex: (theme) => theme.zIndex.tooltip,
				px: 4,
				py: 2,
				borderRadius: 2,
				bgcolor: 'surface',
				border: 1,
				borderColor: 'border',
				'&:focus': { top: 12 },
			}}
		>
			{t('common:a11y.skipToContent')}
		</Link>
	);
};
