import { act, renderHook } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import { describe, expect, it } from 'vitest';
import { isSamePage, stripLocalePrefix, useRouteLoading } from './useRouteLoading';

describe('stripLocalePrefix', () => {
	it.each([
		['/ko/agents', '/agents'],
		['/uz', '/'],
		['/agents', '/agents'],
		['/kosmos', '/kosmos'],
	])('%s → %s', (path, expected) => {
		expect(stripLocalePrefix(path)).toBe(expected);
	});
});

describe('isSamePage', () => {
	it('compares paths only, ignoring query and locale', () => {
		expect(isSamePage('/ko/agents?page=2', '/agents?page=1')).toBe(true);
		expect(isSamePage('/agents/abc', '/agents')).toBe(false);
	});
});

describe('useRouteLoading', () => {
	const emit = (event: 'routeChangeStart' | 'routeChangeComplete', url: string, shallow = false) =>
		act(() => {
			mockRouter.events.emit(event, url, { shallow });
		});

	it('is true during a non-shallow navigation to the same page only', () => {
		mockRouter.setCurrentUrl('/agents');
		const { result } = renderHook(() => useRouteLoading());

		emit('routeChangeStart', '/agents?page=2');
		expect(result.current).toBe(true);
		emit('routeChangeComplete', '/agents?page=2');
		expect(result.current).toBe(false);

		emit('routeChangeStart', '/agents?category=sales', true);
		expect(result.current).toBe(false);

		emit('routeChangeStart', '/agents/abc');
		expect(result.current).toBe(false);
	});
});
