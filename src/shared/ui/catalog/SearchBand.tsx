import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Box, ButtonBase, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
import { visuallyHidden } from '@/shared/ui/visuallyHidden';
import { catalog, colors, home, radiusPx } from '@/theme/tokens';
import { CatalogBand } from './CatalogBand';
import { focusVisibleSx } from './motion';

/** Typing pauses this long before the URL (and the list) follows. Enter or "Search" applies at once. */
export const SEARCH_DEBOUNCE_MS = 300;
/** The example placeholder changes this often, only while the field is empty. */
export const PLACEHOLDER_INTERVAL_MS = 3200;

export type SearchSuggestion = { key: string; label: string; onPick: () => void };

type SearchBandProps = {
	/** id of the h1, also the section's accessible name */
	titleId: string;
	inputId: string;
	title: string;
	text: ReactNode;
	/** Above the headline (the /briefs live badge). */
	badge?: ReactNode;
	/** The applied search text (from the URL). */
	value: string;
	onSearch: (text: string) => void;
	maxLength: number;
	/** Rotating placeholder examples. */
	examples: string[];
	/** "Try:" pills: one click applies a search or a filter. */
	suggestions: SearchSuggestion[];
	/** After the suggestions, behind a thin divider (the /briefs "Post a brief" pill). */
	trailing?: ReactNode;
	labels: { search: string; clear: string; submit: string; try: string };
};

const reducedMotion = () =>
	typeof window !== 'undefined' &&
	typeof window.matchMedia === 'function' &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The catalog band (CatalogBand) with one big search field under the headline (debounced, with a rotating
 * example placeholder and a clear button) and "Try:" suggestions: /agents, /briefs, /creators.
 */
export const SearchBand = ({
	titleId,
	inputId,
	title,
	text: subtitle,
	badge,
	value,
	onSearch,
	maxLength,
	examples,
	suggestions,
	trailing,
	labels,
}: SearchBandProps) => {
	const [text, setText] = useState(value);
	const [example, setExample] = useState(0);
	const timer = useRef<ReturnType<typeof setTimeout>>();
	const input = useRef<HTMLInputElement>(null);
	/** The text this field last sent to the URL, to tell our own updates from outside ones. */
	const applied = useRef(value);

	// The URL changed elsewhere (chip removed, Clear all, back button, a suggestion): show its text.
	useEffect(() => {
		if (value === applied.current) return;
		applied.current = value;
		clearTimeout(timer.current);
		setText(value);
	}, [value]);

	useEffect(() => () => clearTimeout(timer.current), []);

	// Rotate the example placeholder while the field is empty (not under reduced motion).
	const empty = text === '';
	const exampleCount = examples.length;
	useEffect(() => {
		if (!empty || exampleCount < 2 || reducedMotion()) return undefined;
		const id = setInterval(() => setExample((current) => (current + 1) % exampleCount), PLACEHOLDER_INTERVAL_MS);
		return () => clearInterval(id);
	}, [empty, exampleCount]);

	const apply = (raw: string) => {
		clearTimeout(timer.current);
		const next = raw.trim();
		if (next === value) return;
		applied.current = next;
		onSearch(next);
	};

	const onType = (raw: string) => {
		setText(raw);
		clearTimeout(timer.current);
		timer.current = setTimeout(() => apply(raw), SEARCH_DEBOUNCE_MS);
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
		<CatalogBand titleId={titleId} title={title} text={subtitle} badge={badge}>
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
				<Box component="label" htmlFor={inputId} sx={visuallyHidden}>
					{labels.search}
				</Box>
				<Box
					ref={input}
					component="input"
					id={inputId}
					type="search"
					autoComplete="off"
					enterKeyHint="search"
					maxLength={maxLength}
					value={text}
					onChange={(event) => onType((event.target as HTMLInputElement).value)}
					placeholder={examples[example % Math.max(exampleCount, 1)]}
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
						aria-label={labels.clear}
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
						...focusVisibleSx,
					}}
				>
					{labels.submit}
				</ButtonBase>
			</Box>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
				<Typography component="span" sx={{ fontSize: 14, color: home.nightText }}>
					{labels.try}
				</Typography>
				{suggestions.map(({ key, label, onPick }) => (
					<ButtonBase
						key={key}
						onClick={onPick}
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
							...focusVisibleSx,
						}}
					>
						{label}
					</ButtonBase>
				))}
				{trailing && (
					<>
						<Box
							aria-hidden="true"
							sx={{
								width: '1px',
								height: 22,
								mx: 1.5,
								bgcolor: catalog.suggestionBorder,
							}}
						/>
						{trailing}
					</>
				)}
			</Box>
		</CatalogBand>
	);
};
