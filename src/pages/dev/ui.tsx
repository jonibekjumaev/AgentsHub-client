import { useState } from 'react';
import type { ReactNode } from 'react';
import type { GetStaticProps } from 'next';
import Head from 'next/head';
import { ApolloError } from '@apollo/client';
import { Box, Button, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import { SearchOff as SearchOffIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { env } from '@/config/env';
import { AgentCategory, BriefStatus, ProductPricing, ProductStatus } from '@/gql/enums';
import { PublicLayout, type NextPageWithLayout } from '@/shared/layout';
import { useFormat } from '@/shared/lib/format';
import {
	Avatar,
	CardSkeleton,
	CategoryChip,
	ConfirmDialog,
	EmptyState,
	ErrorState,
	FormTextField,
	PageSkeleton,
	Pagination,
	PriceTag,
	RowSkeleton,
	StatusChip,
	useToast,
} from '@/shared/ui';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
	if (env.isProduction) return { notFound: true };

	return {
		props: {
			...(await serverSideTranslations(locale ?? 'en', ['common', 'dev', 'errors'])),
		},
	};
};

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
	<Box component="section" sx={{ py: 6, borderTop: 1, borderColor: 'border' }}>
		<Typography variant="overline" component="h2" sx={{ display: 'block', mb: 4 }}>
			{title}
		</Typography>
		{children}
	</Box>
);

const Sub = ({ children }: { children: ReactNode }) => (
	<Typography variant="meta" component="h3" sx={{ fontWeight: 700, mt: 4, mb: 2 }}>
		{children}
	</Typography>
);

const Row = ({ children }: { children: ReactNode }) => (
	<Stack direction="row" spacing={3} useFlexGap flexWrap="wrap" alignItems="center">
		{children}
	</Stack>
);

const SAMPLE_MEMBERS = [
	{ id: '6ac7992dd87bde19b9216c8b', name: 'Sarah Chen' },
	{ id: '6ac7992dd87bde19b9216c88', name: 'Nodir Latipov' },
	{ id: '6ac7992dd87bde19b9216c85', name: 'aria' },
	{ id: '6ac7992dd87bde19b9216c80', name: 'Park Woo' },
	{ id: '6ac7992dd87bde19b9216c7a', name: 'Dilnoza B' },
	{ id: '6ac7992dd87bde19b9216c71', name: 'olim' },
];

const NOW = Date.now();
const networkError = new ApolloError({ networkError: new TypeError('Failed to fetch') });

const DevUiPage: NextPageWithLayout = () => {
	const { t } = useTranslation(['dev', 'common']);
	const format = useFormat();
	const toast = useToast();

	const [name, setName] = useState('Support Copilot');
	const [selectedCategory, setSelectedCategory] = useState<AgentCategory | null>(AgentCategory.Automation);
	const [page, setPage] = useState(5);
	const [dialog, setDialog] = useState<'closed' | 'open' | 'loading'>('closed');

	const confirmDelete = () => {
		setDialog('loading');
		window.setTimeout(() => {
			setDialog('closed');
			toast.success(t('dev:ui.toasts.deleted'));
		}, 1200);
	};

	return (
		<>
			<Head>
				<title>{t('dev:ui.metaTitle')}</title>
				<meta name="robots" content="noindex" />
			</Head>
			<Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 4, sm: 6 }, pt: 10, pb: 16 }}>
				<Typography variant="h1">{t('dev:ui.title')}</Typography>
				<Typography variant="meta" sx={{ mt: 2, mb: 8 }}>
					{t('dev:ui.intro')}
				</Typography>

				<Section title={t('dev:ui.sections.logo')}>
					<Typography component="span" sx={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: 'ink' }}>
						{t('dev:ui.logoStart')}
						<Box component="span" sx={{ color: 'primary.main' }}>
							{t('dev:ui.logoEnd')}
						</Box>
					</Typography>
				</Section>

				<Section title={t('dev:ui.sections.typography')}>
					<Stack spacing={3}>
						<Typography variant="h1" component="p">
							{t('dev:ui.sample.h1')}
						</Typography>
						<Typography variant="h2" component="p">
							{t('dev:ui.sample.h2')}
						</Typography>
						<Typography variant="h3" component="p">
							{t('dev:ui.sample.h3')}
						</Typography>
						<Typography sx={{ whiteSpace: 'pre-line' }}>{t('dev:ui.sample.body')}</Typography>
						<Typography variant="body2">{t('dev:ui.sample.bodySmall')}</Typography>
						<Typography variant="meta">{t('dev:ui.sample.meta')}</Typography>
						<Typography variant="caption">{t('dev:ui.sample.caption')}</Typography>
						<Typography variant="overline">{t('dev:ui.sample.overline')}</Typography>
					</Stack>
				</Section>

				<Section title={t('dev:ui.sections.buttons')}>
					<Stack spacing={4}>
						<Row>
							<Button>{t('dev:ui.buttons.primary')}</Button>
							<Button variant="outlined">{t('dev:ui.buttons.secondary')}</Button>
							<Button variant="soft">{t('dev:ui.buttons.soft')}</Button>
							<Button variant="outlined" color="error">
								{t('dev:ui.buttons.danger')}
							</Button>
							<Button variant="text">{t('dev:ui.buttons.text')}</Button>
							<Button disabled>{t('dev:ui.buttons.disabled')}</Button>
						</Row>
						<Row>
							<Button size="small">{t('dev:ui.buttons.small')}</Button>
							<Button size="medium">{t('dev:ui.buttons.medium')}</Button>
							<Button size="large">{t('dev:ui.buttons.large')}</Button>
						</Row>
					</Stack>
				</Section>

				<Section title={t('dev:ui.sections.inputs')}>
					<Box sx={{ display: 'grid', gap: 6, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
						<FormTextField
							id="dev-name"
							label={t('dev:ui.inputs.nameLabel')}
							hint={t('dev:ui.inputs.nameHint')}
							placeholder={t('dev:ui.inputs.namePlaceholder')}
							value={name}
							onChange={(event) => setName(event.target.value)}
							maxLength={50}
							required
						/>
						<FormTextField
							id="dev-price"
							label={t('dev:ui.inputs.priceLabel')}
							value="0"
							error={t('dev:ui.inputs.priceError')}
							inputProps={{ inputMode: 'decimal' }}
						/>
						<FormTextField id="dev-disabled" label={t('dev:ui.inputs.disabledLabel')} value="—" disabled />
					</Box>
				</Section>

				<Section title={t('dev:ui.sections.chips')}>
					<Sub>{t('dev:ui.sub.productStatus')}</Sub>
					<Row>
						{Object.values(ProductStatus).map((status) => (
							<StatusChip key={status} kind="product" status={status} />
						))}
					</Row>
					<Sub>{t('dev:ui.sub.briefStatus')}</Sub>
					<Row>
						{Object.values(BriefStatus).map((status) => (
							<StatusChip key={status} kind="brief" status={status} />
						))}
						<StatusChip kind="brief" status="OPEN" size="medium" />
					</Row>
					<Sub>{t('dev:ui.sub.categories')}</Sub>
					<Row>
						{Object.values(AgentCategory).map((category) => (
							<CategoryChip key={category} category={category} />
						))}
					</Row>
					<Sub>{t('dev:ui.sub.categoryFilter')}</Sub>
					<Row>
						{Object.values(AgentCategory)
							.slice(0, 4)
							.map((category) => (
								<CategoryChip
									key={category}
									category={category}
									selected={selectedCategory === category}
									onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
								/>
							))}
					</Row>
				</Section>

				<Section title={t('dev:ui.sections.price')}>
					<Row>
						<PriceTag pricing={ProductPricing.Free} price={null} />
						<PriceTag pricing={ProductPricing.OneTime} price={190} />
						<PriceTag pricing={ProductPricing.OneTime} price={19.99} />
						<PriceTag pricing={ProductPricing.Subscription} price={29} />
						<PriceTag pricing={ProductPricing.Custom} price={null} />
						<PriceTag pricing={ProductPricing.Subscription} price={49} size="large" />
					</Row>
				</Section>

				<Section title={t('dev:ui.sections.format')}>
					<Stack spacing={1.5}>
						{[
							[t('dev:ui.format.price'), `${format.price(190)} · ${format.price(1499.5)}`],
							[t('dev:ui.format.number'), format.number(12480)],
							[t('dev:ui.format.compact'), `${format.compact(48200)} · ${format.compact(1250000)}`],
							[t('dev:ui.format.date'), format.date(NOW)],
							[t('dev:ui.format.relative'), `${format.relative(NOW - 2 * 3600_000)} · ${format.relative(NOW - 86_400_000)}`],
						].map(([label, value]) => (
							<Row key={label}>
								<Typography variant="meta" component="span" sx={{ minWidth: 120 }}>
									{label}
								</Typography>
								<Typography variant="mono" component="span">
									{value}
								</Typography>
							</Row>
						))}
					</Stack>
				</Section>

				<Section title={t('dev:ui.sections.avatars')}>
					<Sub>{t('dev:ui.sub.palettes')}</Sub>
					<Row>
						{SAMPLE_MEMBERS.map((member) => (
							<Avatar key={member.id} memberId={member.id} name={member.name} />
						))}
					</Row>
					<Sub>{t('dev:ui.sub.sizes')}</Sub>
					<Row>
						<Avatar memberId={SAMPLE_MEMBERS[0].id} name={SAMPLE_MEMBERS[0].name} size={36} />
						<Avatar memberId={SAMPLE_MEMBERS[0].id} name={SAMPLE_MEMBERS[0].name} size={52} radius={14} />
						<Avatar memberId={SAMPLE_MEMBERS[0].id} name={SAMPLE_MEMBERS[0].name} size={96} radius={24} />
					</Row>
				</Section>

				<Section title={t('dev:ui.sections.states')}>
					<Stack spacing={4}>
						<EmptyState
							icon={<SearchOffIcon />}
							title={t('dev:ui.states.emptyTitle')}
							text={t('dev:ui.states.emptyText')}
							action={{ label: t('dev:ui.states.emptyAction'), onClick: () => toast.info(t('dev:ui.toasts.info')) }}
						/>
						<ErrorState error={networkError} onRetry={() => toast.info(t('dev:ui.toasts.retry'))} />
					</Stack>
				</Section>

				<Section title={t('dev:ui.sections.skeletons')}>
					<Sub>{t('dev:ui.sub.card')}</Sub>
					<Box sx={{ maxWidth: 320 }}>
						<CardSkeleton />
					</Box>
					<Sub>{t('dev:ui.sub.row')}</Sub>
					<RowSkeleton />
					<Sub>{t('dev:ui.sub.page')}</Sub>
					<PageSkeleton variant="cards" count={3} />
				</Section>

				<Section title={t('dev:ui.sections.pagination')}>
					<Sub>{t('dev:ui.sub.paginationButtons')}</Sub>
					<Pagination page={page} count={12} onChange={setPage} />
					<Sub>{t('dev:ui.sub.paginationLinks')}</Sub>
					<Pagination page={1} count={3} getHref={(target) => `/dev/ui?page=${target}`} />
				</Section>

				<Section title={t('dev:ui.sections.dialogs')}>
					<Row>
						<Button variant="outlined" color="error" onClick={() => setDialog('open')}>
							{t('dev:ui.dialog.trigger')}
						</Button>
						<Button variant="outlined" onClick={() => toast.success(t('dev:ui.toasts.saved'))}>
							{t('dev:ui.toasts.success')}
						</Button>
						<Button variant="outlined" onClick={() => toast.error(t('errors:network'))}>
							{t('dev:ui.toasts.error')}
						</Button>
					</Row>
					<ConfirmDialog
						open={dialog !== 'closed'}
						loading={dialog === 'loading'}
						title={t('dev:ui.dialog.title')}
						text={t('dev:ui.dialog.text')}
						onConfirm={confirmDelete}
						onCancel={() => setDialog('closed')}
					/>
				</Section>

				<Section title={t('dev:ui.sections.card')}>
					<Card component="article" sx={{ maxWidth: 360 }}>
						<Box sx={{ aspectRatio: '16 / 10', bgcolor: 'accentSoft' }} />
						<CardContent sx={{ p: 4 }}>
							<CategoryChip category="CUSTOMER_SUPPORT" />
							<Typography variant="h3" component="h3" sx={{ mt: 3 }}>
								{t('dev:ui.card.title')}
							</Typography>
							<Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
								<Avatar memberId={SAMPLE_MEMBERS[2].id} name={SAMPLE_MEMBERS[2].name} size={24} />
								<Typography variant="meta">{t('dev:ui.card.author', { nick: 'aria' })}</Typography>
							</Stack>
							<Typography variant="body2" sx={{ mt: 2, color: 'bodySoft', whiteSpace: 'pre-line' }}>
								{t('dev:ui.card.description')}
							</Typography>
							<Divider sx={{ my: 4 }} />
							<Stack direction="row" justifyContent="space-between" alignItems="baseline" useFlexGap flexWrap="wrap" gap={2}>
								<PriceTag pricing="SUBSCRIPTION" price={29} />
								<Typography variant="meta">
									{t('dev:ui.card.likes', { count: 128 })} · {t('dev:ui.card.views', { count: 2310 })}
								</Typography>
							</Stack>
						</CardContent>
					</Card>
				</Section>
			</Box>
		</>
	);
};

DevUiPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;

export default DevUiPage;
