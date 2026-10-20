import { describe, expect, it } from 'vitest';
import {
	EMPTY_BRIEF_FORM,
	briefFormSchema,
	deadlineFromIso,
	deadlineToIso,
	isFutureDeadline,
	makeBriefFormSchema,
	toBriefInput,
	toBriefUpdate,
	type BriefFormValues,
} from './briefForm';

const valid: BriefFormValues = {
	briefTitle: '  WhatsApp orders  ',
	briefCategory: 'SALES',
	briefContent: 'Take orders from WhatsApp and add them to our sheet.',
	briefBudget: '500',
	openToOffers: false,
	briefDeadline: '',
};

const errorsOf = (values: BriefFormValues) => {
	const result = briefFormSchema.safeParse(values);
	return result.success ? {} : Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message]));
};

describe('briefFormSchema', () => {
	it('accepts a valid brief and trims the text', () => {
		const result = briefFormSchema.parse(valid);
		expect(result.briefTitle).toBe('WhatsApp orders');
	});

	it('reports every rule with its i18n key', () => {
		expect(errorsOf(EMPTY_BRIEF_FORM)).toEqual({
			briefTitle: 'briefs:form.errors.titleRequired',
			briefCategory: 'briefs:form.errors.categoryRequired',
			briefContent: 'briefs:form.errors.contentRequired',
			briefBudget: 'briefs:form.errors.budgetRequired',
		});
		expect(errorsOf({ ...valid, briefTitle: 'ab', briefContent: 'too short' })).toMatchObject({
			briefTitle: 'briefs:form.errors.titleLength',
			briefContent: 'briefs:form.errors.contentLength',
		});
	});

	it('needs a budget above 0 unless "Open to offers" is on (D-04)', () => {
		expect(errorsOf({ ...valid, briefBudget: '0' })).toEqual({ briefBudget: 'briefs:form.errors.budgetPositive' });
		expect(errorsOf({ ...valid, briefBudget: '', openToOffers: true })).toEqual({});
	});

	it('refuses a past deadline (D-05), but not the stored one left unchanged (D-31)', () => {
		expect(errorsOf({ ...valid, briefDeadline: '2020-01-01' })).toEqual({ briefDeadline: 'briefs:form.errors.deadlineFuture' });
		expect(makeBriefFormSchema('2020-01-01').safeParse({ ...valid, briefDeadline: '2020-01-01' }).success).toBe(true);
		expect(makeBriefFormSchema('2020-01-01').safeParse({ ...valid, briefDeadline: '2020-01-02' }).success).toBe(false);
	});
});

describe('deadline dates', () => {
	it('sends the end of the picked local day and reads it back as the same day', () => {
		const iso = deadlineToIso('2026-11-30') as string;
		expect(new Date(iso).getDate()).toBe(30);
		expect(deadlineFromIso(iso)).toBe('2026-11-30');
		expect(deadlineToIso('nope')).toBeNull();
	});

	it('keeps today valid until it is over', () => {
		const now = new Date(2026, 9, 20, 15, 0, 0);
		expect(isFutureDeadline('2026-10-20', now)).toBe(true);
		expect(isFutureDeadline('2026-10-19', now)).toBe(false);
	});
});

describe('toBriefInput / toBriefUpdate', () => {
	it('leaves out an empty budget and deadline on create', () => {
		const form = briefFormSchema.parse({ ...valid, openToOffers: true });
		expect(toBriefInput(form)).toEqual({
			briefTitle: 'WhatsApp orders',
			briefCategory: 'SALES',
			briefContent: 'Take orders from WhatsApp and add them to our sheet.',
		});
	});

	it('sends only changes on update, null to clear, and nothing when unchanged', () => {
		const initial: BriefFormValues = { ...valid, briefTitle: 'WhatsApp orders', briefDeadline: '2099-11-30' };
		expect(toBriefUpdate('id', initial, briefFormSchema.parse({ ...initial, briefDeadline: '2099-01-01' }))).toBeTruthy();
		expect(toBriefUpdate('id', initial, briefFormSchema.parse({ ...initial, openToOffers: true, briefDeadline: '' }))).toEqual({
			_id: 'id',
			briefBudget: null,
			briefDeadline: null,
		});
		expect(toBriefUpdate('id', { ...initial, briefDeadline: '' }, briefFormSchema.parse({ ...initial, briefDeadline: '' }))).toBeNull();
	});
});
