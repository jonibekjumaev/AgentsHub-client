import type { MouseEvent } from 'react';
import { useRouter } from 'next/router';
import { Menu, MenuItem } from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { LOCALES, localePath } from '@/shared/lib/locale';

type LanguageMenuProps = {
	id: string;
	anchorEl: HTMLElement | null;
	current: string;
	onClose: () => void;
	onPick: (event: MouseEvent<HTMLElement>, locale: string) => void;
};

/** The locale list LanguageSwitcher opens; its own chunk, loaded on the first open. */
export const LanguageMenu = ({ id, anchorEl, current, onClose, onPick }: LanguageMenuProps) => {
	const { asPath } = useRouter();
	const { t } = useTranslation('common');

	return (
		<Menu
			id={id}
			anchorEl={anchorEl}
			open={Boolean(anchorEl)}
			onClose={onClose}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			transformOrigin={{ vertical: 'top', horizontal: 'right' }}
		>
			{LOCALES.map((locale) => {
				const selected = locale === current;
				return (
					<MenuItem
						key={locale}
						component="a"
						href={localePath(asPath, locale)}
						hrefLang={locale}
						lang={locale}
						selected={selected}
						aria-current={selected ? 'true' : undefined}
						onClick={(event: MouseEvent<HTMLElement>) => onPick(event, locale)}
						sx={{ gap: 3, minWidth: 160, fontSize: 14, fontWeight: selected ? 700 : 600 }}
					>
						{t(`common:language.names.${locale}`)}
						{selected && <CheckIcon fontSize="small" aria-hidden="true" sx={{ ml: 'auto', color: 'primary.main' }} />}
					</MenuItem>
				);
			})}
		</Menu>
	);
};
