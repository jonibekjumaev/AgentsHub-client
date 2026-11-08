import type { CreatorStatsQuery } from '@/gql/graphql';

type Stats = CreatorStatsQuery['getMe'];

export const SETTINGS_PATH = '/dashboard/settings';

export type ChecklistKey = 'photo' | 'bio' | 'contact' | 'agent' | 'article';
export type ChecklistItem = { key: ChecklistKey; done: boolean; href: string };

/**
 * "Next steps" on the overview: what makes a creator profile complete, read from stored fields only.
 * Contact = WhatsApp or e-mail: the two contacts the public profile card shows (memberPhone is not shown there).
 */
export const profileChecklist = (me: Stats, paths: { newAgent: string; newArticle: string }): ChecklistItem[] => [
	{ key: 'photo', done: Boolean(me.memberImage), href: SETTINGS_PATH },
	{ key: 'bio', done: Boolean(me.memberDesc?.trim()), href: SETTINGS_PATH },
	{ key: 'contact', done: Boolean(me.memberWhatsapp || me.memberEmail), href: SETTINGS_PATH },
	{ key: 'agent', done: me.memberProducts > 0, href: paths.newAgent },
	{ key: 'article', done: me.memberArticles > 0, href: paths.newArticle },
];

/** "Welcome back, Nova" — the full name when set, else the nick. */
export const greetingName = (me: Pick<Stats, 'memberFullName' | 'memberNick'>): string =>
	me.memberFullName?.trim() || me.memberNick;

export const VISITORS_PAGE_SIZE = 10;
/** Same window as the API (libs/config.ts profileVisitorsWindowDays); only used in the page text. */
export const VISITORS_WINDOW_DAYS = 90;

export const profileVisitorsVariables = (page: number) => ({ input: { page, limit: VISITORS_PAGE_SIZE } });
