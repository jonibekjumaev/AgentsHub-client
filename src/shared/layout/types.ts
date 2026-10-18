import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';

/** Wraps the rendered page in its layout; _app calls it (pages without one render bare). */
export type GetLayout = (page: ReactElement) => ReactNode;

/** Same defaults as NextPage. */
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
	getLayout?: GetLayout;
};
