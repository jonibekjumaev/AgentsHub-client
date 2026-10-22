import type { GetServerSideProps } from 'next';

/** /admin has no page of its own: the first admin section. */
export const getServerSideProps: GetServerSideProps = async ({ locale, defaultLocale }) => ({
	redirect: { destination: `${locale && locale !== defaultLocale ? `/${locale}` : ''}/admin/members`, permanent: false },
});

const AdminIndex = () => null;

export default AdminIndex;
