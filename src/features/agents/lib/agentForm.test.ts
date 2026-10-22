import { describe, expect, it } from 'vitest';
import {
	EMPTY_AGENT_FORM,
	agentFormSchema,
	fromAgent,
	isDemoUrl,
	toProductInput,
	toProductUpdate,
	type AgentFormValues,
	type ValidAgentForm,
} from './agentForm';

const valid: AgentFormValues = {
	productTitle: '  SupportPilot  ',
	productCategory: 'CUSTOMER_SUPPORT',
	productPricing: 'SUBSCRIPTION',
	productPrice: '49',
	productDemoUrl: '',
	productTags: ['telegram'],
	productImages: ['uploads/product/a.png'],
	productDesc: 'Answers customer questions in Telegram.',
};

/** The first issue per field — what zodResolver shows. */
const errorsOf = (values: AgentFormValues) => {
	const errors: Record<string, string> = {};
	for (const issue of agentFormSchema.safeParse(values).error?.issues ?? []) errors[issue.path.join('.')] ??= issue.message;
	return errors;
};

const parse = (values: AgentFormValues) => agentFormSchema.parse(values) as ValidAgentForm;

describe('agentFormSchema', () => {
	it('accepts a valid agent and trims title and description', () => {
		const result = parse(valid);
		expect(result.productTitle).toBe('SupportPilot');
		expect(result.productDesc).toBe('Answers customer questions in Telegram.');
	});

	it('reports every missing required field at once, the price included', () => {
		expect(errorsOf({ ...EMPTY_AGENT_FORM, productPricing: 'ONE_TIME' })).toEqual({
			productTitle: 'agents:form.errors.titleRequired',
			productCategory: 'agents:form.errors.categoryRequired',
			productPrice: 'agents:form.errors.priceRequired',
			productImages: 'agents:form.errors.imagesRequired',
			productDesc: 'agents:form.errors.descRequired',
		});
		expect(errorsOf(EMPTY_AGENT_FORM).productPricing).toBe('agents:form.errors.pricingRequired');
	});

	it.each([
		['ab', 'agents:form.errors.titleLength'],
		['   ab   ', 'agents:form.errors.titleLength'],
		['x'.repeat(101), 'agents:form.errors.titleLength'],
	])('rejects the title %j', (productTitle, message) => {
		expect(errorsOf({ ...valid, productTitle }).productTitle).toBe(message);
	});

	it('accepts titles of exactly 3 and 100 characters', () => {
		expect(errorsOf({ ...valid, productTitle: 'abc' }).productTitle).toBeUndefined();
		expect(errorsOf({ ...valid, productTitle: 'x'.repeat(100) }).productTitle).toBeUndefined();
	});

	it('limits the description to 20–3000 characters after trimming', () => {
		expect(errorsOf({ ...valid, productDesc: `  ${'x'.repeat(19)}  ` }).productDesc).toBe('agents:form.errors.descLength');
		expect(errorsOf({ ...valid, productDesc: 'x'.repeat(20) }).productDesc).toBeUndefined();
		expect(errorsOf({ ...valid, productDesc: 'x'.repeat(3001) }).productDesc).toBe('agents:form.errors.descLength');
	});

	describe('D-03 price rule', () => {
		it.each(['FREE', 'CUSTOM'] as const)('%s needs no price, and a leftover one is ignored', (productPricing) => {
			expect(errorsOf({ ...valid, productPricing, productPrice: '' }).productPrice).toBeUndefined();
			expect(errorsOf({ ...valid, productPricing, productPrice: '49' }).productPrice).toBeUndefined();
		});

		it.each(['ONE_TIME', 'SUBSCRIPTION'] as const)('%s needs a price greater than 0', (productPricing) => {
			expect(errorsOf({ ...valid, productPricing, productPrice: '' }).productPrice).toBe('agents:form.errors.priceRequired');
			expect(errorsOf({ ...valid, productPricing, productPrice: '0' }).productPrice).toBe('agents:form.errors.pricePositive');
			expect(errorsOf({ ...valid, productPricing, productPrice: '-5' }).productPrice).toBe('agents:form.errors.pricePositive');
			expect(errorsOf({ ...valid, productPricing, productPrice: 'abc' }).productPrice).toBe('agents:form.errors.pricePositive');
			expect(errorsOf({ ...valid, productPricing, productPrice: '0.5' }).productPrice).toBeUndefined();
		});
	});

	it('takes 1–10 images', () => {
		expect(errorsOf({ ...valid, productImages: [] }).productImages).toBe('agents:form.errors.imagesRequired');
		const eleven = Array.from({ length: 11 }, (_, index) => `uploads/product/${index}.png`);
		expect(errorsOf({ ...valid, productImages: eleven }).productImages).toBe('agents:form.errors.imagesMax');
	});

	it('takes up to 10 tags', () => {
		const eleven = Array.from({ length: 11 }, (_, index) => `t${index}`);
		expect(errorsOf({ ...valid, productTags: eleven }).productTags).toBe('agents:form.errors.tagsMax');
	});

	it('checks the demo URL and its length', () => {
		expect(errorsOf({ ...valid, productDemoUrl: 'demo.example.com' }).productDemoUrl).toBe('agents:form.errors.demoUrl');
		expect(errorsOf({ ...valid, productDemoUrl: `https://example.com/${'a'.repeat(490)}` }).productDemoUrl).toBe(
			'agents:form.errors.demoUrlLength',
		);
		expect(errorsOf({ ...valid, productDemoUrl: ' https://demo.example.com ' }).productDemoUrl).toBeUndefined();
	});
});

describe('isDemoUrl (@IsUrl with http/https and a protocol required)', () => {
	it.each([
		['https://demo.example.com', true],
		['http://example.uz/try?x=1', true],
		['https://bücher.de', true],
		['ftp://example.com', false],
		['javascript:alert(1)', false],
		['example.com', false],
		['http://localhost:3000', false],
		['https://exa mple.com', false],
	])('%s → %s', (url, expected) => {
		expect(isDemoUrl(url)).toBe(expected);
	});
});

describe('toProductInput', () => {
	it('sends the price only for ONE_TIME / SUBSCRIPTION, and leaves empty optional fields out', () => {
		expect(toProductInput(parse(valid))).toEqual({
			productTitle: 'SupportPilot',
			productCategory: 'CUSTOMER_SUPPORT',
			productPricing: 'SUBSCRIPTION',
			productPrice: 49,
			productTags: ['telegram'],
			productImages: ['uploads/product/a.png'],
			productDesc: 'Answers customer questions in Telegram.',
		});
		const free = toProductInput(parse({ ...valid, productPricing: 'FREE', productPrice: '49', productTags: [] }));
		expect(free).not.toHaveProperty('productPrice');
		expect(free).not.toHaveProperty('productTags');
		expect(free).not.toHaveProperty('productDemoUrl');
	});
});

describe('toProductUpdate (only what changed, §1.4)', () => {
	const stored: AgentFormValues = { ...valid, productTitle: 'SupportPilot', productDemoUrl: 'https://demo.example.com' };
	const ID = '6ac7992dd87bde19b9216c8b';

	it('is null when nothing changed', () => {
		expect(toProductUpdate(ID, stored, parse(stored))).toBeNull();
	});

	it('sends changed fields only; null clears the demo URL, [] clears the tags', () => {
		expect(toProductUpdate(ID, stored, parse({ ...stored, productTitle: 'SupportPilot 2', productDemoUrl: '', productTags: [] }))).toEqual({
			_id: ID,
			productTitle: 'SupportPilot 2',
			productDemoUrl: null,
			productTags: [],
		});
	});

	it('sends a reordered image list', () => {
		const withTwo = { ...stored, productImages: ['a', 'b'] };
		expect(toProductUpdate(ID, withTwo, parse({ ...withTwo, productImages: ['b', 'a'] }))).toEqual({ _id: ID, productImages: ['b', 'a'] });
	});

	it('D-03: switching to FREE / CUSTOM sends no price (the API clears it)', () => {
		expect(toProductUpdate(ID, stored, parse({ ...stored, productPricing: 'CUSTOM' }))).toEqual({ _id: ID, productPricing: 'CUSTOM' });
	});

	it('D-03: switching to a paid pricing sends the price with it', () => {
		const free = { ...stored, productPricing: 'FREE' as const, productPrice: '' };
		expect(toProductUpdate(ID, free, parse({ ...free, productPricing: 'ONE_TIME', productPrice: '29' }))).toEqual({
			_id: ID,
			productPricing: 'ONE_TIME',
			productPrice: 29,
		});
	});

	it('D-03: a new price alone is sent; the same price is not', () => {
		expect(toProductUpdate(ID, stored, parse({ ...stored, productPrice: '59' }))).toEqual({ _id: ID, productPrice: 59 });
		expect(toProductUpdate(ID, stored, parse({ ...stored, productPrice: '49.0' }))).toBeNull();
	});
});

describe('fromAgent', () => {
	it('turns stored nulls into empty inputs', () => {
		expect(
			fromAgent({
				_id: 'x',
				memberId: 'm',
				productStatus: 'PAUSED',
				productTitle: 'T',
				productCategory: 'SALES',
				productPricing: 'FREE',
				productPrice: null,
				productDemoUrl: null,
				productTags: null,
				productImages: ['a'],
				productDesc: 'D',
				productLikes: 0,
				productViews: 0,
				updatedAt: '',
			}),
		).toMatchObject({ productPrice: '', productDemoUrl: '', productTags: [] });
	});
});
