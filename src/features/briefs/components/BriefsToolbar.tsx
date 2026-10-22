import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import NextLink from 'next/link';
import { Box, Button, Chip, InputAdornment, NativeSelect, OutlinedInput, Typography } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { CategoryChip } from '@/shared/ui/CategoryChip';
import { radiusPx } from '@/theme/tokens';
import type { BriefFilterPatch } from '../hooks/useBriefFilters';
import {
	BRIEF_CATEGORIES,
	BRIEF_SEARCH_MAX,
	BRIEF_SORTS,
	BRIEF_TABS,
	briefsHref,
	type BriefFilters,
	type BriefSort,
} from '../lib/listQuery';

/** Typing pauses this long before the URL (and the list) follows. Enter applies at once. */
export const BRIEF_SEARCH_DEBOUNCE_MS = 400;

export const POST_BRIEF_HREF = '/dashboard/briefs/new';

const controlSx = { height: 42, borderRadius: radiusPx.md, bgcolor: 'surface', fontSize: 14 } as const;

type BriefsToolbarProps = {
	filters: BriefFilters;
	onChange: (patch: BriefFilterPatch) => void;
};

/** Briefs are posted by USERs: guests see the button too (login first); creators and admins don't. */
const PostBriefButton = () => {
	const { t } = useTranslation('briefs');
	const { status, me } = useAuth();
	const visible = status === 'guest' || (status === 'member' && me?.memberType === 'USER');
	if (!visible) return null;
	return (
		<Button component={NextLink} href={POST_BRIEF_HREF} startIcon={<AddIcon />} sx={{ height: 42 }}>
			{t('briefs:list.post')}
		</Button>
	);
};

const SearchBox = ({ value, onApply }: { value: string; onApply: (text: string) => void }) => {
	const { t } = useTranslation('briefs');
	const [text, setText] = useState(value);
	const timer = useRef<ReturnType<typeof setTimeout>>();
	/** The text this input last sent to the URL, to tell our own updates from outside ones. */
	const applied = useRef(value);

	useEffect(() => {
		if (value === applied.current) return;
		applied.current = value;
		clearTimeout(timer.current);
		setText(value);
	}, [value]);

	useEffect(() => () => clearTimeout(timer.current), []);

	const apply = (next: string) => {
		clearTimeout(timer.current);
		const trimmed = next.trim();
		if (trimmed === value) return;
		applied.current = trimmed;
		onApply(trimmed);
	};

	const onSubmit = (event: FormEvent) => {
		event.preventDefault();
		apply(text);
	};

	return (
		<Box component="form" role="search" onSubmit={onSubmit} sx={{ width: { xs: '100%', sm: 280 } }}>
			<OutlinedInput
				type="search"
				value={text}
				onChange={(event) => {
					setText(event.target.value);
					clearTimeout(timer.current);
					const next = event.target.value;
					timer.current = setTimeout(() => apply(next), BRIEF_SEARCH_DEBOUNCE_MS);
				}}
				placeholder={t('briefs:list.searchPlaceholder')}
				fullWidth
				startAdornment={
					<InputAdornment position="start">
						<SearchIcon aria-hidden="true" sx={{ fontSize: 18, color: 'muted' }} />
					</InputAdornment>
				}
				inputProps={{ 'aria-label': t('briefs:list.searchLabel'), maxLength: BRIEF_SEARCH_MAX, enterKeyHint: 'search' }}
				sx={controlSx}
			/>
		</Box>
	);
};

/** Briefs.html header: title + Post a brief, status tabs, search + sort, category chips. */
export const BriefsToolbar = ({ filters, onChange }: BriefsToolbarProps) => {
	const { t } = useTranslation(['briefs', 'common']);
	const sortId = useId();

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 4 }}>
				<Box sx={{ minWidth: 0 }}>
					<Typography variant="h1">{t('briefs:list.title')}</Typography>
					<Typography sx={{ mt: 1.5, color: 'muted' }}>{t('briefs:list.subtitle')}</Typography>
				</Box>
				<PostBriefButton />
			</Box>

			<Box
				sx={{
					display: 'flex',
					flexWrap: 'wrap',
					justifyContent: 'space-between',
					alignItems: 'flex-end',
					gap: 4,
					borderBottom: 1,
					borderColor: 'border',
				}}
			>
				{/* Links, not buttons: each tab is its own crawlable list (DESIGN §3 Tabs). */}
				<Box component="nav" aria-label={t('briefs:list.tabsLabel')} sx={{ display: 'flex', gap: 6, alignSelf: 'stretch' }}>
					{BRIEF_TABS.map((tab) => {
						const current = filters.tab === tab;
						return (
							<Box
								key={tab}
								component={NextLink}
								href={briefsHref({ ...filters, tab, page: 1 })}
								shallow
								scroll={false}
								aria-current={current ? 'page' : undefined}
								sx={{
									display: 'inline-flex',
									alignItems: 'center',
									py: 3,
									mb: '-1px',
									borderBottom: 2,
									borderColor: current ? 'primary.main' : 'transparent',
									color: current ? 'primary.main' : 'bodySoft',
									fontWeight: current ? 800 : 600,
									fontSize: 15,
									textDecoration: 'none',
									'&:hover': { color: current ? 'primary.main' : 'ink' },
								}}
							>
								{t(`briefs:list.tabs.${tab}`)}
							</Box>
						);
					})}
				</Box>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, pb: 3, maxWidth: '100%' }}>
					<SearchBox value={filters.text} onApply={(text) => onChange({ text })} />
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
						<Typography component="label" htmlFor={sortId} variant="body2" sx={{ color: 'muted' }}>
							{t('briefs:list.sortLabel')}
						</Typography>
						<NativeSelect
							id={sortId}
							value={filters.sort}
							onChange={(event) => onChange({ sort: event.target.value as BriefSort })}
							input={<OutlinedInput sx={{ ...controlSx, fontWeight: 600 }} />}
						>
							{BRIEF_SORTS.map((sort) => (
								<option key={sort} value={sort}>
									{t(`briefs:list.sort.${sort}`)}
								</option>
							))}
						</NativeSelect>
					</Box>
				</Box>
			</Box>

			<Box
				component="ul"
				aria-label={t('briefs:list.categoriesLabel')}
				sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, m: 0, p: 0, listStyle: 'none' }}
			>
				<li>
					<Chip
						component="button"
						label={t('briefs:list.allCategories')}
						onClick={() => onChange({ category: null })}
						aria-pressed={filters.category === null}
						sx={{
							bgcolor: filters.category === null ? 'primary.main' : 'accentSoft',
							color: filters.category === null ? 'primary.contrastText' : 'primary.main',
							fontSize: 12,
							fontWeight: 700,
							border: 0,
							'&:hover': { bgcolor: filters.category === null ? 'accentHover' : 'accentBorder' },
						}}
					/>
				</li>
				{BRIEF_CATEGORIES.map((category) => (
					<li key={category}>
						<CategoryChip
							category={category}
							size="medium"
							selected={filters.category === category}
							onClick={() => onChange({ category: filters.category === category ? null : category })}
						/>
					</li>
				))}
			</Box>
		</Box>
	);
};
