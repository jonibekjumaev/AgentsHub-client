import { Direction } from '@/gql/enums';
import type { ProductsInquiry } from '@/gql/graphql';

/** Every id is a 24-character hex ObjectId (FRONTEND_MIGRATION §1.3). */
export const isObjectId = (value: unknown): value is string => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

export const META_DESCRIPTION_MAX = 160;

/** Plain-text description → one line of at most `max` characters, cut at a word with "…". */
export const summarize = (text: string, max = META_DESCRIPTION_MAX): string => {
	const line = text.replace(/\s+/g, ' ').trim();
	if (line.length <= max) return line;
	const cut = line.slice(0, max - 1);
	const lastSpace = cut.lastIndexOf(' ');
	return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:!?-]+$/, '')}…`;
};

/** Only http(s) links are rendered: a stored `javascript:` or `data:` URL never becomes a link. */
export const isExternalHttpUrl = (value: string | null | undefined): value is string => {
	if (!value) return false;
	try {
		const { protocol } = new URL(value);
		return protocol === 'http:' || protocol === 'https:';
	} catch {
		return false;
	}
};

/** WhatsApp is stored as E.164 (+998…); wa.me wants the digits only (FRONTEND_MIGRATION §3.1). */
export const whatsappHref = (phone: string): string => `https://wa.me/${phone.replace(/\D/g, '')}`;

/** "More from @nick": one more than shown, so the current agent can be left out. */
export const MORE_FROM_SHOWN = 3;

export const moreFromVariables = (creatorId: string): { input: ProductsInquiry } => ({
	input: {
		page: 1,
		limit: MORE_FROM_SHOWN + 1,
		sort: 'createdAt',
		direction: Direction.Desc,
		search: { memberId: creatorId },
	},
});
