import { ApolloError } from '@apollo/client';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { PageSkeleton } from './Skeletons';

describe('EmptyState', () => {
	it('shows title, text and fires its one action', async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();
		renderWithProviders(
			<EmptyState title="No agents yet" text="Publish your first agent." action={{ label: 'Create agent', onClick }} />,
			{ auth: {} },
		);

		expect(screen.getByRole('heading', { name: 'No agents yet' })).toBeInTheDocument();
		expect(screen.getByText('Publish your first agent.')).toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: 'Create agent' }));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it('renders a link action', () => {
		renderWithProviders(<EmptyState title="Nothing here" action={{ label: 'Browse agents', href: '/agents' }} />, {
			auth: {},
		});
		expect(screen.getByRole('link', { name: 'Browse agents' })).toHaveAttribute('href', '/agents');
	});
});

describe('ErrorState', () => {
	it('shows the mapped message, never backend text, and retries', async () => {
		const user = userEvent.setup();
		const onRetry = vi.fn();
		const error = new ApolloError({
			graphQLErrors: [{ message: 'Raw backend detail', extensions: { code: 'NOT_FOUND' } }],
		});
		renderWithProviders(<ErrorState error={error} onRetry={onRetry} />, { auth: {} });

		const alert = screen.getByRole('alert');
		expect(alert).toHaveTextContent('Something went wrong');
		expect(alert).toHaveTextContent("We couldn't find what you were looking for.");
		expect(alert).not.toHaveTextContent('Raw backend detail');

		await user.click(screen.getByRole('button', { name: 'Try again' }));
		expect(onRetry).toHaveBeenCalledTimes(1);
	});

	it('maps an unreachable server to the network text', () => {
		renderWithProviders(<ErrorState error={new ApolloError({ networkError: new TypeError('x') })} />, { auth: {} });
		expect(screen.getByRole('alert')).toHaveTextContent("Can't reach the server.");
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});
});

describe('PageSkeleton', () => {
	it('is one busy status region with hidden shapes', () => {
		renderWithProviders(<PageSkeleton variant="rows" count={2} />, { auth: {} });
		const region = screen.getByRole('status', { name: 'Loading…' });
		expect(region).toHaveAttribute('aria-busy', 'true');
	});
});
