import type { ReactNode } from 'react';
import mockRouter from 'next-router-mock';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { Seo } from './Seo';

// next/head needs Next's head manager; render its children in place so the tags can be read.
vi.mock('next/head', () => ({ default: ({ children }: { children: ReactNode }) => <>{children}</> }));

const SITE = 'https://agentshub.test'; // NEXT_PUBLIC_SITE_URL in vitest.config.mts

const attr = (selector: string, name: string) => document.querySelector(selector)?.getAttribute(name);
const alternates = () =>
	Object.fromEntries(
		Array.from(document.querySelectorAll('link[rel="alternate"]')).map((link) => [
			link.getAttribute('hreflang'),
			link.getAttribute('href'),
		]),
	);

describe('Seo', () => {
	afterEach(() => {
		mockRouter.locale = undefined;
	});

	it('renders the title template, description and Open Graph tags', () => {
		mockRouter.setCurrentUrl('/agents');
		renderWithProviders(<Seo title="Agents" description="Browse AI agents." image="/og/agents.png" />, { auth: {} });

		expect(document.title).toBe('Agents · AgentsHub');
		expect(attr('meta[name="description"]', 'content')).toBe('Browse AI agents.');
		expect(attr('meta[property="og:title"]', 'content')).toBe('Agents · AgentsHub');
		expect(attr('meta[property="og:description"]', 'content')).toBe('Browse AI agents.');
		expect(attr('meta[property="og:image"]', 'content')).toBe(`${SITE}/og/agents.png`);
	});

	it('uses the site name and description when none are given', () => {
		mockRouter.setCurrentUrl('/');
		renderWithProviders(<Seo />, { auth: {} });

		expect(document.title).toBe('AgentsHub');
		expect(attr('meta[name="description"]', 'content')).toMatch(/marketplace for AI agents/);
	});

	it('renders the canonical URL without the query, plus 3 hreflang alternates and x-default', () => {
		mockRouter.setCurrentUrl('/agents/abc?tab=reviews#comments');
		mockRouter.locale = 'ko';
		renderWithProviders(<Seo title="Support Copilot" />, { auth: {} });

		expect(attr('link[rel="canonical"]', 'href')).toBe(`${SITE}/ko/agents/abc`);
		expect(attr('meta[property="og:url"]', 'content')).toBe(`${SITE}/ko/agents/abc`);
		expect(document.querySelectorAll('link[rel="alternate"]')).toHaveLength(4);
		expect(alternates()).toEqual({
			en: `${SITE}/agents/abc`,
			ko: `${SITE}/ko/agents/abc`,
			uz: `${SITE}/uz/agents/abc`,
			'x-default': `${SITE}/agents/abc`,
		});
		expect(document.querySelector('meta[name="robots"]')).toBeNull();
	});

	it('uses canonicalPath (with its query) for the canonical and alternate URLs', () => {
		mockRouter.setCurrentUrl('/agents?category=sales&sort=rank&page=3');
		mockRouter.locale = 'uz';
		renderWithProviders(<Seo title="Sales AI agents" canonicalPath="/agents?category=sales" />, { auth: {} });

		expect(attr('link[rel="canonical"]', 'href')).toBe(`${SITE}/uz/agents?category=sales`);
		expect(alternates()).toMatchObject({ en: `${SITE}/agents?category=sales`, ko: `${SITE}/ko/agents?category=sales` });
	});

	it('links the home page without a trailing slash in other locales', () => {
		mockRouter.setCurrentUrl('/');
		renderWithProviders(<Seo />, { auth: {} });

		expect(attr('link[rel="canonical"]', 'href')).toBe(`${SITE}/`);
		expect(alternates()).toMatchObject({ ko: `${SITE}/ko`, uz: `${SITE}/uz` });
	});

	it('noindex pages get robots noindex and no canonical or alternates', () => {
		mockRouter.setCurrentUrl('/missing-page');
		renderWithProviders(<Seo title="Page not found" noindex />, { auth: {} });

		expect(attr('meta[name="robots"]', 'content')).toBe('noindex, nofollow');
		expect(document.querySelector('link[rel="canonical"]')).toBeNull();
		expect(document.querySelectorAll('link[rel="alternate"]')).toHaveLength(0);
	});
});
