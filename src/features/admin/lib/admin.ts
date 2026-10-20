import { Direction } from '@/gql/enums';

export const ADMIN_PAGE_SIZE = 20;

/** One shape for every admin list: newest first, page, optional status and text. */
export type AdminListState = { status: string; text: string; page: number };
export const DEFAULT_ADMIN_LIST: AdminListState = { status: 'all', text: '', page: 1 };

export const adminVariables = (state: AdminListState, statusField: string, withText = true) => ({
	input: {
		page: state.page,
		limit: ADMIN_PAGE_SIZE,
		sort: 'createdAt',
		direction: Direction.Desc,
		search: {
			...(state.status !== 'all' && { [statusField]: state.status }),
			...(withText && state.text && { text: state.text }),
		},
	},
});

/**
 * Allowed transitions (§3.5, §3.7, §3.12, D-28, D-29, D-30). "remove" is the second, permanent step and
 * exists only for items already in DELETE.
 */
export type AdminAction = 'pause' | 'resume' | 'close' | 'reopen' | 'delete' | 'remove' | 'block' | 'unblock';

export const productAdminActions = (status: string): AdminAction[] =>
	status === 'ACTIVE' ? ['pause', 'delete'] : status === 'PAUSED' ? ['resume', 'delete'] : status === 'DELETE' ? ['remove'] : [];

export const briefAdminActions = (status: string): AdminAction[] =>
	status === 'OPEN' ? ['close', 'delete'] : status === 'CLOSED' ? ['reopen', 'delete'] : status === 'DELETE' ? ['remove'] : [];

export const articleAdminActions = (status: string): AdminAction[] => (status === 'ACTIVE' ? ['delete'] : status === 'DELETE' ? ['remove'] : []);

/** Admins are not moderated from here; a deleted member can't come back from this screen. */
export const memberAdminActions = (status: string, type: string): AdminAction[] => {
	if (type === 'ADMIN') return [];
	if (status === 'ACTIVE') return ['block', 'delete'];
	if (status === 'BLOCK') return ['unblock', 'delete'];
	return [];
};

/** Delete and remove can't be undone in the UI; blocking signs the member out on their next request (B17). */
export const adminNeedsConfirm = (action: AdminAction): boolean => action === 'delete' || action === 'remove' || action === 'block';
