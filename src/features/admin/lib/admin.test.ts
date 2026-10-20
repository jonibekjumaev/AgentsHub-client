import { describe, expect, it } from 'vitest';
import { adminNeedsConfirm, adminVariables, articleAdminActions, briefAdminActions, memberAdminActions, productAdminActions } from './admin';

describe('admin lists (§3.12)', () => {
	it('builds variables with the status only when picked', () => {
		expect(adminVariables({ status: 'all', text: '', page: 1 }, 'productStatus').input.search).toEqual({});
		expect(adminVariables({ status: 'PAUSED', text: 'bot', page: 2 }, 'productStatus').input).toMatchObject({
			page: 2,
			search: { productStatus: 'PAUSED', text: 'bot' },
		});
		expect(adminVariables({ status: 'DELETE', text: 'x', page: 1 }, 'articleStatus', false).input.search).toEqual({ articleStatus: 'DELETE' });
	});

	it('offers remove only for items already deleted (D-28)', () => {
		expect(productAdminActions('ACTIVE')).toEqual(['pause', 'delete']);
		expect(productAdminActions('DELETE')).toEqual(['remove']);
		expect(briefAdminActions('CLOSED')).toEqual(['reopen', 'delete']);
		expect(articleAdminActions('ACTIVE')).toEqual(['delete']);
	});

	it('never moderates admins and confirms the destructive actions', () => {
		expect(memberAdminActions('ACTIVE', 'ADMIN')).toEqual([]);
		expect(memberAdminActions('BLOCK', 'USER')).toEqual(['unblock', 'delete']);
		expect(adminNeedsConfirm('remove')).toBe(true);
		expect(adminNeedsConfirm('pause')).toBe(false);
	});
});
