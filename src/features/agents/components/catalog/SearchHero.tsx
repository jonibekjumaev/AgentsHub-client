import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Box, ButtonBase, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { AgentCategory, ProductPricing } from '@/gql/enums';
import { useFormat } from '@/shared/lib/format';
import { visuallyHidden } from '@/shared/ui/visuallyHidden';
import { catalog, colors, home, radiusPx } from '@/theme/tokens';
import type { FilterPatch } from '../../hooks/useAgentFilters';
import { SEARCH_TEXT_MAX, type AgentFilters } from '../../lib/listQuery';

/** Typing pauses this long before the URL (and the list) follows. Enter or "Search" applies at once. */
export const SEARCH_DEBOUNCE_MS = 300;
/** The example placeholder changes this often, only while the field is empty. */
export const PLACEHOLDER_INTERVAL_MS = 3200;
export const PLACEHOLDER_COUNT = 5;

/** "Try:" pills: one click applies a search or a filter. */
const SUGGESTIONS: { key: string; patch: FilterPatch }[] = [
	{ key: 'support', patch: { categories: [AgentCategory.CustomerSupport] } },
	{ key: 'invoices', patch: { text: 'invoice' } },
	{ key: 'blog', patch: { text: 'blog' } },
	{ key: 'free', patch: { pricing: [ProductPricing.Free] } },
];

const reducedMotion = () =>
	typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type SearchHeroProps = {
	filters: AgentFilters;
	onChange: (patch: FilterPatch) => void;
	/** All ACTIVE agents (the sum of the category counts); null while unknown. */
	total: number | null;
};

/**
 * The dark search band at the top of /agents: headline, one big search field (debounced, with a rotating
 * example placeholder and a clear button) and "Try:" suggestions.
 */
export const SearchHero = ({ filters, onChange, total }: SearchHeroProps) => {
	const { t } = useTranslation('agents');
	const format = useFormat();
	const [text, setText] = useState(filters.text);
	const [example, setExample] = useState(0);
	const timer = useRef<ReturnType<typeof setTimeout>>();
	const input = useRef<HTMLInputElement>(null);
	/** The text this field last sent to the URL, to tell our own updates from outside ones. */
	const applied = useRef(filters.text);

	// The URL changed elsewhere (chip removed, Clear all, back button, a suggestion): show its text.
	useEffect(() => {
		if (filters.text === applied.current) return;
		applied.current = filters.text;
		clearTimeout(timer.current);
		setText(filters.text);
	}, [filters.text]);

	useEffect(() => () => clearTimeout(timer.current), []);

	// Rotate the example placeholder while the field is empty (not under reduced motion).
	const empty = text === '';
	useEffect(() => {
		if (!empty || reducedMotion()) return undefined;
		const id = setInterval(() => setExample((value) => (value + 1) % PLACEHOLDER_COUNT), PLACEHOLDER_INTERVAL_MS);
		return () => clearInterval(id);
	}, [empty]);

	const apply = (value: string) => {
		clearTimeout(timer.current);
		const next = value.trim();
		if (next === filters.text) return;
		applied.current = next;
		onChange({ text: next });
	};

	const onType = (value: string) => {
		setText(value);
		clearTimeout(timer.current);
		timer.current = setTimeout(() => apply(value), SEARCH_DEBOUNCE_MS);
	};

	const onSubmit = (event: FormEvent) => {
		event.preventDefault();
		apply(text);
	};

	const clearText = () => {
		setText('');
		apply('');
		input.current?.focus();
	};

	return (
		<Box component="section" aria-labelledby="agents-title" sx={{ position: 'relative', overflow: 'hidden', bgcolor: home.night, color: colors.white }}>
			<Box
				aria-hidden="true"
				sx={{
					position: 'absolute',
					inset: 0,
					pointerEvents: 'none',
					backgroundImage: catalog.heroDots,
					backgroundSize: '24px 24px',
					WebkitMaskImage: catalog.heroDotsMask,
					maskImage: catalog.heroDotsMask,
				}}
			/>
			<Box
				aria-hidden="true"
				sx={{
					position: 'absolute',
					left: '50%',
					bottom: -260,
					width: 900,
					height: 420,
					ml: '-450px',
					borderRadius: '50%',
					bgcolor: catalog.heroGlow,
					filter: 'blur(100px)',
					pointerEvents: 'none',
				}}
			/>
			<Box
				sx={{
					position: 'relative',
					maxWidth: 960,
					mx: 'auto',
					px: { xs: 4, sm: 6 },
					pt: { xs: 12, md: 16 },
					pb: { xs: 11, md: 14 },
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 5.5,
					textAlign: 'center',
				}}
			>
				<Typography
					id="agents-title"
					variant="h1"
					sx={{ fontSize: 'clamp(38px, 5vw, 64px)', lineHeight: 1, fontWeight: 700, letterSpacing: '-0.04em', color: colors.white }}
				>
					{t('agents:hero.title')}
				</Typography>
				<Typography sx={{ maxWidth: 560, fontSize: { xs: 16, sm: 18 }, lineHeight: 1.5, color: home.nightText }}>
					{/* Text search covers names only today; descriptions come with semantic search (embeddings). */}
					{total === null ? t('agents:hero.textNoCount') : t('agents:hero.text', { count: total, formatted: format.number(total) })}
				</Typography>
				<Box
					component="form"
					role="search"
					onSubmit={onSubmit}
					sx={{
						width: '100%',
						maxWidth: 760,
						display: 'flex',
						alignItems: 'center',
						gap: 2.5,
						py: 2,
						pr: 2,
						pl: 5,
						boxSizing: 'border-box',
						borderRadius: '18px',
						bgcolor: colors.white,
						boxShadow: catalog.searchShadow,
						transition: 'box-shadow 200ms',
						'&:focus-within': { boxShadow: catalog.searchFocus },
					}}
				>
					<SearchIcon aria-hidden="true" sx={{ fontSize: 22, color: 'primary.main', flex: 'none' }} />
					<Box component="label" htmlFor="agents-search" sx={visuallyHidden}>
						{t('agents:list.searchLabel')}
					</Box>
					<Box
						ref={input}
						component="input"
						id="agents-search"
						type="search"
						autoComplete="off"
						enterKeyHint="search"
						maxLength={SEARCH_TEXT_MAX}
						value={text}
						onChange={(event) => onType((event.target as HTMLInputElement).value)}
						placeholder={t(`agents:hero.examples.${example}`)}
						sx={{
							flex: '1 1 auto',
							minWidth: 0,
							height: 52,
							border: 0,
							bgcolor: 'transparent',
							font: 'inherit',
							fontSize: { xs: 16, sm: 18 },
							fontWeight: 500,
							color: 'ink',
							'&::placeholder': { color: catalog.placeholder, opacity: 1 },
							'&:focus': { outline: 'none' },
							// The browser's own clear button would duplicate ours.
							'&::-webkit-search-cancel-button': { display: 'none' },
						}}
					/>
					{text && (
						<IconButton
							aria-label={t('agents:hero.clear')}
							onClick={clearText}
							sx={{ flex: 'none', width: 40, height: 40, bgcolor: 'neutralSoft', color: 'body' }}
						>
							<CloseIcon sx={{ fontSize: 16 }} />
						</IconButton>
					)}
					<ButtonBase
						type="submit"
						sx={{
							display: { xs: 'none', sm: 'inline-flex' },
							flex: 'none',
							height: 52,
							px: 6,
							borderRadius: radiusPx.lg,
							bgcolor: 'primary.main',
							color: colors.white,
							fontSize: 16,
							fontWeight: 700,
							'&:hover': { bgcolor: 'accentHover' },
							'&:focus-visible': { outline: `3px solid ${home.focusRing}`, outlineOffset: '3px' },
						}}
					>
						{t('agents:hero.submit')}
					</ButtonBase>
				</Box>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
					<Typography component="span" sx={{ fontSize: 14, color: home.nightText }}>
						{t('agents:hero.try')}
					</Typography>
					{SUGGESTIONS.map(({ key, patch }) => (
						<ButtonBase
							key={key}
							onClick={() => onChange(patch)}
							sx={{
								minHeight: 36,
								px: 3.5,
								border: 1,
								borderColor: catalog.suggestionBorder,
								borderRadius: radiusPx.pill,
								bgcolor: catalog.suggestionBg,
								color: colors.white,
								fontSize: 14,
								fontWeight: 500,
								'&:hover': { bgcolor: home.nightFillStrong },
								'&:focus-visible': { outline: `3px solid ${home.focusRing}`, outlineOffset: '3px' },
							}}
						>
							{t(`agents:hero.suggestions.${key}`)}
						</ButtonBase>
					))}
				</Box>
			</Box>
		</Box>
	);
};
