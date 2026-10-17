import type { ReactNode } from 'react';
import type { GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Divider,
	FormControl,
	FormHelperText,
	FormLabel,
	OutlinedInput,
	Stack,
	Typography,
} from '@mui/material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { env } from '@/config/env';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
	if (env.isProduction) return { notFound: true };

	return {
		props: {
			...(await serverSideTranslations(locale ?? 'en', ['common', 'dev'])),
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

const statusChips = [
	{ key: 'open', bg: 'successSoft', fg: 'success.main' },
	{ key: 'closed', bg: 'neutralSoft', fg: 'bodySoft' },
	{ key: 'paused', bg: 'warningSoft', fg: 'warning.main' },
] as const;

const statusChipSx = { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' } as const;

const DevUiPage = () => {
	const { t } = useTranslation('dev');
	const { locale } = useRouter();
	const usd = (value: number) =>
		new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
	const count = (value: number) => new Intl.NumberFormat(locale).format(value);

	return (
		<>
			<Head>
				<title>{t('ui.metaTitle')}</title>
				<meta name="robots" content="noindex" />
			</Head>
			<Box component="main" sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 4, sm: 6 }, pt: 10, pb: 16 }}>
				<Typography variant="h1">{t('ui.title')}</Typography>
				<Typography variant="meta" sx={{ mt: 2, mb: 8 }}>
					{t('ui.intro')}
				</Typography>

				<Section title={t('ui.sections.logo')}>
					<Typography component="span" sx={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: 'ink' }}>
						{t('ui.logoStart')}
						<Box component="span" sx={{ color: 'primary.main' }}>
							{t('ui.logoEnd')}
						</Box>
					</Typography>
				</Section>

				<Section title={t('ui.sections.typography')}>
					<Stack spacing={3}>
						<Typography variant="h1" component="p">
							{t('ui.sample.h1')}
						</Typography>
						<Typography variant="h2" component="p">
							{t('ui.sample.h2')}
						</Typography>
						<Typography variant="h3" component="p">
							{t('ui.sample.h3')}
						</Typography>
						<Typography sx={{ whiteSpace: 'pre-line' }}>{t('ui.sample.body')}</Typography>
						<Typography variant="body2">{t('ui.sample.bodySmall')}</Typography>
						<Typography variant="meta">{t('ui.sample.meta')}</Typography>
						<Typography variant="caption">{t('ui.sample.caption')}</Typography>
						<Typography variant="overline">{t('ui.sample.overline')}</Typography>
					</Stack>
				</Section>

				<Section title={t('ui.sections.buttons')}>
					<Stack spacing={4}>
						<Stack direction="row" spacing={3} useFlexGap flexWrap="wrap">
							<Button>{t('ui.buttons.primary')}</Button>
							<Button variant="outlined">{t('ui.buttons.secondary')}</Button>
							<Button variant="soft">{t('ui.buttons.soft')}</Button>
							<Button variant="outlined" color="error">
								{t('ui.buttons.danger')}
							</Button>
							<Button variant="text">{t('ui.buttons.text')}</Button>
							<Button disabled>{t('ui.buttons.disabled')}</Button>
						</Stack>
						<Stack direction="row" spacing={3} useFlexGap flexWrap="wrap" alignItems="center">
							<Button size="small">{t('ui.buttons.small')}</Button>
							<Button size="medium">{t('ui.buttons.medium')}</Button>
							<Button size="large">{t('ui.buttons.large')}</Button>
						</Stack>
						<Stack direction="row" spacing={3} useFlexGap flexWrap="wrap" alignItems="center">
							<Button size="small" variant="outlined">
								{t('ui.buttons.small')}
							</Button>
							<Button size="medium" variant="outlined">
								{t('ui.buttons.medium')}
							</Button>
							<Button size="large" variant="outlined">
								{t('ui.buttons.large')}
							</Button>
						</Stack>
					</Stack>
				</Section>

				<Section title={t('ui.sections.inputs')}>
					<Box sx={{ display: 'grid', gap: 6, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
						<FormControl>
							<FormLabel htmlFor="dev-name">{t('ui.inputs.nameLabel')}</FormLabel>
							<OutlinedInput
								id="dev-name"
								placeholder={t('ui.inputs.namePlaceholder')}
								inputProps={{ 'aria-describedby': 'dev-name-hint' }}
							/>
							<FormHelperText id="dev-name-hint">{t('ui.inputs.nameHint')}</FormHelperText>
						</FormControl>
						<FormControl error>
							<FormLabel htmlFor="dev-price">{t('ui.inputs.priceLabel')}</FormLabel>
							<OutlinedInput
								id="dev-price"
								defaultValue="0"
								inputProps={{ 'aria-invalid': true, 'aria-describedby': 'dev-price-error', inputMode: 'decimal' }}
							/>
							<FormHelperText id="dev-price-error">{t('ui.inputs.priceError')}</FormHelperText>
						</FormControl>
					</Box>
				</Section>

				<Section title={t('ui.sections.chips')}>
					<Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
						{statusChips.map(({ key, bg, fg }) => (
							<Chip key={key} size="small" label={t(`ui.chips.${key}`)} sx={{ ...statusChipSx, bgcolor: bg, color: fg }} />
						))}
						<Chip size="small" label={t('ui.chips.category')} sx={{ bgcolor: 'accentSoft', color: 'primary.main' }} />
					</Stack>
				</Section>

				<Section title={t('ui.sections.price')}>
					<Stack direction="row" spacing={6} useFlexGap flexWrap="wrap" alignItems="baseline">
						<Typography sx={{ color: 'success.main', fontWeight: 800 }}>{t('ui.price.free')}</Typography>
						<Typography variant="mono">{usd(190)}</Typography>
						<Box>
							<Typography variant="mono">{usd(29)}</Typography>{' '}
							<Typography variant="caption">{t('ui.price.perMonth')}</Typography>
						</Box>
						<Typography sx={{ color: 'body', fontWeight: 800 }}>{t('ui.price.custom')}</Typography>
						<Typography variant="monoStat">{count(12480)}</Typography>
					</Stack>
				</Section>

				<Section title={t('ui.sections.card')}>
					<Card component="article" sx={{ maxWidth: 360 }}>
						<Box sx={{ aspectRatio: '16 / 10', bgcolor: 'accentSoft' }} />
						<CardContent sx={{ p: 4 }}>
							<Chip size="small" label={t('ui.chips.category')} sx={{ bgcolor: 'accentSoft', color: 'primary.main' }} />
							<Typography variant="h3" component="h3" sx={{ mt: 3 }}>
								{t('ui.card.title')}
							</Typography>
							<Typography variant="meta">{t('ui.card.author', { nick: 'aria' })}</Typography>
							<Typography variant="body2" sx={{ mt: 2, color: 'bodySoft', whiteSpace: 'pre-line' }}>
								{t('ui.card.description')}
							</Typography>
							<Divider sx={{ my: 4 }} />
							<Stack direction="row" justifyContent="space-between" alignItems="baseline" useFlexGap flexWrap="wrap" gap={2}>
								<Typography variant="mono">{usd(190)}</Typography>
								<Typography variant="meta">
									{t('ui.card.likes', { count: 128 })} · {t('ui.card.views', { count: 2310 })}
								</Typography>
							</Stack>
						</CardContent>
					</Card>
				</Section>
			</Box>
		</>
	);
};

export default DevUiPage;
