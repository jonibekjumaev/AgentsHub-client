import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// next/router → in-memory router; tests drive it through `mockRouter` from next-router-mock.
vi.mock('next/router', async () => await import('next-router-mock'));

// findBy* / waitFor wait up to 3 s (default 1 s): big forms render slower while the whole suite runs in parallel.
configure({ asyncUtilTimeout: 3000 });

afterEach(() => {
	cleanup();
	window.localStorage.clear();
});
