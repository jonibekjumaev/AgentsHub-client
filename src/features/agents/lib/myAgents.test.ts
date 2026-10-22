import { describe, expect, it } from 'vitest';
import {
	ACTION_TARGET,
	MY_AGENTS_PAGE_SIZE,
	myAgentsHref,
	myAgentsVariables,
	needsConfirm,
	parseMyAgentsView,
	statusActions,
} from './myAgents';

describe('parseMyAgentsView', () => {
	it.each([
		[{}, { tab: 'all', page: 1 }],
		[{ status: 'paused', page: '2' }, { tab: 'paused', page: 2 }],
		[{ status: 'DELETE' }, { tab: 'all', page: 1 }],
		[{ status: 'deleted', page: '0' }, { tab: 'all', page: 1 }],
		[{ status: ['active', 'paused'], page: 'x' }, { tab: 'active', page: 1 }],
	])('%j → %j', (query, expected) => {
		expect(parseMyAgentsView(query)).toEqual(expected);
	});
});

describe('myAgentsHref', () => {
	it('leaves defaults out of the URL', () => {
		expect(myAgentsHref({ tab: 'all', page: 1 })).toBe('/dashboard/agents');
		expect(myAgentsHref({ tab: 'paused', page: 3 })).toBe('/dashboard/agents?status=paused&page=3');
	});
});

describe('myAgentsVariables', () => {
	it('asks for ACTIVE + PAUSED on "All" and one status on its tab, newest change first', () => {
		expect(myAgentsVariables({ tab: 'all', page: 2 })).toEqual({
			input: { page: 2, limit: MY_AGENTS_PAGE_SIZE, sort: 'updatedAt', direction: 'DESC', search: {} },
		});
		expect(myAgentsVariables({ tab: 'paused', page: 1 }).input.search).toEqual({ productStatus: 'PAUSED' });
		expect(myAgentsVariables({ tab: 'active', page: 1 }).input.search).toEqual({ productStatus: 'ACTIVE' });
	});
});

describe('statusActions (D-16/D-29)', () => {
	it('ACTIVE can pause or delete', () => {
		expect(statusActions('ACTIVE')).toEqual(['pause', 'delete']);
	});

	it('PAUSED can resume or delete', () => {
		expect(statusActions('PAUSED')).toEqual(['resume', 'delete']);
	});

	it('DELETE is final', () => {
		expect(statusActions('DELETE')).toEqual([]);
	});

	it('sends the matching status, and confirms pause and delete only', () => {
		expect(ACTION_TARGET).toEqual({ pause: 'PAUSED', resume: 'ACTIVE', delete: 'DELETE' });
		expect([needsConfirm('pause'), needsConfirm('delete'), needsConfirm('resume')]).toEqual([true, true, false]);
	});
});
