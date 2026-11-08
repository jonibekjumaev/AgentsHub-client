import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { HeroSection } from './HeroSection';

/** matchMedia stub: `reduced` answers prefers-reduced-motion; every other query (breakpoints) is false. */
const stubMatchMedia = (reduced: boolean) =>
	vi.stubGlobal(
		'matchMedia',
		vi.fn((query: string) => ({
			matches: reduced && query.includes('prefers-reduced-motion'),
			media: query,
			onchange: null,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			addListener: vi.fn(),
			removeListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	);

/** Collects requestAnimationFrame callbacks so a test can play frames by hand. */
const stubFrames = () => {
	let queue: FrameRequestCallback[] = [];
	vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
		queue.push(callback);
		return queue.length;
	});
	vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {
		queue = [];
	});
	vi.spyOn(performance, 'now').mockReturnValue(0);
	return {
		play: (time: number) =>
			act(() => {
				const current = queue;
				queue = [];
				current.forEach((callback) => callback(time));
			}),
		pending: () => queue.length,
	};
};

const firstCard = () => within(screen.getByRole('region', { name: 'Example agents at work' })).getAllByRole('article')[0];

describe('HeroSection (home hero)', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/');
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it('shows the message, the search and the two side links', () => {
		stubMatchMedia(false);
		stubFrames();
		renderWithProviders(<HeroSection />);

		const title = screen.getByRole('heading', { level: 1 });
		expect(title).toHaveTextContent('Grow and automate your business with AI agents.');
		expect(within(title).getByText('AI agents.')).toBeInTheDocument();
		expect(screen.getByText('Marketplace for AI agents')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Post a brief' })).toHaveAttribute('href', '/dashboard/briefs/new');
		expect(screen.getByRole('link', { name: 'Sell your agent' })).toHaveAttribute('href', '/signup');
	});

	it('searches the agents catalog with the typed text', async () => {
		stubMatchMedia(false);
		stubFrames();
		const user = userEvent.setup();
		renderWithProviders(<HeroSection />);

		await user.type(screen.getByRole('searchbox', { name: 'Search agents' }), '  support bot  ');
		await user.click(screen.getByRole('button', { name: 'Search agents' }));
		expect(mockRouter.asPath).toBe('/agents?q=support+bot');
	});

	it('shows ten example cards, each marked as an example', () => {
		stubMatchMedia(false);
		stubFrames();
		renderWithProviders(<HeroSection />);

		const cards = within(screen.getByRole('region', { name: 'Example agents at work' })).getAllByRole('article');
		expect(cards).toHaveLength(10);
		expect(cards[0]).toHaveAccessibleName('Support Agent');
		expect(within(cards[0]).getByText('Answered 312 customer questions today')).toBeInTheDocument();
		expect(within(cards[0]).getByText('8 sec')).toBeInTheDocument();
		cards.forEach((card) => expect(within(card).getByText('· Example')).toBeInTheDocument());
	});

	it('turns the cards frame by frame and stops them with the Pause button', async () => {
		stubMatchMedia(false);
		const frames = stubFrames();
		const user = userEvent.setup();
		renderWithProviders(<HeroSection />);

		const start = firstCard().style.transform;
		frames.play(1000); // 0.1s step (clamped) → 0.3°
		const moved = firstCard().style.transform;
		expect(moved).not.toBe(start);

		const pause = screen.getByRole('button', { name: 'Pause animation' });
		expect(pause).toHaveAttribute('aria-pressed', 'false');
		await user.click(pause);
		expect(pause).toHaveAttribute('aria-pressed', 'true');
		expect(frames.pending()).toBe(0);
		expect(screen.getByRole('heading', { level: 1 }).closest('section')).toHaveAttribute('data-paused', 'true');
		expect(firstCard().style.transform).toBe(moved);

		await user.click(pause);
		expect(frames.pending()).toBe(1);
	});

	it('holds the cards while the pointer is over them', async () => {
		stubMatchMedia(false);
		const frames = stubFrames();
		const user = userEvent.setup();
		renderWithProviders(<HeroSection />);

		await user.hover(screen.getByRole('region', { name: 'Example agents at work' }));
		const held = firstCard().style.transform;
		frames.play(1000);
		expect(firstCard().style.transform).toBe(held);
	});

	it('keeps everything still under prefers-reduced-motion, without a Pause button', () => {
		stubMatchMedia(true);
		const frames = stubFrames();
		renderWithProviders(<HeroSection />);

		expect(frames.pending()).toBe(0);
		expect(screen.queryByRole('button', { name: 'Pause animation' })).not.toBeInTheDocument();
		expect(firstCard().style.transform).toMatch(/^translate\(/);
	});
});
