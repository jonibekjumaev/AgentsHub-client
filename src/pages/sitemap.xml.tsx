import type { GetServerSideProps } from 'next';
import { initializeApollo } from '@/apollo/client';
import { env } from '@/config/env';
import { AgentsListQuery } from '@/features/agents';
import { BriefsListQuery } from '@/features/briefs';
import { ArticlesListQuery } from '@/features/community';
import { CreatorsListQuery } from '@/features/creators';
import { STATIC_PATHS, buildSitemap, type SitemapEntry } from '@/features/seo';
import { Direction } from '@/gql/enums';

/** Newest items per type. The API's list limit applies; a bigger site would split this into a sitemap index. */
const LIMIT = 100;
const newest = (sort = 'createdAt') => ({ input: { page: 1, limit: LIMIT, sort, direction: Direction.Desc, search: {} } });

/** /sitemap.xml: public pages only, built on request and cached for an hour by the CDN. */
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
	const client = initializeApollo();
	const [agents, briefs, creators, articles] = await Promise.all([
		client.query({ query: AgentsListQuery, variables: newest() }).catch(() => null),
		client.query({ query: BriefsListQuery, variables: newest() }).catch(() => null),
		client.query({ query: CreatorsListQuery, variables: newest() }).catch(() => null),
		client.query({ query: ArticlesListQuery, variables: newest() }).catch(() => null),
	]);

	const entries: SitemapEntry[] = [
		...STATIC_PATHS.map((path) => ({ path })),
		...(agents?.data.getProducts.list ?? []).map((item) => ({ path: `/agents/${item._id}` })),
		...(briefs?.data.getBriefs.list ?? []).map((item) => ({ path: `/briefs/${item._id}`, lastmod: item.createdAt })),
		...(creators?.data.getCreators.list ?? []).map((item) => ({ path: `/members/${item._id}` })),
		...(articles?.data.getBoardArticles.list ?? []).map((item) => ({ path: `/community/${item._id}`, lastmod: item.createdAt })),
	];

	res.setHeader('Content-Type', 'application/xml; charset=utf-8');
	res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
	res.write(buildSitemap(env.siteUrl, entries));
	res.end();
	return { props: {} };
};

const Sitemap = () => null;

export default Sitemap;
