import { describe, expect, it } from 'vitest';
import { buildRobots, buildSitemap, localizedUrl } from './sitemap';

const SITE = 'https://agentshub.test';

describe('sitemap (S10)', () => {
	it('localizes paths like Seo does (en without a prefix)', () => {
		expect(localizedUrl(SITE, '/', 'en')).toBe('https://agentshub.test/');
		expect(localizedUrl(SITE, '/', 'ko')).toBe('https://agentshub.test/ko');
		expect(localizedUrl(SITE, '/agents/1', 'uz')).toBe('https://agentshub.test/uz/agents/1');
	});

	it('lists each URL once with hreflang alternates and escapes it', () => {
		const xml = buildSitemap(SITE, [{ path: '/briefs/a&b', lastmod: '2026-10-10T00:00:00.000Z' }]);
		expect(xml).toContain('<loc>https://agentshub.test/briefs/a&amp;b</loc>');
		expect(xml).toContain('hreflang="ko" href="https://agentshub.test/ko/briefs/a&amp;b"');
		expect(xml).toContain('hreflang="x-default"');
		expect(xml).toContain('<lastmod>2026-10-10T00:00:00.000Z</lastmod>');
	});

	it('keeps private pages out of robots, and everything out outside production', () => {
		expect(buildRobots(SITE, true)).toContain('Disallow: /dashboard');
		expect(buildRobots(SITE, true)).toContain('Disallow: /ko/admin');
		expect(buildRobots(SITE, true)).toContain('Sitemap: https://agentshub.test/sitemap.xml');
		expect(buildRobots(SITE, false)).toBe('User-agent: *\nDisallow: /\n');
	});
});
