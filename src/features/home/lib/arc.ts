/**
 * Geometry of the hero carousel: the cards sit on the top of a big circle and the whole set turns
 * slowly. All angles are in degrees.
 */
export type ArcGeometry = {
	/** Circle radius in px. */
	radius: number;
	/** Angle between two neighbouring cards. step × count must be wider than what is visible. */
	step: number;
	/** Turning speed in degrees per second. */
	speed: number;
	card: { width: number; height: number };
	/** Distance from the top of the track to the top of a card at 0°. */
	top: number;
	/** Track height. */
	height: number;
};

/** Desktop and tablets: the design values (R 2000, 8.6° ≈ 300px of arc per card). */
export const ARC_WIDE: ArcGeometry = {
	radius: 2000,
	step: 8.6,
	speed: 3,
	card: { width: 260, height: 300 },
	top: 40,
	height: 560,
};

/**
 * Phones (< 600px): a smaller circle and smaller cards. 12° × 1200px ≈ 250px of arc, enough for a 220px
 * card plus a gap, so neighbours never overlap; one card in the middle and the next ones peek in.
 */
export const ARC_COMPACT: ArcGeometry = {
	radius: 1200,
	step: 12,
	speed: 4,
	card: { width: 220, height: 264 },
	top: 28,
	height: 360,
};

/** y of the card centres at 0° — the dashed ring passes through it. */
export const arcCenterY = (g: ArcGeometry) => g.top + g.card.height / 2;

/** The outer ring sits just above the cards (14px below the track top). */
export const OUTER_RING_TOP = 14;
export const outerRingRadius = (g: ArcGeometry) => g.radius + arcCenterY(g) - OUTER_RING_TOP;

/**
 * Angle of card `index` for the current `offset`, wrapped into (−span/2, span/2]. A card leaving one side
 * comes back on the other while it is far below the visible part of the circle, so the loop is invisible.
 */
export const cardAngle = (index: number, count: number, offset: number, step: number): number => {
	const span = step * count;
	const raw = offset + (index - (count - 1) / 2) * step + span / 2;
	return (((raw % span) + span) % span) - span / 2;
};

/** CSS transform that moves a card from the top of the circle to `angle` and tilts it along the curve. */
export const arcTransform = (angle: number, radius: number): string => {
	const rad = (angle * Math.PI) / 180;
	const x = radius * Math.sin(rad);
	const y = radius * (1 - Math.cos(rad));
	return `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${angle.toFixed(2)}deg)`;
};
