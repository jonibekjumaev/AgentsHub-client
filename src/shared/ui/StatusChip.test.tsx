import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { BriefStatus, ProductStatus } from '@/gql/enums';
import { renderWithProviders } from '@/test/renderWithProviders';
import { CategoryChip } from './CategoryChip';
import { StatusChip, type StatusChipProps } from './StatusChip';

const expectChip = (props: StatusChipProps, label: string, tone: string) => {
	renderWithProviders(<StatusChip {...props} />, { auth: {} });

	const chip = screen.getByText(label).closest('.MuiChip-root');
	expect(chip).toHaveAttribute('data-tone', tone);
	expect(chip?.tagName).toBe('SPAN');
	expect(screen.queryByRole('button')).not.toBeInTheDocument();
};

describe('StatusChip', () => {
	it.each<[ProductStatus, string, string]>([
		['ACTIVE', 'Active', 'success'],
		['PAUSED', 'Paused', 'warning'],
		['DELETE', 'Deleted', 'danger'],
	])('product %s → "%s" (%s)', (status, label, tone) => {
		expectChip({ kind: 'product', status }, label, tone);
	});

	it.each<[BriefStatus, string, string]>([
		['OPEN', 'Open', 'success'],
		['CLOSED', 'Closed', 'neutral'],
		['DELETE', 'Deleted', 'danger'],
	])('brief %s → "%s" (%s)', (status, label, tone) => {
		expectChip({ kind: 'brief', status }, label, tone);
	});
});

describe('CategoryChip', () => {
	it('is a plain label without onClick', () => {
		renderWithProviders(<CategoryChip category="CUSTOMER_SUPPORT" />, { auth: {} });
		expect(screen.getByText('Customer support')).toBeInTheDocument();
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});

	it('is a toggle button with onClick', () => {
		renderWithProviders(<CategoryChip category="SALES" onClick={() => undefined} selected />, { auth: {} });
		expect(screen.getByRole('button', { name: 'Sales' })).toHaveAttribute('aria-pressed', 'true');
	});
});
