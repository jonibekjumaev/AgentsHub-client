import type { ReactNode } from 'react';
import { Box, ButtonBase } from '@mui/material';
import { Apps as AppsIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { AgentCategory } from '@/gql/enums';
import { useFormat } from '@/shared/lib/format';
import { CategoryIcon, categoryTint } from '@/shared/ui/CategoryIcon';
import { catalog, colors, home, radiusPx } from '@/theme/tokens';
import { focusVisibleSx } from './motion';

/** Display order of the category rail (the home, agents and briefs designs). */
export const RAIL_CATEGORIES: readonly AgentCategory[] = [
	AgentCategory.CustomerSupport,
	AgentCategory.Sales,
	AgentCategory.Marketing,
	AgentCategory.Content,
	AgentCategory.DataAnalysis,
	AgentCategory.Automation,
	AgentCategory.Education,
	AgentCategory.Other,
];

/** A count of 0 disables an option, unless it is selected (it must stay removable). */
export const isDeadOption = (count: number | undefined, selected: boolean) => count === 0 && !selected;

type PillProps = {
	label: string;
	count: number | undefined;
	selected: boolean;
	onClick: () => void;
	icon: ReactNode;
	tint: string;
	ink: string;
};

const CategoryPill = ({ label, count, selected, onClick, icon, tint, ink }: PillProps) => {
	const format = useFormat();
	return (
		<ButtonBase
			aria-pressed={selected}
			disabled={isDeadOption(count, selected)}
			onClick={onClick}
			sx={{
				flex: 'none',
				minHeight: 42,
				display: 'flex',
				alignItems: 'center',
				gap: 2,
				pl: 2,
				pr: 3.5,
				borderRadius: radiusPx.pill,
				border: 1,
				borderColor: selected ? home.footer : 'border',
				bgcolor: selected ? home.footer : 'surface',
				color: selected ? colors.white : 'ink',
				fontSize: 14,
				fontWeight: 600,
				whiteSpace: 'nowrap',
				transition: 'background-color 200ms, border-color 200ms, color 200ms',
				'&.Mui-disabled': { opacity: catalog.disabledOpacity, color: 'ink' },
				...focusVisibleSx,
			}}
		>
			<Box
				component="span"
				aria-hidden="true"
				sx={{ width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: '50%', bgcolor: selected ? colors.white : tint, color: ink }}
			>
				{icon}
			</Box>
			{label}
			{/* The space keeps "Sales 2" apart for screen readers; the gap does the visual spacing. */}
			{count !== undefined && ' '}
			{count !== undefined && (
				<Box
					component="span"
					sx={{
						minWidth: 22,
						px: 1.75,
						py: 0.5,
						boxSizing: 'border-box',
						borderRadius: radiusPx.pill,
						bgcolor: selected ? catalog.selectedCountBg : 'neutralSoft',
						color: selected ? colors.white : 'bodySoft',
						fontSize: 12,
						fontWeight: 700,
					}}
				>
					{format.number(count)}
				</Box>
			)}
		</ButtonBase>
	);
};

type CategoryRailProps = {
	selected: AgentCategory[];
	/** undefined while the counts are unknown: every option stays enabled, no number shown. */
	counts: Partial<Record<AgentCategory, number>> | undefined;
	onChange: (categories: AgentCategory[]) => void;
	labels: { group: string; all: string };
};

/** "All" plus the 8 categories, multi-select, each with its icon and live count; scrolls sideways when narrow. */
export const CategoryRail = ({ selected, counts, onChange, labels }: CategoryRailProps) => {
	const { t } = useTranslation('common');
	const allCount = counts ? RAIL_CATEGORIES.reduce((sum, category) => sum + (counts[category] ?? 0), 0) : undefined;
	const toggle = (category: AgentCategory) =>
		onChange(selected.includes(category) ? selected.filter((item) => item !== category) : [...selected, category]);

	return (
		<Box
			role="group"
			aria-label={labels.group}
			sx={{
				display: 'flex',
				gap: 2,
				overflowX: 'auto',
				p: '2px',
				m: '-2px',
				scrollbarWidth: 'none',
				'&::-webkit-scrollbar': { display: 'none' },
			}}
		>
			<CategoryPill
				label={labels.all}
				count={allCount}
				selected={selected.length === 0}
				onClick={() => onChange([])}
				icon={<AppsIcon sx={{ fontSize: 15 }} />}
				tint="accentSoft"
				ink="primary.main"
			/>
			{RAIL_CATEGORIES.map((category) => {
				const [tint, ink] = categoryTint(category);
				return (
					<CategoryPill
						key={category}
						label={t(`common:enums.AgentCategory.${category}`)}
						count={counts?.[category]}
						selected={selected.includes(category)}
						onClick={() => toggle(category)}
						icon={<CategoryIcon category={category} size={15} />}
						tint={tint}
						ink={ink}
					/>
				);
			})}
		</Box>
	);
};
