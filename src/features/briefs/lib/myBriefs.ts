import type { ParsedUrlQuery } from 'querystring';
import * as z from 'zod/mini';
import { BriefStatus, Direction } from '@/gql/enums';
import type { MyBriefsInquiry } from '@/gql/graphql';

/** /dashboard/briefs?status=closed&page=2 — the tab and page live in the URL (back button, links). */

export const MY_BRIEFS_PATH = '/dashboard/briefs';
export const NEW_BRIEF_PATH = '/dashboard/briefs/new';
export const briefEditHref = (briefId: string) => `${MY_BRIEFS_PATH}/${briefId}/edit`;
export const MY_BRIEFS_PAGE_SIZE = 10;

export const MY_BRIEF_TABS = ['all', 'open', 'closed'] as const;
export type MyBriefTab = (typeof MY_BRIEF_TABS)[number];

export type MyBriefsView = { tab: MyBriefTab; page: number };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
const tabSchema = z.catch(z.enum(MY_BRIEF_TABS), 'all');
const pageSchema = z.catch(z.coerce.number().check(z.int(), z.minimum(1)), 1);

/** Invalid values fall back to the first page of "All". */
export const parseMyBriefsView = (query: ParsedUrlQuery): MyBriefsView => ({
	tab: tabSchema.parse(first(query.status)),
	page: pageSchema.parse(first(query.page)),
});

export const myBriefsHref = ({ tab, page }: MyBriefsView): string => {
	const params = new URLSearchParams();
	if (tab !== 'all') params.set('status', tab);
	if (page > 1) params.set('page', String(page));
	const search = params.toString();
	return search ? `${MY_BRIEFS_PATH}?${search}` : MY_BRIEFS_PATH;
};

const TAB_STATUS: Record<MyBriefTab, BriefStatus | undefined> = {
	all: undefined,
	open: BriefStatus.Open,
	closed: BriefStatus.Closed,
};

/** getMyBriefs input: newest first; "All" = OPEN + CLOSED (the API never returns DELETE). */
export const myBriefsVariables = ({ tab, page }: MyBriefsView): { input: MyBriefsInquiry } => {
	const briefStatus = TAB_STATUS[tab];
	return {
		input: {
			page,
			limit: MY_BRIEFS_PAGE_SIZE,
			sort: 'createdAt',
			direction: Direction.Desc,
			search: briefStatus ? { briefStatus } : {},
		},
	};
};

export type BriefAction = 'close' | 'reopen' | 'delete';

export const BRIEF_ACTION_TARGET: Record<BriefAction, BriefStatus> = {
	close: BriefStatus.Closed,
	reopen: BriefStatus.Open,
	delete: BriefStatus.Delete,
};

/** D-30: OPEN → close / delete, CLOSED → reopen / delete. Edit is a link and always there. */
export const briefActions = (status: BriefStatus): BriefAction[] => {
	if (status === BriefStatus.Open) return ['close', 'delete'];
	if (status === BriefStatus.Closed) return ['reopen', 'delete'];
	return [];
};

/** Only delete confirms: close and reopen undo each other. */
export const briefNeedsConfirm = (action: BriefAction): boolean => action === 'delete';
