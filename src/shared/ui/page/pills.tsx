import { Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import type { AgentCategory } from '@/gql/graphql';
import { CategoryIcon, categoryTint } from '@/shared/ui/CategoryIcon';
import { colors, radiusPx } from '@/theme/tokens';

/** A small pill with a colored dot: "● Open", "● Past deadline", "● Closed". */
export const StatusPill = ({
	label,
	colors: pill,
}: {
	label: string;
	colors: { bg: string; text: string; dot: string };
}) => (
	<Box
		component="span"
		sx={{
			display: 'inline-flex',
			alignItems: 'center',
			gap: 1.5,
			px: 2.5,
			py: 0.75,
			borderRadius: radiusPx.pill,
			bgcolor: pill.bg,
			fontSize: 12,
			fontWeight: 700,
			color: pill.text,
		}}
	>
		<Box component="span" aria-hidden="true" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: pill.dot }} />
		{label}
	</Box>
);

/** Category tint, a small white circle with the category icon, then the name. */
export const CategoryPill = ({ category }: { category: AgentCategory }) => {
	const { t } = useTranslation('common');
	const [tint, ink] = categoryTint(category);
	return (
		<Box
			component="span"
			sx={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 1.5,
				py: 0.75,
				pl: 1,
				pr: 2.5,
				borderRadius: radiusPx.pill,
				bgcolor: tint,
				fontSize: 12,
				fontWeight: 700,
				color: 'ink',
			}}
		>
			<Box
				component="span"
				aria-hidden="true"
				sx={{
					width: 20,
					height: 20,
					display: 'grid',
					placeItems: 'center',
					borderRadius: '50%',
					bgcolor: colors.white,
					color: ink,
				}}
			>
				<CategoryIcon category={category} size={11} />
			</Box>
			{t(`common:enums.AgentCategory.${category}`)}
		</Box>
	);
};
