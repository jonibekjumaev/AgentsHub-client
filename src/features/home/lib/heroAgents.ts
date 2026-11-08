import type { HeroTint } from '@/theme/tokens';

export type HeroAgentIcon = 'chat' | 'megaphone' | 'invoice' | 'target' | 'mail' | 'cart' | 'calendar' | 'people' | 'send' | 'chart';

/**
 * One example card in the home hero. The texts live in home.json under `hero.cards.<key>`
 * (name, category, output, metricLabel, metricValue), so they are translated like the rest of the page.
 * These are illustrative tasks, not real data — every card says "Example".
 */
export type HeroAgent = { key: string; icon: HeroAgentIcon; tint: HeroTint };

/** Order matters: neighbours differ in category and color. Could later come from the API. */
export const HERO_AGENTS: HeroAgent[] = [
	{ key: 'support', icon: 'chat', tint: 'indigo' },
	{ key: 'social', icon: 'megaphone', tint: 'orange' },
	{ key: 'invoice', icon: 'invoice', tint: 'green' },
	{ key: 'leads', icon: 'target', tint: 'rose' },
	{ key: 'inbox', icon: 'mail', tint: 'blue' },
	{ key: 'shop', icon: 'cart', tint: 'violet' },
	{ key: 'scheduler', icon: 'calendar', tint: 'teal' },
	{ key: 'recruiting', icon: 'people', tint: 'amber' },
	{ key: 'followUp', icon: 'send', tint: 'iris' },
	{ key: 'analyst', icon: 'chart', tint: 'slate' },
];
