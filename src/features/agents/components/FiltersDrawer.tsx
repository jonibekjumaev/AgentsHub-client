import { useId } from 'react';
import { Box, Button, Drawer, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import type { FilterPatch } from '../hooks/useAgentFilters';
import { hasActiveFilters, type AgentFilters } from '../lib/listQuery';
import { AgentFiltersPanel } from './AgentFiltersPanel';

type FiltersDrawerProps = {
	open: boolean;
	onClose: () => void;
	filters: AgentFilters;
	onChange: (patch: FilterPatch) => void;
	onClear: () => void;
};

/**
 * Below md: the filter panel in a drawer, so results come first on the page. Changes apply at once
 * (the list behind updates); "Show results" just closes. Loaded on the first open (next/dynamic).
 */
export const FiltersDrawer = ({ open, onClose, filters, onChange, onClear }: FiltersDrawerProps) => {
	const { t } = useTranslation('agents');
	const titleId = useId();

	return (
		<Drawer
			anchor="left"
			open={open}
			onClose={onClose}
			PaperProps={{
				role: 'dialog',
				'aria-modal': true,
				'aria-labelledby': titleId,
				sx: { width: 340, maxWidth: '90vw', display: 'flex', flexDirection: 'column' },
			}}
		>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					px: 5,
					py: 3,
					borderBottom: 1,
					borderColor: 'borderSoft',
				}}
			>
				<Typography id={titleId} variant="h3" component="h2">
					{t('agents:filters.label')}
				</Typography>
				<IconButton aria-label={t('agents:filters.close')} onClick={onClose}>
					<CloseIcon />
				</IconButton>
			</Box>
			<Box sx={{ flex: 1, overflowY: 'auto', p: 5 }}>
				<AgentFiltersPanel variant="drawer" filters={filters} onChange={onChange} />
			</Box>
			<Box sx={{ display: 'flex', gap: 3, p: 4, borderTop: 1, borderColor: 'borderSoft' }}>
				{hasActiveFilters(filters) && (
					<Button variant="outlined" onClick={onClear} sx={{ flex: 1 }}>
						{t('agents:filters.clearAll')}
					</Button>
				)}
				<Button onClick={onClose} sx={{ flex: 1 }}>
					{t('agents:filters.showResults')}
				</Button>
			</Box>
		</Drawer>
	);
};
