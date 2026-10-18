import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { Box, Card, CardContent, Chip, Skeleton, Stack, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { addApolloState, initializeApollo } from '@/apollo/client';
import { env } from '@/config/env';
import { graphql } from '@/gql';
import { PublicLayout, type NextPageWithLayout } from '@/shared/layout';
import { toErrorKey } from '@/shared/lib/errors';

// Dev-only check of SSR + hydration; real product queries will live in features/agents/graphql.
const DevApiProductsQuery = graphql(`
	query DevApiProducts($input: ProductsInquiry!) {
		getProducts(input: $input) {
			list {
				_id
				productTitle
				productCategory
				productPricing
				productPrice
				productLikes
				productViews
			}
			metaCounter {
				total
			}
		}
	}
`);

const variables = { input: { page: 1, limit: 3, sort: 'createdAt', search: {} } };

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
	if (env.isProduction) return { notFound: true };

	// One client per request, no auth header — public data only.
	const client = initializeApollo();
	try {
		await client.query({ query: DevApiProductsQuery, variables });
	} catch {
		// Leave the cache empty: the browser retries and renders the error state.
	}

	return addApolloState(client, {
		props: {
			...(await serverSideTranslations(locale ?? 'en', ['common', 'dev', 'errors'])),
		},
	});
};

const DevApiPage: NextPageWithLayout = () => {
	const { t } = useTranslation(['dev', 'errors']);
	const { locale } = useRouter();
	const { data, loading, error } = useQuery(DevApiProductsQuery, { variables });

	const products = data?.getProducts.list ?? [];
	const total = data?.getProducts.metaCounter?.[0]?.total ?? 0;
	const usd = (value: number) =>
		new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

	return (
		<>
			<Head>
				<title>{t('dev:api.metaTitle')}</title>
				<meta name="robots" content="noindex" />
			</Head>
			<Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 4, sm: 6 }, pt: 10, pb: 16 }}>
				<Typography variant="h1">{t('dev:api.title')}</Typography>
				<Typography variant="meta" sx={{ mt: 2, mb: 8 }}>
					{t('dev:api.intro')}
				</Typography>

				{loading && !data ? (
					<Stack spacing={3} aria-busy="true" aria-label={t('dev:api.loading')}>
						{[0, 1, 2].map((i) => (
							<Skeleton key={i} variant="rounded" height={88} />
						))}
					</Stack>
				) : error ? (
					<Box
						role="alert"
						sx={{
							p: 4,
							borderRadius: 3,
							border: 1,
							borderColor: 'dangerSoftBorder',
							bgcolor: 'dangerSoft',
							color: 'dangerInk',
							fontWeight: 600,
						}}
					>
						{t(toErrorKey(error))}
					</Box>
				) : products.length === 0 ? (
					<Typography>{t('dev:api.empty')}</Typography>
				) : (
					<Stack spacing={3}>
						<Typography variant="meta">{t('dev:api.total', { count: total })}</Typography>
						{products.map((product) => (
							<Card key={product._id} component="article">
								<CardContent sx={{ p: 4 }}>
									<Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
										<Chip size="small" label={product.productCategory} sx={{ bgcolor: 'accentSoft', color: 'primary.main' }} />
										<Chip size="small" label={product.productPricing} />
									</Stack>
									<Typography variant="h3" component="h2">
										{product.productTitle}
									</Typography>
									<Stack direction="row" spacing={4} useFlexGap flexWrap="wrap" alignItems="baseline" sx={{ mt: 2 }}>
										{product.productPrice != null && <Typography variant="mono">{usd(product.productPrice)}</Typography>}
										<Typography variant="meta">
											{t('dev:ui.card.likes', { count: product.productLikes })} ·{' '}
											{t('dev:ui.card.views', { count: product.productViews })}
										</Typography>
									</Stack>
								</CardContent>
							</Card>
						))}
					</Stack>
				)}
			</Box>
		</>
	);
};

DevApiPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;

export default DevApiPage;
