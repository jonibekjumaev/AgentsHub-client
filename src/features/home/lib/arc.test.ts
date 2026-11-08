import { describe, expect, it } from 'vitest';
import { ARC_COMPACT, ARC_WIDE, arcCenterY, arcTransform, cardAngle, outerRingRadius } from './arc';

describe('hero arc geometry', () => {
	it('spreads ten cards evenly around the top of the circle', () => {
		const angles = Array.from({ length: 10 }, (_, index) => cardAngle(index, 10, 0, 8.6));
		expect(angles.map((angle) => Number(angle.toFixed(1)))).toEqual([-38.7, -30.1, -21.5, -12.9, -4.3, 4.3, 12.9, 21.5, 30.1, 38.7]);
	});

	it('moves every card by the offset and wraps it to the other side past ±span/2', () => {
		expect(cardAngle(9, 10, 3, 8.6)).toBeCloseTo(41.7);
		// 38.7° + 5° = 43.7° is past 43°, so the card comes back at −42.3°.
		expect(cardAngle(9, 10, 5, 8.6)).toBeCloseTo(-42.3);
		// One full span later everything is where it started (seamless loop).
		expect(cardAngle(4, 10, 86, 8.6)).toBeCloseTo(cardAngle(4, 10, 0, 8.6));
		expect(cardAngle(4, 10, -86, 8.6)).toBeCloseTo(cardAngle(4, 10, 0, 8.6));
	});

	it('places a card on the circle and tilts it along the curve', () => {
		expect(arcTransform(0, 2000)).toBe('translate(0.0px, 0.0px) rotate(0.00deg)');
		expect(arcTransform(30, 2000)).toBe('translate(1000.0px, 267.9px) rotate(30.00deg)');
		expect(arcTransform(-30, 2000)).toBe('translate(-1000.0px, 267.9px) rotate(-30.00deg)');
	});

	it('keeps neighbouring cards apart on both layouts', () => {
		for (const geometry of [ARC_WIDE, ARC_COMPACT]) {
			const arcBetweenCards = (geometry.step * Math.PI * geometry.radius) / 180;
			expect(arcBetweenCards).toBeGreaterThan(geometry.card.width + 20);
		}
	});

	it.each([
		// Wider screens than 1920px rely on the edge fade (12% each side), as in the design.
		['desktop up to 1920px wide', ARC_WIDE, 960],
		['phone up to 600px wide', ARC_COMPACT, 300],
	] as const)('hides the wrap on a %s: the card at the turning point is out of sight', (_, geometry, halfWidth) => {
		const half = ((geometry.step * 10) / 2) * (Math.PI / 180);
		const centerX = geometry.radius * Math.sin(half);
		const centerY = geometry.top + geometry.card.height / 2 + geometry.radius * (1 - Math.cos(half));
		// Bounding box of the tilted card.
		const reachX = (geometry.card.width / 2) * Math.cos(half) + (geometry.card.height / 2) * Math.sin(half);
		const reachY = (geometry.card.width / 2) * Math.sin(half) + (geometry.card.height / 2) * Math.cos(half);
		const belowTrack = centerY - reachY > geometry.height;
		const besideScreen = centerX - reachX > halfWidth;
		expect(belowTrack || besideScreen).toBe(true);
	});

	it('draws the dashed ring through the card centres and the outer ring above them', () => {
		expect(arcCenterY(ARC_WIDE)).toBe(190);
		expect(outerRingRadius(ARC_WIDE)).toBe(2176);
	});
});
