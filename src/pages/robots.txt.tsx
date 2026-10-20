import type { GetServerSideProps } from 'next';
import { env } from '@/config/env';
import { buildRobots } from '@/features/seo';

/** /robots.txt: private pages disallowed; outside production nothing is indexed. */
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
	res.setHeader('Content-Type', 'text/plain; charset=utf-8');
	res.setHeader('Cache-Control', 'public, s-maxage=86400');
	res.write(buildRobots(env.siteUrl, env.isProduction));
	res.end();
	return { props: {} };
};

const Robots = () => null;

export default Robots;
