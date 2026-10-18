import { Box } from '@mui/material';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { visuallyHidden } from './visuallyHidden';

describe('visuallyHidden', () => {
	it('is a 1px box (sx would read a bare 1 as 100%, which widened pages)', () => {
		renderWithProviders(
			<Box component="span" sx={visuallyHidden}>
				per month
			</Box>,
			{ auth: {} },
		);
		const hidden = screen.getByText('per month');
		expect(hidden).toHaveStyle({ position: 'absolute', width: '1px', height: '1px', margin: '-1px', overflow: 'hidden' });
	});
});
