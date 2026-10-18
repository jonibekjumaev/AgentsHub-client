import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AuthSwitchLink, LoginForm } from '@/features/auth';
import { AuthLayout, Seo, type NextPageWithLayout } from '@/shared/layout';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common', 'auth', 'errors'])),
	},
});

const LoginPage: NextPageWithLayout = () => {
	const { t } = useTranslation('auth');

	return (
		<>
			<Seo title={t('auth:login.metaTitle')} noindex />
			<LoginForm />
		</>
	);
};

LoginPage.getLayout = (page) => (
	<AuthLayout headerAction={<AuthSwitchLink to="signup" promptKey="auth:login.headerPrompt" linkKey="auth:login.headerLink" />}>
		{page}
	</AuthLayout>
);

export default LoginPage;
