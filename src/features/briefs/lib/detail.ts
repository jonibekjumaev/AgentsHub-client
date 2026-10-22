/** Every id is a 24-character hex ObjectId (FRONTEND_MIGRATION §1.3). */
export const isObjectId = (value: unknown): value is string => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

export const BRIEF_PATH = (briefId: string) => `/briefs/${briefId}`;
export const briefHref = BRIEF_PATH;

export const META_DESCRIPTION_MAX = 160;

/** Plain text → one line of at most `max` characters, cut at a word with "…" (the same rule as agents). */
export const summarize = (text: string, max = META_DESCRIPTION_MAX): string => {
	const line = text.replace(/\s+/g, ' ').trim();
	if (line.length <= max) return line;
	const cut = line.slice(0, max - 1);
	const lastSpace = cut.lastIndexOf(' ');
	return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:!?-]+$/, '')}…`;
};

/**
 * D-05: briefs are never closed automatically, so an OPEN brief can have a deadline in the past.
 * A deadline counts as passed once its day is over in the viewer's time zone. `now` is injectable for tests.
 */
export const isDeadlinePassed = (deadline: string | null | undefined, now: Date = new Date()): boolean => {
	if (!deadline) return false;
	const end = new Date(deadline);
	if (Number.isNaN(end.getTime())) return false;
	end.setHours(23, 59, 59, 999);
	return end.getTime() < now.getTime();
};

/** WhatsApp is stored as E.164 (+998…); wa.me wants the digits only (FRONTEND_MIGRATION §3.1). */
export const whatsappHref = (phone: string): string => `https://wa.me/${phone.replace(/\D/g, '')}`;
