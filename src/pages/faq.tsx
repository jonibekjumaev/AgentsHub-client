import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { FaqPage } from '@/features/info';
import { PublicLayout, Seo, type NextPageWithLayout } from '@/shared/layout';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common', 'info'])) },
});

const Page: NextPageWithLayout = () => {
	const { t } = useTranslation('info');
	return (
		<>
			<Seo title={t('info:faq.title')} description={t('info:faq.description')} />
			<FaqPage />
		</>
	);
};

Page.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;

export default Page;
