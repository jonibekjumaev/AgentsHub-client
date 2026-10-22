import * as z from 'zod/mini';
import type { AgentCategory } from '@/gql/enums';
import type { BriefInput, BriefUpdate, OwnerBriefQuery } from '@/gql/graphql';
import { BRIEF_CATEGORIES } from './listQuery';

/**
 * BriefForm rules, mirroring FRONTEND_MIGRATION §3.7 (D-04 budget, D-05 / D-31 deadline).
 * Messages are i18n keys in briefs.json (form.errors.*). Text is trimmed, validated and sent trimmed.
 */
export const BRIEF_TITLE_MIN = 3;
export const BRIEF_TITLE_MAX = 100;
export const BRIEF_CONTENT_MIN = 20;
export const BRIEF_CONTENT_MAX = 3000;

/** Business messages the form tells apart (matched, never shown). */
export const BriefErrorMessage = {
	BudgetPositive: 'Budget must be greater than 0!',
	DeadlineFuture: 'Deadline must be in the future!',
} as const;

export type BriefFormValues = {
	briefTitle: string;
	briefCategory: AgentCategory | '';
	briefContent: string;
	/** The input's text; ignored while `openToOffers` is on. */
	briefBudget: string;
	/** D-04: no budget → "Open to offers". */
	openToOffers: boolean;
	/** yyyy-mm-dd from <input type="date">, '' = no deadline. */
	briefDeadline: string;
};

export const EMPTY_BRIEF_FORM: BriefFormValues = {
	briefTitle: '',
	briefCategory: '',
	briefContent: '',
	briefBudget: '',
	openToOffers: false,
	briefDeadline: '',
};

const pad = (value: number) => String(value).padStart(2, '0');

/** A Date as the local yyyy-mm-dd a date input shows. */
export const toDateInput = (date: Date): string => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** The earliest day the picker allows: today (the deadline is the end of the picked day). */
export const minDeadlineInput = (now: Date = new Date()): string => toDateInput(now);

/**
 * yyyy-mm-dd → the end of that day in the viewer's time zone, as ISO. Today stays valid until midnight,
 * and isDeadlinePassed (end of day, local) agrees with what was picked.
 */
export const deadlineToIso = (value: string): string | null => {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (!match) return null;
	const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 23, 59, 59, 999);
	return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

/** A stored ISO deadline → the local day for the date input ('' when none). */
export const deadlineFromIso = (value: string | null | undefined): string => {
	if (!value) return '';
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? '' : toDateInput(date);
};

/** True when the picked day is today or later (`now` is injectable for tests). */
export const isFutureDeadline = (value: string, now: Date = new Date()): boolean => {
	const iso = deadlineToIso(value);
	return iso !== null && new Date(iso).getTime() > now.getTime();
};

/** "500", " 19.5 " → number; anything else → null. */
export const parseBudget = (text: string): number | null => {
	if (text.trim() === '') return null;
	const value = Number(text);
	return Number.isFinite(value) ? value : null;
};

const key = (name: string) => `briefs:form.errors.${name}`;

/**
 * `keptDeadline`: the stored deadline when editing. Left unchanged it is not re-checked, so a brief whose
 * deadline has passed can still be edited (D-31); a changed one must be today or later.
 */
export const makeBriefFormSchema = (keptDeadline = '') =>
	z
		.object({
			briefTitle: z
				.string()
				.check(
					z.trim(),
					z.minLength(1, key('titleRequired')),
					z.minLength(BRIEF_TITLE_MIN, key('titleLength')),
					z.maxLength(BRIEF_TITLE_MAX, key('titleLength')),
				),
			briefCategory: z.enum(BRIEF_CATEGORIES as [AgentCategory, ...AgentCategory[]], { error: key('categoryRequired') }),
			briefContent: z
				.string()
				.check(
					z.trim(),
					z.minLength(1, key('contentRequired')),
					z.minLength(BRIEF_CONTENT_MIN, key('contentLength')),
					z.maxLength(BRIEF_CONTENT_MAX, key('contentLength')),
				),
			briefBudget: z.string(),
			openToOffers: z.boolean(),
			briefDeadline: z.string(),
		})
		.check(
			z.superRefine(
				(value, ctx) => {
					if (!value.openToOffers) {
						const budget = parseBudget(value.briefBudget);
						const message = value.briefBudget.trim() === '' ? key('budgetRequired') : budget === null || budget <= 0 ? key('budgetPositive') : null;
						if (message) ctx.addIssue({ code: 'custom', path: ['briefBudget'], message, input: value.briefBudget });
					}
					if (value.briefDeadline !== '' && value.briefDeadline !== keptDeadline && !isFutureDeadline(value.briefDeadline)) {
						ctx.addIssue({ code: 'custom', path: ['briefDeadline'], message: key('deadlineFuture'), input: value.briefDeadline });
					}
				},
				{ when: () => true },
			),
		);

export const briefFormSchema = makeBriefFormSchema();

export type ValidBriefForm = z.output<typeof briefFormSchema>;

const budgetOf = (form: Pick<BriefFormValues, 'openToOffers' | 'briefBudget'>): number | null =>
	form.openToOffers ? null : parseBudget(form.briefBudget);

/** createBrief input. No budget / deadline → the fields are left out (D-04 / D-05). */
export const toBriefInput = (form: ValidBriefForm): BriefInput => {
	const budget = budgetOf(form);
	const deadline = deadlineToIso(form.briefDeadline);
	return {
		briefTitle: form.briefTitle,
		briefCategory: form.briefCategory,
		briefContent: form.briefContent,
		...(budget !== null && { briefBudget: budget }),
		...(deadline !== null && { briefDeadline: deadline }),
	};
};

/**
 * updateBrief input with only what changed (§3.7): a field left out keeps its value, `null` clears
 * the budget / deadline. An unchanged deadline is never re-sent, so an old one does not block an ordinary
 * edit (D-31). Returns null when nothing changed.
 */
export const toBriefUpdate = (briefId: string, initial: BriefFormValues, form: ValidBriefForm): BriefUpdate | null => {
	const update: BriefUpdate = { _id: briefId };
	if (form.briefTitle !== initial.briefTitle) update.briefTitle = form.briefTitle;
	if (form.briefCategory !== initial.briefCategory) update.briefCategory = form.briefCategory;
	if (form.briefContent !== initial.briefContent) update.briefContent = form.briefContent;
	const budget = budgetOf(form);
	if (budget !== budgetOf(initial)) update.briefBudget = budget;
	if (form.briefDeadline !== initial.briefDeadline) update.briefDeadline = deadlineToIso(form.briefDeadline);
	return Object.keys(update).length > 1 ? update : null;
};

/** The stored brief as form values. */
export const fromBrief = (brief: OwnerBriefQuery['getBrief']): BriefFormValues => ({
	briefTitle: brief.briefTitle,
	briefCategory: brief.briefCategory,
	briefContent: brief.briefContent,
	briefBudget: brief.briefBudget == null ? '' : String(brief.briefBudget),
	openToOffers: brief.briefBudget == null,
	briefDeadline: deadlineFromIso(brief.briefDeadline),
});
