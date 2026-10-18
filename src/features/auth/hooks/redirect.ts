/** Pages a member never needs to come back to after signing in. */
const AUTH_PATHS = ['/login', '/signup'];

/**
 * Only same-origin paths: "/x" yes; "//evil.com", "/\evil.com" and absolute URLs no (open-redirect guard).
 * /login and /signup fall back to "/" too, so a signed-in member is never sent back to a guest-only page.
 */
export const safeNextPath = (next: unknown): string => {
	if (typeof next !== 'string' || !next.startsWith('/')) return '/';
	if (next.startsWith('//') || next.startsWith('/\\')) return '/';
	const pathname = next.split(/[?#]/)[0];
	if (AUTH_PATHS.includes(pathname)) return '/';
	return next;
};
