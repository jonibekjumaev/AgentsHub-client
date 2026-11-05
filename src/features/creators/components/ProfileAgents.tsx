import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import Image from 'next/image';
import NextLink from 'next/link';
import { useQuery } from '@apollo/client';
import {
	Box,
	InputAdornment,
	Link,
	NativeSelect,
	OutlinedInput,
	Skeleton,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from '@mui/material';
import {
	GridViewOutlined as GridViewOutlinedIcon,
	Search as SearchIcon,
	SearchOff as SearchOffIcon,
	SmartToyOutlined as SmartToyOutlinedIcon,
	ViewListOutlined as ViewListOutlinedIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { AGENT_CATEGORIES, AgentCard, AgentsListQuery, SEARCH_TEXT_MAX, agentHref, type AgentSort } from '@/features/agents';
import type { AgentCategory } from '@/gql/enums';
import type { AgentCardFragment, MemberProfileQuery as MemberProfileData } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { mediaUrl } from '@/shared/lib/media';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Pagination } from '@/shared/ui/Pagination';
import { PriceTag } from '@/shared/ui/PriceTag';
import { radiusPx } from '@/theme/tokens';
import {
	DEFAULT_PROFILE_AGENT_FILTERS,
	PROFILE_AGENT_SORTS,
	PROFILE_AGENT_TOOLBAR_MIN,
	PROFILE_WORK_PAGE_SIZE,
	hasProfileAgentFilters,
	profileAgentsVariables,
	type ProfileAgentFilters,
} from '../lib/profile';

type Member = MemberProfileData['getMember'];
type Layout = 'grid' | 'list';

/** Typing pauses this long before the list follows (same as /agents). */
const SEARCH_DEBOUNCE_MS = 400;

const controlSx = { height: 40, borderRadius: radiusPx.sm, bgcolor: 'surface', fontSize: 14 } as const;

type ToolbarProps = {
	filters: ProfileAgentFilters;
	onChange: (patch: Partial<ProfileAgentFilters>) => void;
	layout: Layout;
	onLayout: (layout: Layout) => void;
};

/** "/" focuses the search unless the user is already typing somewhere (GitHub / YouTube convention). */
const isTypingTarget = (element: Element | null) =>
	element instanceof HTMLElement && (element.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName));

const Toolbar = ({ filters, onChange, layout, onLayout }: ToolbarProps) => {
	const { t } = useTranslation(['creators', 'agents', 'common']);
	const [text, setText] = useState(filters.text);
	const timer = useRef<ReturnType<typeof setTimeout>>();
	const searchRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey || isTypingTarget(document.activeElement)) return;
			event.preventDefault();
			searchRef.current?.focus();
		};
		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	}, []);

	// "Clear filters" resets the text from outside.
	useEffect(() => {
		if (filters.text === '') setText('');
	}, [filters.text]);
	useEffect(() => () => clearTimeout(timer.current), []);

	const onType = (value: string) => {
		setText(value);
		clearTimeout(timer.current);
		timer.current = setTimeout(() => onChange({ text: value.trim(), page: 1 }), SEARCH_DEBOUNCE_MS);
	};

	/** Esc clears the search at once (no debounce); a second Esc leaves the field as the browser does. */
	const onSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
		if (event.key !== 'Escape' || text === '') return;
		event.preventDefault();
		clearTimeout(timer.current);
		setText('');
		onChange({ text: '', page: 1 });
	};

	return (
		<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
			<OutlinedInput
				type="search"
				value={text}
				onChange={(event) => onType(event.target.value)}
				onKeyDown={onSearchKeyDown}
				inputRef={searchRef}
				placeholder={t('agents:list.searchPlaceholder')}
				startAdornment={
					<InputAdornment position="start">
						<SearchIcon aria-hidden="true" sx={{ fontSize: 18, color: 'muted' }} />
					</InputAdornment>
				}
				endAdornment={
					<Box
						component="kbd"
						aria-hidden="true"
						sx={{
							display: { xs: 'none', sm: 'grid' },
							placeItems: 'center',
							minWidth: 24,
							height: 24,
							px: 1.5,
							border: 1,
							borderColor: 'border',
							borderRadius: radiusPx.sm,
							bgcolor: 'ground',
							color: 'muted',
							fontFamily: 'inherit',
							fontSize: 12,
						}}
					>
						/
					</Box>
				}
				inputProps={{
					'aria-label': t('agents:list.searchLabel'),
					'aria-keyshortcuts': '/',
					maxLength: SEARCH_TEXT_MAX,
					enterKeyHint: 'search',
				}}
				sx={{ ...controlSx, flex: '1 1 220px' }}
			/>
			<NativeSelect
				value={filters.category ?? ''}
				onChange={(event) => onChange({ category: (event.target.value || null) as AgentCategory | null, page: 1 })}
				inputProps={{ 'aria-label': t('creators:profile.agents.categoryLabel') }}
				input={<OutlinedInput sx={{ ...controlSx, flex: { xs: '1 1 140px', sm: '0 0 auto' } }} />}
			>
				<option value="">{t('creators:profile.agents.allCategories')}</option>
				{AGENT_CATEGORIES.map((category) => (
					<option key={category} value={category}>
						{t(`common:enums.AgentCategory.${category}`)}
					</option>
				))}
			</NativeSelect>
			<NativeSelect
				value={filters.sort}
				onChange={(event) => onChange({ sort: event.target.value as AgentSort, page: 1 })}
				inputProps={{ 'aria-label': t('agents:list.sortLabel') }}
				input={<OutlinedInput sx={{ ...controlSx, flex: { xs: '1 1 140px', sm: '0 0 auto' } }} />}
			>
				{PROFILE_AGENT_SORTS.map((sort) => (
					<option key={sort} value={sort}>
						{t(`agents:list.sort.${sort}`)}
					</option>
				))}
			</NativeSelect>
			<ToggleButtonGroup
				exclusive
				size="small"
				value={layout}
				onChange={(_, value: Layout | null) => value && onLayout(value)}
				aria-label={t('creators:profile.agents.layout')}
				sx={{ height: 40, bgcolor: 'surface' }}
			>
				<ToggleButton value="grid" aria-label={t('creators:profile.agents.grid')} sx={{ px: 2.5 }}>
					<GridViewOutlinedIcon fontSize="small" />
				</ToggleButton>
				<ToggleButton value="list" aria-label={t('creators:profile.agents.list')} sx={{ px: 2.5 }}>
					<ViewListOutlinedIcon fontSize="small" />
				</ToggleButton>
			</ToggleButtonGroup>
		</Box>
	);
};

const Thumb = ({ image }: { image: string | undefined }) => {
	const src = mediaUrl(image);
	return (
		<Box
			sx={{
				position: 'relative',
				flex: 'none',
				width: 64,
				height: 44,
				borderRadius: radiusPx.sm,
				overflow: 'hidden',
				display: 'grid',
				placeItems: 'center',
				bgcolor: 'accentSoft',
				color: 'primary.main',
			}}
		>
			{src ? <Image src={src} alt="" fill sizes="64px" style={{ objectFit: 'cover' }} /> : <SmartToyOutlinedIcon aria-hidden="true" fontSize="small" />}
		</Box>
	);
};

/** List view: one row per agent. Price and likes hide on phones; the title link opens the agent. */
const AgentTable = ({ agents }: { agents: AgentCardFragment[] }) => {
	const { t } = useTranslation(['creators', 'common']);
	const format = useFormat();
	const headSx = { fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'muted', bgcolor: 'ground' } as const;
	const wide = { display: { xs: 'none', sm: 'table-cell' } } as const;

	return (
		<Box sx={{ border: 1, borderColor: 'border', borderRadius: radiusPx.xl, overflow: 'hidden', bgcolor: 'surface' }}>
			<Table size="small" aria-label={t('creators:profile.tabs.agents')}>
				<TableHead>
					<TableRow>
						<TableCell sx={headSx}>{t('creators:profile.agents.colAgent')}</TableCell>
						<TableCell sx={{ ...headSx, ...wide }}>{t('creators:profile.agents.colPrice')}</TableCell>
						<TableCell align="right" sx={{ ...headSx, ...wide }}>
							{t('creators:profile.agents.colLikes')}
						</TableCell>
						<TableCell align="right" sx={headSx}>
							{t('creators:profile.agents.colViews')}
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{agents.map((agent) => (
						<TableRow key={agent._id} hover>
							<TableCell sx={{ py: 3 }}>
								<Stack direction="row" spacing={3} alignItems="center" sx={{ minWidth: 0 }}>
									<Thumb image={agent.productImages[0]} />
									<Box sx={{ minWidth: 0 }}>
										<Link component={NextLink} href={agentHref(agent._id)} underline="hover" sx={{ display: 'block', color: 'ink', fontWeight: 700, overflowWrap: 'anywhere' }}>
											{agent.productTitle}
										</Link>
										<Typography variant="caption" component="p">
											{t(`common:enums.AgentCategory.${agent.productCategory}`)}
										</Typography>
									</Box>
								</Stack>
							</TableCell>
							<TableCell sx={wide}>
								<PriceTag pricing={agent.productPricing} price={agent.productPrice} />
							</TableCell>
							<TableCell align="right" sx={{ ...wide, fontVariantNumeric: 'tabular-nums' }}>
								{format.compact(agent.productLikes)}
							</TableCell>
							<TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
								{format.compact(agent.productViews)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Box>
	);
};

/**
 * A creator's ACTIVE agents, 6 per page. With more than one page the toolbar appears: title search,
 * category, sort and a grid / list switch. Filters live in component state; the tab lives in the URL.
 */
export const ProfileAgents = ({ member }: { member: Member }) => {
	const { t } = useTranslation('creators');
	const format = useFormat();
	const [filters, setFilters] = useState<ProfileAgentFilters>(DEFAULT_PROFILE_AGENT_FILTERS);
	const [layout, setLayout] = useState<Layout>('grid');
	const variables = useMemo(() => profileAgentsVariables(member._id, filters), [member._id, filters]);
	const { data, previousData, loading, error, refetch } = useQuery(AgentsListQuery, { variables });
	const shown = data ?? previousData;
	const agents = shown?.getProducts.list ?? [];
	const total = shown?.getProducts.metaCounter?.[0]?.total ?? 0;
	const filtered = hasProfileAgentFilters(filters);
	const withToolbar = member.memberProducts > PROFILE_AGENT_TOOLBAR_MIN;
	const update = (patch: Partial<ProfileAgentFilters>) => setFilters((current) => ({ ...current, ...patch }));

	const list = () => {
		if (loading && !shown) return <Skeleton variant="rounded" height={240} aria-label={t('creators:profile.loading')} />;
		if (error && !shown) return <ErrorState error={error} title={t('creators:profile.workError')} onRetry={() => void refetch()} />;
		if (agents.length === 0) {
			return filtered ? (
				<EmptyState
					icon={<SearchOffIcon />}
					title={t('creators:profile.agents.noMatch')}
					text={t('creators:profile.agents.noMatchText')}
					action={{ label: t('creators:profile.agents.clearFilters'), onClick: () => setFilters({ ...DEFAULT_PROFILE_AGENT_FILTERS, sort: filters.sort }) }}
					headingLevel="h3"
				/>
			) : (
				<EmptyState
					icon={<SmartToyOutlinedIcon />}
					title={t('creators:profile.noAgents')}
					text={t('creators:profile.noAgentsText', { nick: member.memberNick })}
					headingLevel="h3"
				/>
			);
		}
		const from = (filters.page - 1) * PROFILE_WORK_PAGE_SIZE + 1;
		return (
			<Stack spacing={4} sx={{ opacity: loading ? 0.6 : 1, transition: 'opacity 150ms ease' }}>
				{withToolbar && (
					<Typography variant="caption" component="p" aria-live="polite">
						{t('creators:profile.agents.range', {
							from: format.number(from),
							to: format.number(from + agents.length - 1),
							total: format.number(total),
						})}
					</Typography>
				)}
				{layout === 'grid' ? (
					<Box
						component="ul"
						aria-label={t('creators:profile.tabs.agents')}
						sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: { xs: 4, md: 5 } }}
					>
						{agents.map((agent) => (
							<li key={agent._id}>
								<AgentCard agent={agent} headingLevel="h3" />
							</li>
						))}
					</Box>
				) : (
					<AgentTable agents={agents} />
				)}
				<Pagination page={filters.page} count={Math.ceil(total / PROFILE_WORK_PAGE_SIZE)} onChange={(page) => update({ page })} />
			</Stack>
		);
	};

	return (
		<Stack spacing={4}>
			{withToolbar && <Toolbar filters={filters} onChange={update} layout={layout} onLayout={setLayout} />}
			{list()}
		</Stack>
	);
};
