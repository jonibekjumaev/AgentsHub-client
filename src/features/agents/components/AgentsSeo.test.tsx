import type { ReactNode } from 'react';
import mockRouter from 'next-router-mock';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { AgentsSeo } from './AgentsSeo';

vi.mock('next/head', () => ({ default: ({ children }: { children: ReactNode }) => <>{children}</> }));

const SITE = 'https://agentshub.test';
const canonical = () => document.querySelector('link[rel="canonical"]')?.getAttribute('href');
const description = () => document.querySelector('meta[name="description"]')?.getAttribute('content');

describe('AgentsSeo', () => {
	it('uses the generic title and a clean canonical without filters', () => {
		mockRouter.setCurrentUrl('/agents?sort=views');
		renderWithProviders(<AgentsSeo />, { auth: {} });

		expect(document.title).toBe('AI agents · AgentsHub');
		expect(description()).toMatch(/^Browse ready-made AI agents/);
		expect(canonical()).toBe(`${SITE}/agents`);
	});

	it('gives a single category its own title and keeps it in the canonical', () => {
		mockRouter.setCurrentUrl('/agents?category=customer-support&q=bot&page=2');
		renderWithProviders(<AgentsSeo />, { auth: {} });

		expect(document.title).toBe('Customer support AI agents — page 2 · AgentsHub');
		expect(description()).toMatch(/in the Customer support category/);
		expect(canonical()).toBe(`${SITE}/agents?category=customer-support`);
	});

	it('falls back to the generic title for several categories', () => {
		mockRouter.setCurrentUrl('/agents?category=sales&category=marketing');
		renderWithProviders(<AgentsSeo />, { auth: {} });

		expect(document.title).toBe('AI agents · AgentsHub');
		expect(canonical()).toBe(`${SITE}/agents?category=sales&category=marketing`);
	});
});
