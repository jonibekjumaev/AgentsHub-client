import { useState } from 'react';
import type { FormEvent } from 'react';
import type { GetStaticProps } from 'next';
import Head from 'next/head';
import { Box, Button, Card, CardContent, FormControl, FormLabel, OutlinedInput, Stack, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { RequireRole, useAuth } from '@/auth';
import { env } from '@/config/env';
import { useLogin } from '@/features/auth';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
	if (env.isProduction) return { notFound: true };

	return {
		props: {
			...(await serverSideTranslations(locale ?? 'en', ['common', 'dev', 'errors'])),
		},
	};
};

const Row = ({ label, value }: { label: string; value: string }) => (
	<Stack direction="row" spacing={3} useFlexGap flexWrap="wrap">
		<Typography variant="meta" component="span" sx={{ minWidth: 120 }}>
			{label}
		</Typography>
		<Typography variant="body2" component="span" sx={{ color: 'ink', fontWeight: 700 }}>
			{value}
		</Typography>
	</Stack>
);

const DevAuthPage = () => {
	const { t } = useTranslation(['dev', 'errors']);
	const { me, status, logout } = useAuth();
	const { login, loading, errorKey } = useLogin();
	const [memberNick, setMemberNick] = useState('');
	const [memberPassword, setMemberPassword] = useState('');
	const [showCreatorBlock, setShowCreatorBlock] = useState(false);

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void login({ memberNick: memberNick.trim(), memberPassword });
	};

	return (
		<>
			<Head>
				<title>{t('dev:auth.metaTitle')}</title>
				<meta name="robots" content="noindex" />
			</Head>
			<Box component="main" sx={{ maxWidth: 720, mx: 'auto', px: { xs: 4, sm: 6 }, pt: 10, pb: 16 }}>
				<Typography variant="h1">{t('dev:auth.title')}</Typography>
				<Typography variant="meta" sx={{ mt: 2, mb: 8 }}>
					{t('dev:auth.intro')}
				</Typography>

				<Stack spacing={6}>
					<Card component="section" aria-labelledby="dev-auth-session">
						<CardContent sx={{ p: 5 }}>
							<Typography id="dev-auth-session" variant="h3" component="h2" sx={{ mb: 3 }}>
								{t('dev:auth.session')}
							</Typography>
							<Stack spacing={1.5}>
								<Row label={t('dev:auth.status')} value={status} />
								{me && (
									<>
										<Row label={t('dev:auth.nick')} value={me.memberNick} />
										<Row label={t('dev:auth.type')} value={me.memberType} />
										<Row label={t('dev:auth.memberStatus')} value={me.memberStatus} />
										<Row label={t('dev:auth.email')} value={me.memberEmail ?? '—'} />
									</>
								)}
							</Stack>
							{status === 'member' && (
								<Button variant="outlined" sx={{ mt: 4 }} onClick={() => void logout()}>
									{t('dev:auth.logout')}
								</Button>
							)}
						</CardContent>
					</Card>

					{status !== 'member' && (
						<Card component="section" aria-labelledby="dev-auth-login">
							<CardContent sx={{ p: 5 }}>
								<Typography id="dev-auth-login" variant="h3" component="h2" sx={{ mb: 4 }}>
									{t('dev:auth.login')}
								</Typography>
								<Box component="form" noValidate onSubmit={onSubmit}>
									<Stack spacing={4}>
										<FormControl>
											<FormLabel htmlFor="dev-auth-nick">{t('dev:auth.nick')}</FormLabel>
											<OutlinedInput
												id="dev-auth-nick"
												autoComplete="username"
												value={memberNick}
												onChange={(event) => setMemberNick(event.target.value)}
											/>
										</FormControl>
										<FormControl>
											<FormLabel htmlFor="dev-auth-password">{t('dev:auth.password')}</FormLabel>
											<OutlinedInput
												id="dev-auth-password"
												type="password"
												autoComplete="current-password"
												value={memberPassword}
												onChange={(event) => setMemberPassword(event.target.value)}
											/>
										</FormControl>
										{errorKey && (
											<Box
												role="alert"
												sx={{
													p: 3,
													borderRadius: 2.5,
													border: 1,
													borderColor: 'dangerSoftBorder',
													bgcolor: 'dangerSoft',
													color: 'dangerInk',
													fontWeight: 600,
												}}
											>
												{t(errorKey)}
											</Box>
										)}
										<Button type="submit" size="large" disabled={loading || !memberNick.trim() || !memberPassword}>
											{t('dev:auth.submit')}
										</Button>
									</Stack>
								</Box>
							</CardContent>
						</Card>
					)}

					<Card component="section" aria-labelledby="dev-auth-creator">
						<CardContent sx={{ p: 5 }}>
							<Typography id="dev-auth-creator" variant="h3" component="h2" sx={{ mb: 2 }}>
								{t('dev:auth.creatorBlock')}
							</Typography>
							<Typography variant="body2" sx={{ mb: 4 }}>
								{t('dev:auth.creatorHint')}
							</Typography>
							{showCreatorBlock ? (
								<RequireRole roles={['CREATOR']}>
									<Typography sx={{ color: 'success.main', fontWeight: 800 }}>{t('dev:auth.creatorOnly')}</Typography>
								</RequireRole>
							) : (
								<Button variant="soft" onClick={() => setShowCreatorBlock(true)}>
									{t('dev:auth.openCreatorBlock')}
								</Button>
							)}
						</CardContent>
					</Card>
				</Stack>
			</Box>
		</>
	);
};

export default DevAuthPage;
