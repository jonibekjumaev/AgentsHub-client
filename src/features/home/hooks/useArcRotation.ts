import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { arcTransform, cardAngle, type ArcGeometry } from '../lib/arc';

/** Longest frame step: after a background tab the cards continue, they don't jump. */
const MAX_FRAME_SECONDS = 0.1;

const prefersReducedMotion = () =>
	typeof window !== 'undefined' && typeof window.matchMedia === 'function'
		? window.matchMedia('(prefers-reduced-motion: reduce)').matches
		: false;

/**
 * Turns the hero cards along the arc with requestAnimationFrame. The transforms are written straight
 * to the card elements (refs), so React does not re-render 60 times a second. `paused` is the hero's
 * Pause button. Stops for: that button (WCAG 2.2.2, works for keyboard and touch), hover, and
 * prefers-reduced-motion (then the cards stay still in the arc).
 */
export const useArcRotation = (count: number, geometry: ArcGeometry, paused: boolean) => {
	const cards = useRef<(HTMLElement | null)[]>([]);
	const offset = useRef(0);
	const hovering = useRef(false);
	const [reducedMotion, setReducedMotion] = useState(false);
	const stopped = paused || reducedMotion;

	useEffect(() => {
		if (typeof window.matchMedia !== 'function') return undefined;
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		const update = () => setReducedMotion(query.matches);
		update();
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	}, []);

	const place = useCallback(() => {
		cards.current.forEach((card, index) => {
			if (card) card.style.transform = arcTransform(cardAngle(index, count, offset.current, geometry.step), geometry.radius);
		});
	}, [count, geometry]);

	useEffect(() => {
		// A new geometry (phone ↔ desktop) re-places the cards at the current offset.
		place();
		if (stopped || prefersReducedMotion()) return undefined;
		let frame = 0;
		let last = performance.now();
		const tick = (now: number) => {
			const seconds = Math.min((now - last) / 1000, MAX_FRAME_SECONDS);
			last = now;
			if (!hovering.current) {
				offset.current += geometry.speed * seconds;
				place();
			}
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [place, stopped, geometry.speed]);

	/** One stable ref callback per card, so React does not detach and re-attach them on every render. */
	const refs = useMemo(
		() =>
			Array.from({ length: count }, (_, index) => (element: HTMLElement | null) => {
				cards.current[index] = element;
			}),
		[count],
	);
	const cardRef = (index: number) => refs[index];

	/** Spread on the track: hovering holds the cards still while they are being read. */
	const holdProps = {
		onMouseEnter: () => {
			hovering.current = true;
		},
		onMouseLeave: () => {
			hovering.current = false;
		},
	};

	return { cardRef, holdProps, reducedMotion };
};
