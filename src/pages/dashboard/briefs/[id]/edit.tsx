import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { EditBrief } from '@/features/briefs';
import { DashboardLayout, type NextPageWithLayout } from '@/shared/layout';

type EditBriefPageProps = { briefId: string };

// Translations and the id only: the brief is loaded in the browser after auth, with the owner check (rule 11).
export const getServerSideProps: GetServerSideProps<EditBriefPageProps> = async ({ params, locale }) => ({
	props: {
		briefId: typeof params?.id === 'string' ? params.id : '',
		...(await serverSideTranslations(locale ?? 'en', ['common', 'briefs', 'dashboard', 'errors'])),
	},
});

const EditBriefPage: NextPageWithLayout<EditBriefPageProps> = ({ briefId }) => <EditBrief briefId={briefId} />;

EditBriefPage.getLayout = (page) => <DashboardLayout roles={['USER']}>{page}</DashboardLayout>;

export default EditBriefPage;
