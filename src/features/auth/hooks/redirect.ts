/** Only same-origin paths: "/x" yes; "//evil.com", "/\evil.com" and absolute URLs no (open-redirect guard). */
export const safeNextPath = (next: unknown): string => {
	if (typeof next !== 'string' || !next.startsWith('/')) return '/';
	if (next.startsWith('//') || next.startsWith('/\\')) return '/';
	return next;
};
