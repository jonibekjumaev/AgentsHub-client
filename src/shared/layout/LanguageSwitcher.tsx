import { useId, useState } from 'react';
import type { MouseEvent } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Button } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { DEFAULT_LOCALE } from '@/shared/lib/locale';

// Menu + Popover + Modal are only needed after a click: loaded then, and kept mounted afterwards.
const LanguageMenu = dynamic(() => import('./LanguageMenu').then((mod) => mod.LanguageMenu), { ssr: false });

type LanguageSwitcherProps = {
	/** Called after a language is picked (the mobile drawer closes itself). */
	onSwitch?: () => void;
};

/** en / ko / uz menu. Each item is a real link to the same page and query in that locale. */
export const LanguageSwitcher = ({ onSwitch }: LanguageSwitcherProps) => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const [loaded, setLoaded] = useState(false);
	const menuId = useId();
	const open = Boolean(anchor);
	const current = router.locale ?? DEFAULT_LOCALE;

	const switchTo = (event: MouseEvent<HTMLElement>, locale: string) => {
		setAnchor(null);
		// Let the browser handle new-tab / new-window clicks on the link.
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
		event.preventDefault();
		onSwitch?.();
		if (locale === current) return;
		void router.push({ pathname: router.pathname, query: router.query }, router.asPath, { locale });
	};

	return (
		<>
			<Button
				variant="text"
				size="small"
				startIcon={<LanguageIcon />}
				aria-label={t('common:language.label', { language: t(`common:language.names.${current}`) })}
				aria-haspopup="menu"
				aria-expanded={open}
				aria-controls={open ? menuId : undefined}
				onClick={(event) => {
					setAnchor(event.currentTarget);
					setLoaded(true);
				}}
				sx={{ color: 'body', flexShrink: 0 }}
			>
				{current.toUpperCase()}
			</Button>
			{loaded && (
				<LanguageMenu id={menuId} anchorEl={anchor} current={current} onClose={() => setAnchor(null)} onPick={switchTo} />
			)}
		</>
	);
};
