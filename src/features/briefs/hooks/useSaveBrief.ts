import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import type { SaveBriefMutation as SaveBriefResult, UnsaveBriefMutation as UnsaveBriefResult } from '@/gql/graphql';
import { toErrorKey } from '@/shared/lib/errors';
import { useToast } from '@/shared/ui/toast';
import { SaveBriefMutation, UnsaveBriefMutation } from '../graphql/saved';

/** What the Save button needs to know about a brief: any brief query that selects these fields will do. */
export type SaveTarget = {
	_id: string;
	briefTitle: string;
	/** null / undefined: not known for this member yet (a server render has no token). */
	meSaved?: boolean | null;
	memberData?: { _id: string } | null;
};

export type SaveBriefState = {
	/** Admins have no library, and your own brief can't be saved (D-47): no button at all. */
	hidden: boolean;
	saved: boolean;
	/** The session, this member's meSaved or a request is still pending: the button can't act yet. */
	inactive: boolean;
	pending: boolean;
	toggle: () => Promise<void>;
};

/**
 * "Save brief" (D-47), shared by the feed row, the detail page and the saved list.
 * - Guest (or a member who isn't ACTIVE): goes to login and comes back here; no request.
 * - USER / CREATOR: saveBrief / unsaveBrief with an optimistic meSaved. Both answer { _id, meSaved }, so Apollo
 *   updates Brief:<id> everywhere it is shown, and rolls the optimistic value back on error (then a toast).
 * - The mutations are idempotent (not a toggle), so a double click or a retried request can't undo itself.
 */
export const useSaveBrief = (brief: SaveTarget): SaveBriefState => {
	const { t } = useTranslation('errors');
	const router = useRouter();
	const toast = useToast();
	const { status, me } = useAuth();
	const [save, saving] = useMutation(SaveBriefMutation);
	const [unsave, unsaving] = useMutation(UnsaveBriefMutation);

	const member = status === 'member' && me?.memberStatus === 'ACTIVE' ? me : null;
	const hidden = me?.memberType === 'ADMIN' || Boolean(member && brief.memberData?._id === member._id);
	const known = typeof brief.meSaved === 'boolean';
	const saved = Boolean(member) && brief.meSaved === true;
	const pending = saving.loading || unsaving.loading;
	const inactive = status === 'loading' || (member !== null && !known) || pending;

	const toggle = async () => {
		if (status === 'guest' || (status === 'member' && !member)) {
			void router.push(`/login?${new URLSearchParams({ next: router.asPath })}`);
			return;
		}
		if (hidden || inactive || !member) return;

		const variables = { briefId: brief._id };
		// Codegen types leave __typename out; the cache needs it to find Brief:<id>.
		const result = { __typename: 'Brief', _id: brief._id };
		try {
			if (saved) {
				await unsave({
					variables,
					optimisticResponse: { unsaveBrief: { ...result, meSaved: false } as UnsaveBriefResult['unsaveBrief'] },
				});
			} else {
				await save({
					variables,
					optimisticResponse: { saveBrief: { ...result, meSaved: true } as SaveBriefResult['saveBrief'] },
				});
			}
		} catch (error) {
			toast.error(t(toErrorKey(error)));
		}
	};

	return { hidden, saved, inactive, pending, toggle };
};
