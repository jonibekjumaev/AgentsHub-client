import {
	AppsOutlined as AppsOutlinedIcon,
	AutoModeOutlined as AutoModeOutlinedIcon,
	BarChartOutlined as BarChartOutlinedIcon,
	CampaignOutlined as CampaignOutlinedIcon,
	ChatBubbleOutline as ChatBubbleOutlineIcon,
	EditNoteOutlined as EditNoteOutlinedIcon,
	SchoolOutlined as SchoolOutlinedIcon,
	TrackChangesOutlined as TrackChangesOutlinedIcon,
} from '@mui/icons-material';
import type { AgentCategory } from '@/gql/enums';
import { home } from '@/theme/tokens';

/** Category icon: the same picture for a category everywhere (home, agents catalog). Decorative. */
export const CategoryIcon = ({ category, size = 24 }: { category: AgentCategory; size?: number }) => {
	const sx = { fontSize: size } as const;
	switch (category) {
		case 'CUSTOMER_SUPPORT':
			return <ChatBubbleOutlineIcon aria-hidden="true" sx={sx} />;
		case 'SALES':
			return <TrackChangesOutlinedIcon aria-hidden="true" sx={sx} />;
		case 'MARKETING':
			return <CampaignOutlinedIcon aria-hidden="true" sx={sx} />;
		case 'CONTENT':
			return <EditNoteOutlinedIcon aria-hidden="true" sx={sx} />;
		case 'DATA_ANALYSIS':
			return <BarChartOutlinedIcon aria-hidden="true" sx={sx} />;
		case 'AUTOMATION':
			return <AutoModeOutlinedIcon aria-hidden="true" sx={sx} />;
		case 'EDUCATION':
			return <SchoolOutlinedIcon aria-hidden="true" sx={sx} />;
		default:
			return <AppsOutlinedIcon aria-hidden="true" sx={sx} />;
	}
};

/** [tint, icon color] of a category. */
export const categoryTint = (category: AgentCategory) => home.categories[category];

