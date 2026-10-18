import { useId, useState } from 'react';
import type { MouseEvent } from 'react';
import { useRouter } from 'next/router';
import { Button, Menu, MenuItem } from '@mui/material';
import { Check as CheckIcon, Language as LanguageIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { DEFAULT_LOCALE, LOCALES, localePath } from '@/shared/lib/locale';

type LanguageSwitcherProps = {
	/** Called after a language is picked (the mobile drawer closes itself). */
	onSwitch?: () => void;
};

/** en / ko / uz menu. Each item is a real link to the same page and query in that locale. */
export const LanguageSwitcher = ({ onSwitch }: LanguageSwitcherProps) => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
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
				onClick={(event) => setAnchor(event.currentTarget)}
				sx={{ color: 'body', flexShrink: 0 }}
			>
				{current.toUpperCase()}
			</Button>
			<Menu
				id={menuId}
				anchorEl={anchor}
				open={open}
				onClose={() => setAnchor(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			>
				{LOCALES.map((locale) => {
					const selected = locale === current;
					return (
						<MenuItem
							key={locale}
							component="a"
							href={localePath(router.asPath, locale)}
							hrefLang={locale}
							lang={locale}
							selected={selected}
							aria-current={selected ? 'true' : undefined}
							onClick={(event: MouseEvent<HTMLElement>) => switchTo(event, locale)}
							sx={{ gap: 3, minWidth: 160, fontSize: 14, fontWeight: selected ? 700 : 600 }}
						>
							{t(`common:language.names.${locale}`)}
							{selected && <CheckIcon fontSize="small" aria-hidden="true" sx={{ ml: 'auto', color: 'primary.main' }} />}
						</MenuItem>
					);
				})}
			</Menu>
		</>
	);
};
