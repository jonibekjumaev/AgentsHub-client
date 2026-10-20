import { describe, expect, it } from 'vitest';
import { briefActions, briefEditHref, briefNeedsConfirm, myBriefsHref, myBriefsVariables, parseMyBriefsView } from './myBriefs';

describe('my briefs view', () => {
	it('reads the tab and page from the URL, with safe fallbacks', () => {
		expect(parseMyBriefsView({})).toEqual({ tab: 'all', page: 1 });
		expect(parseMyBriefsView({ status: 'closed', page: '2' })).toEqual({ tab: 'closed', page: 2 });
		expect(parseMyBriefsView({ status: 'deleted', page: 'x' })).toEqual({ tab: 'all', page: 1 });
	});

	it('builds links with only non-default values', () => {
		expect(myBriefsHref({ tab: 'all', page: 1 })).toBe('/dashboard/briefs');
		expect(myBriefsHref({ tab: 'open', page: 3 })).toBe('/dashboard/briefs?status=open&page=3');
		expect(briefEditHref('abc')).toBe('/dashboard/briefs/abc/edit');
	});

	it('asks for one status per tab, none for All', () => {
		expect(myBriefsVariables({ tab: 'all', page: 1 }).input.search).toEqual({});
		expect(myBriefsVariables({ tab: 'closed', page: 2 }).input).toMatchObject({ page: 2, search: { briefStatus: 'CLOSED' } });
	});
});

describe('brief actions (D-30)', () => {
	it('offers close for OPEN and reopen for CLOSED, delete for both', () => {
		expect(briefActions('OPEN')).toEqual(['close', 'delete']);
		expect(briefActions('CLOSED')).toEqual(['reopen', 'delete']);
		expect(briefActions('DELETE')).toEqual([]);
	});

	it('confirms only delete', () => {
		expect(briefNeedsConfirm('delete')).toBe(true);
		expect(briefNeedsConfirm('close')).toBe(false);
		expect(briefNeedsConfirm('reopen')).toBe(false);
	});
});
