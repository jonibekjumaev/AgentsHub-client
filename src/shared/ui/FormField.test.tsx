import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useState } from 'react';
import { renderWithProviders } from '@/test/renderWithProviders';
import { FormTextField } from './FormField';

const Controlled = ({ error }: { error?: string }) => {
	const [value, setValue] = useState('Support');
	return (
		<FormTextField
			id="title"
			label="Agent name"
			hint="Shown on the agent card."
			error={error}
			value={value}
			onChange={(event) => setValue(event.target.value)}
			maxLength={10}
			required
		/>
	);
};

describe('FormTextField', () => {
	it('links the label, hint and counter to the input', () => {
		renderWithProviders(<Controlled />, { auth: {} });

		const input = screen.getByRole('textbox', { name: /Agent name/ });
		expect(input).toHaveAccessibleDescription('Shown on the agent card. 7 of 10 characters used');
		expect(input).not.toHaveAttribute('aria-invalid');
		expect(input).toHaveAttribute('aria-required', 'true');
		expect(screen.getByText('7 / 10')).toBeInTheDocument();
	});

	it('announces the error through aria-describedby and role="alert"', () => {
		renderWithProviders(<Controlled error="Enter a shorter name." />, { auth: {} });

		const input = screen.getByRole('textbox', { name: /Agent name/ });
		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(input).toHaveAccessibleDescription(/^Enter a shorter name\./);
		expect(screen.getByRole('alert')).toHaveTextContent('Enter a shorter name.');
		expect(screen.queryByText('Shown on the agent card.')).not.toBeInTheDocument();
	});

	it('updates the counter and stops at maxLength', async () => {
		const user = userEvent.setup();
		renderWithProviders(<Controlled />, { auth: {} });

		await user.type(screen.getByRole('textbox', { name: /Agent name/ }), ' Copilot');
		expect(screen.getByText('10 / 10')).toBeInTheDocument();
		expect(screen.getByRole('textbox', { name: /Agent name/ })).toHaveValue('Support Co');
	});
});
