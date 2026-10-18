import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AuthSwitchLink, SignupForm } from '@/features/auth';
import { AuthLayout, Seo, type NextPageWithLayout } from '@/shared/layout';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common', 'auth', 'errors'])),
	},
});

const SignupPage: NextPageWithLayout = () => {
	const { t } = useTranslation('auth');

	return (
		<>
			<Seo title={t('auth:signup.metaTitle')} noindex />
			<SignupForm />
		</>
	);
};

SignupPage.getLayout = (page) => (
	<AuthLayout headerAction={<AuthSwitchLink to="login" promptKey="auth:signup.headerPrompt" linkKey="auth:signup.headerLink" />}>
		{page}
	</AuthLayout>
);

export default SignupPage;
