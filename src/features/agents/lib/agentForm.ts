import * as z from 'zod/mini';
import { ProductPricing, type AgentCategory } from '@/gql/enums';
import type { OwnerAgentQuery, ProductInput, ProductUpdate } from '@/gql/graphql';
import { AGENT_CATEGORIES, AGENT_PRICINGS, TAGS_MAX, TAG_MAX_LENGTH } from './listQuery';

/**
 * AgentForm rules, mirroring the API DTOs (agentshub-api libs/dto/product/product.input.ts / .update.ts,
 * libs/config.ts) and the D-03 price rule. Messages are i18n keys in agents.json (form.errors.*).
 * Title and description are trimmed, and the trimmed text is both validated and sent.
 */
export const TITLE_MIN = 3;
export const TITLE_MAX = 100;
export const DESC_MIN = 20;
export const DESC_MAX = 3000;
export const DEMO_URL_MAX = 500;
export const IMAGES_MIN = 1;
/** The DTO has no maximum; the upload endpoint takes at most 10 files per request, and so does the form. */
export const IMAGES_MAX = 10;

export type AgentFormValues = {
	productTitle: string;
	productCategory: AgentCategory | '';
	productPricing: ProductPricing | '';
	/** The input's text; a number only for ONE_TIME / SUBSCRIPTION. */
	productPrice: string;
	productDemoUrl: string;
	/** Already normalized by the tag input: trimmed, lowercased, unique. */
	productTags: string[];
	/** Uploaded paths, cover first. */
	productImages: string[];
	productDesc: string;
};

export const EMPTY_AGENT_FORM: AgentFormValues = {
	productTitle: '',
	productCategory: '',
	productPricing: '',
	productPrice: '',
	productDemoUrl: '',
	productTags: [],
	productImages: [],
	productDesc: '',
};

/** D-03: only these pricings have a price. */
export const isPaidPricing = (pricing: string): boolean =>
	pricing === ProductPricing.OneTime || pricing === ProductPricing.Subscription;

/** "49", " 19.5 " → number; anything else (empty, text, Infinity) → null. */
export const parsePrice = (text: string): number | null => {
	if (text.trim() === '') return null;
	const value = Number(text);
	return Number.isFinite(value) ? value : null;
};

/**
 * @IsUrl({ protocols: ['http', 'https'], require_protocol: true }) with validator.js defaults:
 * http(s) only, no spaces, and a host with a top-level domain (so http://localhost is refused too).
 */
export const isDemoUrl = (value: string): boolean => {
	if (/\s/.test(value)) return false;
	try {
		const { protocol, hostname } = new URL(value);
		if (protocol !== 'http:' && protocol !== 'https:') return false;
		const labels = hostname.split('.');
		return labels.length > 1 && /^([a-z¡-￿]{2,}|xn--[a-z0-9-]{2,})$/i.test(labels[labels.length - 1]);
	} catch {
		return false;
	}
};

const key = (name: string) => `agents:form.errors.${name}`;

export const agentFormSchema = z
	.object({
		productTitle: z
			.string()
			.check(
				z.trim(),
				z.minLength(1, key('titleRequired')),
				z.minLength(TITLE_MIN, key('titleLength')),
				z.maxLength(TITLE_MAX, key('titleLength')),
			),
		productCategory: z.enum(AGENT_CATEGORIES as [AgentCategory, ...AgentCategory[]], { error: key('categoryRequired') }),
		productPricing: z.enum(AGENT_PRICINGS as [ProductPricing, ...ProductPricing[]], { error: key('pricingRequired') }),
		productPrice: z.string(),
		productDemoUrl: z
			.string()
			.check(
				z.trim(),
				z.maxLength(DEMO_URL_MAX, key('demoUrlLength')),
				z.refine((value) => value === '' || isDemoUrl(value), key('demoUrl')),
			),
		productTags: z
			.array(z.string().check(z.minLength(1), z.maxLength(TAG_MAX_LENGTH), z.regex(/\S/)))
			.check(z.maxLength(TAGS_MAX, key('tagsMax'))),
		productImages: z
			.array(z.string())
			.check(z.minLength(IMAGES_MIN, key('imagesRequired')), z.maxLength(IMAGES_MAX, key('imagesMax'))),
		productDesc: z
			.string()
			.check(
				z.trim(),
				z.minLength(1, key('descRequired')),
				z.minLength(DESC_MIN, key('descLength')),
				z.maxLength(DESC_MAX, key('descLength')),
			),
	})
	.check(
		// D-03, on the pair. `when` makes it run even while other fields are invalid, so the price error
		// shows together with the rest instead of only after everything else is fixed.
		z.superRefine(
			(value, ctx) => {
				if (!isPaidPricing(value.productPricing)) return;
				const price = parsePrice(value.productPrice);
				const message = value.productPrice.trim() === '' ? key('priceRequired') : price === null || price <= 0 ? key('pricePositive') : null;
				if (message) ctx.addIssue({ code: 'custom', path: ['productPrice'], message, input: value.productPrice });
			},
			{ when: () => true },
		),
	);

/** The form after validation: category and pricing are set, text is trimmed. */
export type ValidAgentForm = z.output<typeof agentFormSchema>;

/** createProduct input. FREE / CUSTOM never send a price, empty optional fields are left out (D-03, §1.4). */
export const toProductInput = (form: ValidAgentForm): ProductInput => ({
	productTitle: form.productTitle,
	productCategory: form.productCategory,
	productPricing: form.productPricing,
	...(isPaidPricing(form.productPricing) && { productPrice: parsePrice(form.productPrice) ?? undefined }),
	...(form.productDemoUrl !== '' && { productDemoUrl: form.productDemoUrl }),
	...(form.productTags.length > 0 && { productTags: form.productTags }),
	productImages: form.productImages,
	productDesc: form.productDesc,
});

const sameList = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((item, index) => item === b[index]);

/**
 * updateProduct input with only what changed (FRONTEND_MIGRATION §1.4): a field left out keeps its value,
 * `null` clears the demo URL, `[]` clears the tags. Price per D-03: never sent for FREE / CUSTOM (the API
 * then clears it); sent for ONE_TIME / SUBSCRIPTION when it or the pricing changed.
 * Returns null when nothing changed.
 */
export const toProductUpdate = (agentId: string, initial: AgentFormValues, form: ValidAgentForm): ProductUpdate | null => {
	const update: ProductUpdate = { _id: agentId };
	if (form.productTitle !== initial.productTitle) update.productTitle = form.productTitle;
	if (form.productCategory !== initial.productCategory) update.productCategory = form.productCategory;
	if (form.productPricing !== initial.productPricing) update.productPricing = form.productPricing;
	if (isPaidPricing(form.productPricing)) {
		const price = parsePrice(form.productPrice);
		if (price !== null && (form.productPricing !== initial.productPricing || price !== parsePrice(initial.productPrice))) {
			update.productPrice = price;
		}
	}
	if (form.productDemoUrl !== initial.productDemoUrl) update.productDemoUrl = form.productDemoUrl === '' ? null : form.productDemoUrl;
	if (!sameList(form.productTags, initial.productTags)) update.productTags = form.productTags;
	if (!sameList(form.productImages, initial.productImages)) update.productImages = form.productImages;
	if (form.productDesc !== initial.productDesc) update.productDesc = form.productDesc;
	return Object.keys(update).length > 1 ? update : null;
};

/** The stored agent as form values. */
export const fromAgent = (agent: OwnerAgentQuery['getProduct']): AgentFormValues => ({
	productTitle: agent.productTitle,
	productCategory: agent.productCategory,
	productPricing: agent.productPricing,
	productPrice: agent.productPrice == null ? '' : String(agent.productPrice),
	productDemoUrl: agent.productDemoUrl ?? '',
	productTags: agent.productTags ?? [],
	productImages: agent.productImages,
	productDesc: agent.productDesc,
});
