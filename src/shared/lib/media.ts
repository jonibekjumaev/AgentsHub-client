import { env } from '@/config/env';

/**
 * Uploaded files come back as paths like `uploads/member/<uuid>.png` (FRONTEND_MIGRATION §1.6):
 * prefix them with the API origin. '' means "no image" (D-15) → null, so callers show a placeholder.
 */
export const mediaUrl = (path: string | null | undefined): string | null => {
	if (!path) return null;
	if (/^https?:\/\//i.test(path)) return path;
	return `${env.apiUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
};
