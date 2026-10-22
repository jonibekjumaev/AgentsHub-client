import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { Box, Button, Link, OutlinedInput, Stack, Typography } from '@mui/material';
import {
	ArrowForward as ArrowForwardIcon,
	LockOutlined as LockOutlinedIcon,
	PaidOutlined as PaidOutlinedIcon,
	TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { AgentCard, AgentsListQuery, agentsHref, parseAgentFilters } from '@/features/agents';
import { BriefRow, BriefsListQuery, POST_BRIEF_HREF } from '@/features/briefs';
import { CreatorCard, CreatorsListQuery } from '@/features/creators';
import { AgentCategory } from '@/gql/enums';
import { radiusPx } from '@/theme/tokens';
import { latestBriefsVariables, topAgentsVariables, topCreatorsVariables } from '../lib/home';

const CATEGORIES: AgentCategory[] = [
	AgentCategory.CustomerSupport,
	AgentCategory.Sales,
	AgentCategory.Marketing,
	AgentCategory.Content,
	AgentCategory.DataAnalysis,
	AgentCategory.Automation,
	AgentCategory.Education,
	AgentCategory.Other,
];

const frameSx = { maxWidth: 1200, mx: 'auto', px: { xs: 4, sm: 6 } } as const;

const SectionHead = ({ id, title, text, href, linkLabel }: { id: string; title: string; text?: string; href: string; linkLabel: string }) => (
	<Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 3, mb: 5 }}>
		<div>
			<Typography id={id} variant="h2">
				{title}
			</Typography>
			{text && <Typography sx={{ mt: 1, color: 'muted' }}>{text}</Typography>}
		</div>
		<Link component={NextLink} href={href} sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
			{linkLabel} <ArrowForwardIcon aria-hidden="true" sx={{ fontSize: 16 }} />
		</Link>
	</Box>
);

const Hero = () => {
	const { t } = useTranslation('home');
	const router = useRouter();
	const [text, setText] = useState('');
	const defaults = parseAgentFilters({});

	const onSubmit = (event: FormEvent) => {
		event.preventDefault();
		void router.push(agentsHref({ ...defaults, text: text.trim().slice(0, 100) }));
	};

	return (
		<Box component="section" aria-labelledby="home-title" sx={{ ...frameSx, pt: { xs: 10, md: 16 }, pb: 12 }}>
			<Box sx={{ maxWidth: 720 }}>
				<Typography variant="overline" component="p" sx={{ color: 'primary.main' }}>
					{t('home:hero.eyebrow')}
				</Typography>
				<Typography id="home-title" variant="h1" sx={{ mt: 2, fontSize: { xs: 34, md: 48 }, lineHeight: 1.1 }}>
					{t('home:hero.title')}
				</Typography>
				<Typography sx={{ mt: 4, fontSize: 17, color: 'body' }}>{t('home:hero.text')}</Typography>
				<Box component="form" role="search" onSubmit={onSubmit} sx={{ mt: 6, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
					<OutlinedInput
						type="search"
						value={text}
						onChange={(event) => setText(event.target.value)}
						placeholder={t('home:hero.searchPlaceholder')}
						inputProps={{ 'aria-label': t('home:hero.searchLabel'), maxLength: 100, enterKeyHint: 'search' }}
						sx={{ flex: '1 1 280px', height: 50, bgcolor: 'surface' }}
					/>
					<Button type="submit" sx={{ height: 50, px: 6 }}>
						{t('home:hero.search')}
					</Button>
				</Box>
				<Stack direction="row" spacing={5} useFlexGap flexWrap="wrap" sx={{ mt: 4 }}>
					<Link component={NextLink} href={POST_BRIEF_HREF} sx={{ fontWeight: 700 }}>
						{t('home:hero.postBrief')}
					</Link>
					<Link component={NextLink} href="/signup" sx={{ fontWeight: 700 }}>
						{t('home:hero.sell')}
					</Link>
				</Stack>
			</Box>
		</Box>
	);
};

const Values = () => {
	const { t } = useTranslation('home');
	const items: [ReactNode, string][] = [
		[<LockOutlinedIcon key="contacts" />, 'contacts'],
		[<PaidOutlinedIcon key="pricing" />, 'pricing'],
		[<TrendingUpIcon key="ranking" />, 'ranking'],
	];
	return (
		<Box component="section" aria-label={t('home:values.label')} sx={{ ...frameSx, pb: 12 }}>
			<Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
				{items.map(([icon, key]) => (
					<Stack key={key} direction="row" spacing={3} sx={{ p: 5, bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: radiusPx.lg }}>
						<Box aria-hidden="true" sx={{ color: 'primary.main' }}>
							{icon}
						</Box>
						<div>
							<Typography sx={{ fontWeight: 800 }}>{t(`home:values.${key}.title`)}</Typography>
							<Typography variant="body2" sx={{ mt: 1, color: 'bodySoft' }}>
								{t(`home:values.${key}.text`)}
							</Typography>
						</div>
					</Stack>
				))}
			</Box>
		</Box>
	);
};

const Categories = () => {
	const { t } = useTranslation(['home', 'common']);
	const defaults = parseAgentFilters({});
	return (
		<Box component="section" aria-labelledby="home-categories" sx={{ ...frameSx, pb: 14 }}>
			<SectionHead
				id="home-categories"
				title={t('home:categories.title')}
				text={t('home:categories.text')}
				href={agentsHref(defaults)}
				linkLabel={t('home:categories.all')}
			/>
			<Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
				{CATEGORIES.map((category) => (
					<li key={category}>
						<Link
							component={NextLink}
							href={agentsHref({ ...defaults, categories: [category] })}
							underline="none"
							sx={{
								display: 'block',
								p: 4,
								bgcolor: 'surface',
								border: 1,
								borderColor: 'border',
								borderRadius: radiusPx.lg,
								color: 'ink',
								fontWeight: 700,
								'&:hover': { borderColor: 'accentBorder', bgcolor: 'accentSoft' },
							}}
						>
							{t(`common:enums.AgentCategory.${category}`)}
						</Link>
					</li>
				))}
			</Box>
		</Box>
	);
};

const TopAgents = () => {
	const { t } = useTranslation('home');
	const { data } = useQuery(AgentsListQuery, { variables: topAgentsVariables() });
	const agents = data?.getProducts.list ?? [];
	if (agents.length === 0) return null;
	return (
		<Box component="section" aria-labelledby="home-agents" sx={{ ...frameSx, pb: 14 }}>
			<SectionHead
				id="home-agents"
				title={t('home:agents.title')}
				text={t('home:agents.text')}
				href={agentsHref({ ...parseAgentFilters({}), sort: 'rank' })}
				linkLabel={t('home:agents.all')}
			/>
			<Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 5, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
				{agents.map((agent) => (
					<li key={agent._id}>
						<AgentCard agent={agent} headingLevel="h3" />
					</li>
				))}
			</Box>
		</Box>
	);
};

const BriefsAndCreators = () => {
	const { t } = useTranslation('home');
	const briefs = useQuery(BriefsListQuery, { variables: latestBriefsVariables() }).data?.getBriefs.list ?? [];
	const creators = useQuery(CreatorsListQuery, { variables: topCreatorsVariables() }).data?.getCreators.list ?? [];
	if (briefs.length === 0 && creators.length === 0) return null;
	return (
		<Box component="section" aria-label={t('home:activity')} sx={{ ...frameSx, pb: 14, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start' }}>
			{briefs.length > 0 && (
				<Box sx={{ flex: '999 1 520px', minWidth: 0 }}>
					<SectionHead id="home-briefs" title={t('home:briefs.title')} href="/briefs" linkLabel={t('home:briefs.all')} />
					<Stack component="ul" spacing={3} aria-labelledby="home-briefs" sx={{ m: 0, p: 0, listStyle: 'none' }}>
						{briefs.map((brief) => (
							<li key={brief._id}>
								<BriefRow brief={brief} />
							</li>
						))}
					</Stack>
				</Box>
			)}
			{creators.length > 0 && (
				<Box sx={{ flex: '1 1 320px', minWidth: 0 }}>
					<SectionHead id="home-creators" title={t('home:creators.title')} href="/creators" linkLabel={t('home:creators.all')} />
					<Stack component="ul" spacing={3} aria-labelledby="home-creators" sx={{ m: 0, p: 0, listStyle: 'none' }}>
						{creators.map((creator, index) => (
							<li key={creator._id}>
								<CreatorCard creator={creator} position={index + 1} />
							</li>
						))}
					</Stack>
				</Box>
			)}
		</Box>
	);
};

const HowItWorks = () => {
	const { t } = useTranslation('home');
	return (
		<Box component="section" aria-labelledby="home-how" sx={{ ...frameSx, pb: 14 }}>
			<Typography id="home-how" variant="h2" sx={{ mb: 5 }}>
				{t('home:how.title')}
			</Typography>
			<Box sx={{ display: 'grid', gap: 5, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
				{(['business', 'creator'] as const).map((side) => (
					<Box key={side} sx={{ p: 6, bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: radiusPx.lg }}>
						<Typography variant="overline" component="h3">
							{t(`home:how.${side}.title`)}
						</Typography>
						<Box component="ol" sx={{ m: 0, mt: 4, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
							{([1, 2, 3] as const).map((step) => (
								<Stack component="li" key={step} direction="row" spacing={3}>
									<Box
										aria-hidden="true"
										sx={{ flex: 'none', display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: radiusPx.pill, bgcolor: 'accentSoft', color: 'primary.main', fontWeight: 800, fontSize: 13 }}
									>
										{step}
									</Box>
									<div>
										<Typography sx={{ fontWeight: 700 }}>{t(`home:how.${side}.step${step}.title`)}</Typography>
										<Typography variant="body2" sx={{ color: 'bodySoft' }}>
											{t(`home:how.${side}.step${step}.text`)}
										</Typography>
									</div>
								</Stack>
							))}
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	);
};

const Cta = () => {
	const { t } = useTranslation('home');
	return (
		<Box component="section" aria-labelledby="home-cta" sx={{ ...frameSx, pb: 16 }}>
			<Box
				sx={{
					display: 'flex',
					flexWrap: 'wrap',
					justifyContent: 'space-between',
					alignItems: 'center',
					gap: 4,
					p: { xs: 6, md: 8 },
					bgcolor: 'accentSoft',
					border: 1,
					borderColor: 'accentBorder',
					borderRadius: radiusPx.xl,
				}}
			>
				<div>
					<Typography id="home-cta" variant="h2">
						{t('home:cta.title')}
					</Typography>
					<Typography sx={{ mt: 1, color: 'bodySoft' }}>{t('home:cta.text')}</Typography>
				</div>
				<Button component={NextLink} href={POST_BRIEF_HREF} sx={{ height: 46 }}>
					{t('home:cta.action')}
				</Button>
			</Box>
		</Box>
	);
};

/** / (Home.html). Lists come from the ISR cache; empty sections are left out instead of showing empty states. */
export const HomePage = () => (
	<>
		<Hero />
		<Values />
		<Categories />
		<TopAgents />
		<BriefsAndCreators />
		<HowItWorks />
		<Cta />
	</>
);
