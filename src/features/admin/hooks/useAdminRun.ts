import { useTranslation } from 'next-i18next';
import { ErrorCode, getErrorCode, toErrorKey } from '@/shared/lib/errors';
import { useToast } from '@/shared/ui/toast';
import type { AdminAction } from '../lib/admin';

/**
 * Wraps one admin mutation call: success toast, error toast (NOT_FOUND = changed or already gone,
 * e.g. remove on an item that isn't DELETE), then the caller's refetch either way.
 */
export const useAdminRun = (refetch: () => Promise<unknown>) => {
	const { t } = useTranslation(['admin', 'errors']);
	const toast = useToast();
	return async (title: string, action: AdminAction, call: () => Promise<unknown>): Promise<boolean> => {
		try {
			await call();
			toast.success(t(`admin:done.${action}`, { title }));
			await refetch();
			return true;
		} catch (error) {
			toast.error(t(getErrorCode(error) === ErrorCode.NotFound ? 'admin:changed' : toErrorKey(error)));
			await refetch().catch(() => undefined);
			return false;
		}
	};
};
