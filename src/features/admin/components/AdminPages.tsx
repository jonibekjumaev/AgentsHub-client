import { useState } from 'react';
import NextLink from 'next/link';
import { useMutation, useQuery } from '@apollo/client';
import { Link } from '@mui/material';
import { useTranslation } from 'next-i18next';
import type { AbaiSearch, AlbiSearch, AlpiSearch, MiSearch } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { StatusChip } from '@/shared/ui/StatusChip';
import {
	AdminArticlesQuery,
	AdminBriefsQuery,
	AdminMembersQuery,
	AdminProductsQuery,
	AdminRemoveArticleMutation,
	AdminRemoveBriefMutation,
	AdminRemoveProductMutation,
	AdminUpdateArticleMutation,
	AdminUpdateBriefMutation,
	AdminUpdateMemberMutation,
	AdminUpdateProductMutation,
} from '../graphql/admin';
import { useAdminRun } from '../hooks/useAdminRun';
import {
	DEFAULT_ADMIN_LIST,
	adminVariables,
	articleAdminActions,
	briefAdminActions,
	memberAdminActions,
	productAdminActions,
	type AdminListState,
} from '../lib/admin';
import { AdminList } from './AdminList';

const member = (id: string, nick: string) => (
	<Link component={NextLink} href={`/members/${id}`} sx={{ fontWeight: 600 }}>
		@{nick}
	</Link>
);

/** /admin/members: status filter (ACTIVE / BLOCK / DELETE), search, block / unblock / delete. */
export const AdminMembers = () => {
	const { t } = useTranslation(['admin', 'common']);
	const format = useFormat();
	const [state, setState] = useState<AdminListState>(DEFAULT_ADMIN_LIST);
	const { data, loading, error, refetch } = useQuery(AdminMembersQuery, { variables: adminVariables<MiSearch>(state, 'memberStatus'), fetchPolicy: 'cache-and-network' });
	const [update] = useMutation(AdminUpdateMemberMutation);
	const run = useAdminRun(refetch);
	const list = data?.getAllMembersByAdmin.list ?? [];

	return (
		<AdminList
			title={t('admin:members.title')}
			subtitle={t('admin:members.subtitle')}
			statuses={['ACTIVE', 'BLOCK', 'DELETE']}
			statusLabel={(status) => t(`admin:memberStatus.${status}`)}
			state={state}
			onStateChange={setState}
			columns={[t('admin:columns.member'), t('admin:columns.type'), t('admin:columns.status'), t('admin:columns.contacts'), t('admin:columns.joined')]}
			rows={list.map((item) => ({
				id: item._id,
				title: `@${item.memberNick}`,
				actions: memberAdminActions(item.memberStatus, item.memberType),
				cells: [
					member(item._id, item.memberNick),
					t(`common:enums.MemberType.${item.memberType}`),
					t(`admin:memberStatus.${item.memberStatus}`),
					[item.memberPhone, item.memberEmail].filter(Boolean).join(' · '),
					format.date(item.createdAt),
				],
			}))}
			total={data?.getAllMembersByAdmin.metaCounter?.[0]?.total ?? 0}
			loading={loading}
			error={error}
			onRetry={() => void refetch()}
			perform={(row, action) => {
				const memberStatus = action === 'block' ? 'BLOCK' : action === 'unblock' ? 'ACTIVE' : 'DELETE';
				return run(row.title, action, () => update({ variables: { input: { _id: row.id, memberStatus } } }));
			}}
		/>
	);
};

/** /admin/agents: every status incl. PAUSED and DELETE; pause / resume / delete / remove (D-28, D-29). */
export const AdminAgents = () => {
	const { t } = useTranslation(['admin', 'common']);
	const format = useFormat();
	const [state, setState] = useState<AdminListState>(DEFAULT_ADMIN_LIST);
	// ALPISearch has the marketplace filters; `text` is one of them (§3.3).
	const { data, loading, error, refetch } = useQuery(AdminProductsQuery, { variables: adminVariables<AlpiSearch>(state, 'productStatus'), fetchPolicy: 'cache-and-network' });
	const [update] = useMutation(AdminUpdateProductMutation);
	const [remove] = useMutation(AdminRemoveProductMutation);
	const run = useAdminRun(refetch);
	const list = data?.getAllProductsByAdmin.list ?? [];

	return (
		<AdminList
			title={t('admin:agents.title')}
			subtitle={t('admin:agents.subtitle')}
			statuses={['ACTIVE', 'PAUSED', 'DELETE']}
			statusLabel={(status) => t(`common:enums.ProductStatus.${status}`)}
			state={state}
			onStateChange={setState}
			columns={[t('admin:columns.agent'), t('admin:columns.creator'), t('admin:columns.status'), t('admin:columns.category'), t('admin:columns.stats'), t('admin:columns.updated')]}
			rows={list.map((item) => ({
				id: item._id,
				title: item.productTitle,
				actions: productAdminActions(item.productStatus),
				cells: [
					item.productStatus === 'ACTIVE' ? (
						<Link key="title" component={NextLink} href={`/agents/${item._id}`}>
							{item.productTitle}
						</Link>
					) : (
						item.productTitle
					),
					item.memberData ? member(item.memberData._id, item.memberData.memberNick) : '—',
					<StatusChip key="status" kind="product" status={item.productStatus} />,
					t(`common:enums.AgentCategory.${item.productCategory}`),
					`${format.compact(item.productLikes)} · ${format.compact(item.productViews)}`,
					format.date(item.updatedAt),
				],
			}))}
			total={data?.getAllProductsByAdmin.metaCounter?.[0]?.total ?? 0}
			loading={loading}
			error={error}
			onRetry={() => void refetch()}
			perform={(row, action) => {
				if (action === 'remove') return run(row.title, action, () => remove({ variables: { productId: row.id } }));
				const productStatus = action === 'pause' ? 'PAUSED' : action === 'resume' ? 'ACTIVE' : 'DELETE';
				return run(row.title, action, () => update({ variables: { input: { _id: row.id, productStatus } } }));
			}}
		/>
	);
};

/** /admin/briefs: close / reopen / delete / remove. Reopen clears a passed deadline in the same call (D-31). */
export const AdminBriefs = () => {
	const { t } = useTranslation(['admin', 'common']);
	const format = useFormat();
	const [state, setState] = useState<AdminListState>(DEFAULT_ADMIN_LIST);
	const { data, loading, error, refetch } = useQuery(AdminBriefsQuery, { variables: adminVariables<AlbiSearch>(state, 'briefStatus'), fetchPolicy: 'cache-and-network' });
	const [update] = useMutation(AdminUpdateBriefMutation);
	const [remove] = useMutation(AdminRemoveBriefMutation);
	const run = useAdminRun(refetch);
	const list = data?.getAllBriefsByAdmin.list ?? [];

	return (
		<AdminList
			title={t('admin:briefs.title')}
			subtitle={t('admin:briefs.subtitle')}
			statuses={['OPEN', 'CLOSED', 'DELETE']}
			statusLabel={(status) => t(`common:enums.BriefStatus.${status}`)}
			state={state}
			onStateChange={setState}
			columns={[t('admin:columns.brief'), t('admin:columns.author'), t('admin:columns.status'), t('admin:columns.category'), t('admin:columns.deadline'), t('admin:columns.created')]}
			rows={list.map((item) => ({
				id: item._id,
				title: item.briefTitle,
				actions: briefAdminActions(item.briefStatus),
				cells: [
					item.briefStatus === 'DELETE' ? (
						item.briefTitle
					) : (
						<Link key="title" component={NextLink} href={`/briefs/${item._id}`}>
							{item.briefTitle}
						</Link>
					),
					item.memberData ? member(item.memberData._id, item.memberData.memberNick) : '—',
					<StatusChip key="status" kind="brief" status={item.briefStatus} />,
					t(`common:enums.AgentCategory.${item.briefCategory}`),
					item.briefDeadline ? format.date(item.briefDeadline) : '—',
					format.date(item.createdAt),
				],
			}))}
			total={data?.getAllBriefsByAdmin.metaCounter?.[0]?.total ?? 0}
			loading={loading}
			error={error}
			onRetry={() => void refetch()}
			perform={(row, action) => {
				if (action === 'remove') return run(row.title, action, () => remove({ variables: { briefId: row.id } }));
				const item = list.find((brief) => brief._id === row.id);
				const passed = Boolean(item?.briefDeadline && new Date(item.briefDeadline).getTime() < Date.now());
				const briefStatus = action === 'close' ? 'CLOSED' : action === 'reopen' ? 'OPEN' : 'DELETE';
				return run(row.title, action, () =>
					update({ variables: { input: { _id: row.id, briefStatus, ...(action === 'reopen' && passed && { briefDeadline: null }) } } }),
				);
			}}
		/>
	);
};

/** /admin/articles: delete, then remove permanently (D-28). No text search in ABAISearch. */
export const AdminArticles = () => {
	const { t } = useTranslation(['admin', 'community']);
	const format = useFormat();
	const [state, setState] = useState<AdminListState>(DEFAULT_ADMIN_LIST);
	const { data, loading, error, refetch } = useQuery(AdminArticlesQuery, {
		variables: adminVariables<AbaiSearch>(state, 'articleStatus', false),
		fetchPolicy: 'cache-and-network',
	});
	const [update] = useMutation(AdminUpdateArticleMutation);
	const [remove] = useMutation(AdminRemoveArticleMutation);
	const run = useAdminRun(refetch);
	const list = data?.getAllBoardArticlesByAdmin.list ?? [];

	return (
		<AdminList
			title={t('admin:articles.title')}
			subtitle={t('admin:articles.subtitle')}
			statuses={['ACTIVE', 'DELETE']}
			statusLabel={(status) => t(`admin:articleStatus.${status}`)}
			withSearch={false}
			state={state}
			onStateChange={setState}
			columns={[t('admin:columns.article'), t('admin:columns.author'), t('admin:columns.status'), t('admin:columns.category'), t('admin:columns.created')]}
			rows={list.map((item) => ({
				id: item._id,
				title: item.articleTitle,
				actions: articleAdminActions(item.articleStatus),
				cells: [
					item.articleStatus === 'ACTIVE' ? (
						<Link key="title" component={NextLink} href={`/community/${item._id}`}>
							{item.articleTitle}
						</Link>
					) : (
						item.articleTitle
					),
					item.memberData ? member(item.memberData._id, item.memberData.memberNick) : '—',
					t(`admin:articleStatus.${item.articleStatus}`),
					t(`community:categories.${item.articleCategory}`),
					format.date(item.createdAt),
				],
			}))}
			total={data?.getAllBoardArticlesByAdmin.metaCounter?.[0]?.total ?? 0}
			loading={loading}
			error={error}
			onRetry={() => void refetch()}
			perform={(row, action) =>
				action === 'remove'
					? run(row.title, action, () => remove({ variables: { articleId: row.id } }))
					: run(row.title, action, () => update({ variables: { input: { _id: row.id, articleStatus: 'DELETE' } } }))
			}
		/>
	);
};
