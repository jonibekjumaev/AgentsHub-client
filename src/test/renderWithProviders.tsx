import type { ReactElement, ReactNode } from 'react';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { render, type RenderOptions } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { vi } from 'vitest';
import { AuthProvider } from '@/auth';
import { AuthContext, type AuthContextValue } from '@/auth/AuthProvider';
import { ToastProvider } from '@/shared/ui/toast';
import { theme } from '@/theme/theme';
import { createTestI18n } from './i18n';

type Options = Omit<RenderOptions, 'wrapper'> & {
	/** Apollo mocks for MockedProvider. */
	mocks?: MockedResponse[];
	/** A mocked auth state. Leave out to run the real AuthProvider against `mocks`. */
	auth?: Partial<AuthContextValue>;
};

export const mockAuth = (auth: Partial<AuthContextValue> = {}): AuthContextValue => ({
	me: null,
	status: 'guest',
	startSession: vi.fn(async () => undefined),
	refetchMe: vi.fn(async () => undefined),
	logout: vi.fn(async () => undefined),
	...auth,
});

/**
 * Renders with our theme, Apollo MockedProvider, real English translations and auth.
 * next/router is already mocked globally (src/test/setup.ts) — use `mockRouter` to set the URL.
 */
export const renderWithProviders = (ui: ReactElement, { mocks = [], auth, ...options }: Options = {}) => {
	const i18n = createTestI18n();

	const Wrapper = ({ children }: { children: ReactNode }) => (
		<MockedProvider mocks={mocks}>
			<I18nextProvider i18n={i18n}>
				<ThemeProvider theme={theme}>
					<ToastProvider>
						{auth ? (
							<AuthContext.Provider value={mockAuth(auth)}>{children}</AuthContext.Provider>
						) : (
							<AuthProvider>{children}</AuthProvider>
						)}
					</ToastProvider>
				</ThemeProvider>
			</I18nextProvider>
		</MockedProvider>
	);

	return render(ui, { wrapper: Wrapper, ...options });
};
