import { Box } from '@mui/material';
import { AgentsAtWork } from './AgentsAtWork';
import { BriefsFeed } from './BriefsFeed';
import { CategorySlider } from './CategorySlider';
import { CtaBand } from './CtaBand';
import { Faq } from './Faq';
import { HeroSection } from './HeroSection';
import { HowItWorks } from './HowItWorks';
import { RankedAgents } from './RankedAgents';
import { RankedCreators } from './RankedCreators';
import { TrustLine } from './TrustLine';
import { frameSx } from './kit';

/**
 * / (agentshub-home design). Every list comes from the ISR cache (pages/index getStaticProps); a list
 * that is empty or failed is left out instead of showing an empty block. Sections alternate background
 * and layout on purpose, so the page has a rhythm.
 */
export const HomePage = () => (
	<>
		<HeroSection />
		<TrustLine />
		<CategorySlider />
		<AgentsAtWork />
		<Box component="section" aria-labelledby="home-agents" sx={{ ...frameSx, pb: { xs: 16, md: 24 } }}>
			<RankedAgents />
			<RankedCreators />
		</Box>
		<HowItWorks />
		<BriefsFeed />
		<CtaBand />
		<Faq />
	</>
);
