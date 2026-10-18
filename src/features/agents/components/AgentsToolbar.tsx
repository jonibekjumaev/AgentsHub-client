import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Box, InputAdornment, NativeSelect, OutlinedInput, Typography } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { radiusPx } from '@/theme/tokens';
import type { FilterPatch } from '../hooks/useAgentFilters';
import { AGENT_SORTS, SEARCH_TEXT_MAX, type AgentFilters, type AgentSort } from '../lib/listQuery';

/** Typing pauses this long before the URL (and the list) follows. Enter applies at once. */
export const SEARCH_DEBOUNCE_MS = 400;

type AgentsToolbarProps = {
	filters: AgentFilters;
	onChange: (patch: FilterPatch) => void;
};

const controlSx = { height: 42, borderRadius: radiusPx.md, bgcolor: 'surface', fontSize: 14 } as const;

/** Agents.html header row: title + subtitle, then title search and sort. */
export const AgentsToolbar = ({ filters, onChange }: AgentsToolbarProps) => {
	const { t } = useTranslation('agents');
	const sortId = useId();
	const [text, setText] = useState(filters.text);
	const timer = useRef<ReturnType<typeof setTimeout>>();
	/** The text this input last sent to the URL, to tell our own updates from outside ones. */
	const applied = useRef(filters.text);

	// The URL changed elsewhere (chip removed, Clear all, back button): show its text. Our own update
	// is skipped, so text typed while that push was in flight is not overwritten.
	useEffect(() => {
		if (filters.text === applied.current) return;
		applied.current = filters.text;
		clearTimeout(timer.current);
		setText(filters.text);
	}, [filters.text]);

	useEffect(() => () => clearTimeout(timer.current), []);

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

	return (
		<Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 4 }}>
			<Box>
				<Typography variant="h1">{t('agents:list.title')}</Typography>
				<Typography sx={{ mt: 1.5, color: 'muted' }}>{t('agents:list.subtitle')}</Typography>
			</Box>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, maxWidth: '100%' }}>
				<Box component="form" role="search" onSubmit={onSubmit} sx={{ width: { xs: '100%', sm: 300 } }}>
					<OutlinedInput
						type="search"
						value={text}
						onChange={(event) => onType(event.target.value)}
						placeholder={t('agents:list.searchPlaceholder')}
						fullWidth
						startAdornment={
							<InputAdornment position="start">
								<SearchIcon aria-hidden="true" sx={{ fontSize: 18, color: 'muted' }} />
							</InputAdornment>
						}
						inputProps={{ 'aria-label': t('agents:list.searchLabel'), maxLength: SEARCH_TEXT_MAX, enterKeyHint: 'search' }}
						sx={controlSx}
					/>
				</Box>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<Typography component="label" htmlFor={sortId} variant="body2" sx={{ color: 'muted' }}>
						{t('agents:list.sortLabel')}
					</Typography>
					<NativeSelect
						id={sortId}
						value={filters.sort}
						onChange={(event) => onChange({ sort: event.target.value as AgentSort })}
						input={<OutlinedInput sx={{ ...controlSx, fontWeight: 600 }} />}
					>
						{AGENT_SORTS.map((sort) => (
							<option key={sort} value={sort}>
								{t(`agents:list.sort.${sort}`)}
							</option>
						))}
					</NativeSelect>
				</Box>
			</Box>
		</Box>
	);
};
