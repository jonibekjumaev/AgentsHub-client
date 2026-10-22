import type { ParsedUrlQuery } from 'querystring';
import * as z from 'zod/mini';
import { Direction, ProductStatus } from '@/gql/enums';
import type { CreatorProductsInquiry } from '@/gql/graphql';

/** /dashboard/agents?status=paused&page=2 — the tab and page live in the URL (back button, links). */

export const MY_AGENTS_PATH = '/dashboard/agents';
export const NEW_AGENT_PATH = '/dashboard/agents/new';
/** The owner's preview of one agent (S3c). Also where AgentForm lands after saving. */
export const agentPreviewHref = (agentId: string) => `${MY_AGENTS_PATH}/${agentId}`;
export const agentEditHref = (agentId: string) => `${MY_AGENTS_PATH}/${agentId}/edit`;
export const MY_AGENTS_PAGE_SIZE = 10;

export const STATUS_TABS = ['all', 'active', 'paused'] as const;
export type StatusTab = (typeof STATUS_TABS)[number];

export type MyAgentsView = { tab: StatusTab; page: number };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
const tabSchema = z.catch(z.enum(STATUS_TABS), 'all');
const pageSchema = z.catch(z.coerce.number().check(z.int(), z.minimum(1)), 1);

/** Invalid values fall back to the first page of "All". */
export const parseMyAgentsView = (query: ParsedUrlQuery): MyAgentsView => ({
	tab: tabSchema.parse(first(query.status)),
	page: pageSchema.parse(first(query.page)),
});

export const myAgentsHref = ({ tab, page }: MyAgentsView): string => {
	const params = new URLSearchParams();
	if (tab !== 'all') params.set('status', tab);
	if (page > 1) params.set('page', String(page));
	const search = params.toString();
	return search ? `${MY_AGENTS_PATH}?${search}` : MY_AGENTS_PATH;
};

const TAB_STATUS: Record<StatusTab, ProductStatus | undefined> = {
	all: undefined,
	active: ProductStatus.Active,
	paused: ProductStatus.Paused,
};

/** getCreatorProducts input: newest change first; "All" = ACTIVE + PAUSED (the API never returns DELETE here). */
export const myAgentsVariables = ({ tab, page }: MyAgentsView): { input: CreatorProductsInquiry } => {
	const productStatus = TAB_STATUS[tab];
	return {
		input: {
			page,
			limit: MY_AGENTS_PAGE_SIZE,
			sort: 'updatedAt',
			direction: Direction.Desc,
			search: productStatus ? { productStatus } : {},
		},
	};
};

export type StatusAction = 'pause' | 'resume' | 'delete';

/** The status each action sends (FRONTEND_MIGRATION §3.5). */
export const ACTION_TARGET: Record<StatusAction, ProductStatus> = {
	pause: ProductStatus.Paused,
	resume: ProductStatus.Active,
	delete: ProductStatus.Delete,
};

/**
 * D-16/D-29: ACTIVE ⇄ PAUSED, and either one → DELETE (final). Only these buttons are shown,
 * so the API's "status can only change between…" error can't be triggered from the UI.
 */
export const statusActions = (status: ProductStatus): StatusAction[] => {
	if (status === ProductStatus.Active) return ['pause', 'delete'];
	if (status === ProductStatus.Paused) return ['resume', 'delete'];
	return [];
};

/** Pause and delete change what other members see, so they confirm first; resume does not. */
export const needsConfirm = (action: StatusAction): boolean => action !== 'resume';
