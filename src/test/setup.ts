import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// next/router → in-memory router; tests drive it through `mockRouter` from next-router-mock.
vi.mock('next/router', async () => await import('next-router-mock'));

afterEach(() => {
	cleanup();
	window.localStorage.clear();
});
