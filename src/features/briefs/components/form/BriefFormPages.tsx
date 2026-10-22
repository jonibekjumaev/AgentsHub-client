import type { ReactNode } from 'react';
import NextLink from 'next/link';
import { useQuery } from '@apollo/client';
import { Box, Link, Skeleton, Stack, Typography } from '@mui/material';
import { LockOutlined as LockOutlinedIcon, SearchOff as SearchOffIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { BriefStatus } from '@/gql/enums';
import { Seo } from '@/shared/layout/Seo';
import { ErrorCode, getErrorCode } from '@/shared/lib/errors';
import { ErrorState } from '@/shared/ui/ErrorState';
import { StatusPage } from '@/shared/ui/StatusPage';
import { radiusPx } from '@/theme/tokens';
import { OwnerBriefQuery } from '../../graphql/myBriefs';
import { EMPTY_BRIEF_FORM, fromBrief } from '../../lib/briefForm';
import { isObjectId } from '../../lib/detail';
import { MY_BRIEFS_PATH } from '../../lib/myBriefs';
import { BriefForm } from './BriefForm';

const PageHeader = ({ current, title, subtitle }: { current: string; title: string; subtitle: string }) => {
	const { t } = useTranslation('briefs');
	return (
		<Box sx={{ mb: 6 }}>
			<Box component="nav" aria-label={t('briefs:detail.breadcrumb')} sx={{ fontSize: 13, color: 'muted', mb: 3 }}>
				<Box component="ol" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, m: 0, p: 0, listStyle: 'none' }}>
					<li>
						<Link component={NextLink} href={MY_BRIEFS_PATH} sx={{ color: 'muted', fontWeight: 500 }}>
							{t('briefs:mine.title')}
						</Link>
					</li>
					<li aria-hidden="true">/</li>
					<Box component="li" aria-current="page" sx={{ color: 'ink', fontWeight: 600, overflowWrap: 'anywhere' }}>
						{current}
					</Box>
				</Box>
			</Box>
			<Typography variant="h1">{title}</Typography>
			<Typography sx={{ mt: 1.5, color: 'muted' }}>{subtitle}</Typography>
		</Box>
	);
};

/** Missing, deleted, malformed id or not yours: the same 404 as a wrong role gets. */
export const BriefNotFound = () => {
	const { t } = useTranslation(['common', 'briefs']);
	return (
		<>
			<Seo title={t('common:errorPages.notFound.title')} noindex />
			<StatusPage
				code="404"
				icon={<SearchOffIcon />}
				title={t('common:errorPages.notFound.title')}
				text={t('common:errorPages.notFound.text')}
				action={{ label: t('briefs:form.backToList'), href: MY_BRIEFS_PATH }}
			/>
		</>
	);
};

const Frame = ({ children }: { children: ReactNode }) => <Box sx={{ maxWidth: 1100 }}>{children}</Box>;

/** /dashboard/briefs/new */
export const NewBrief = () => {
	const { t } = useTranslation('briefs');
	return (
		<Frame>
			<Seo title={t('briefs:form.newTitle')} noindex />
			<PageHeader current={t('briefs:form.newCrumb')} title={t('briefs:form.newTitle')} subtitle={t('briefs:form.newSubtitle')} />
			<BriefForm mode="create" initialValues={EMPTY_BRIEF_FORM} />
		</Frame>
	);
};

/**
 * /dashboard/briefs/[id]/edit. getBrief returns OPEN and CLOSED briefs to everyone, so ownership is
 * checked on memberId: not yours → 404. A CLOSED brief can be edited (§3.7).
 */
export const EditBrief = ({ briefId }: { briefId: string }) => {
	const { t } = useTranslation('briefs');
	const { me } = useAuth();
	const validId = isObjectId(briefId);
	const { data, loading, error, refetch } = useQuery(OwnerBriefQuery, {
		variables: { briefId },
		skip: !validId,
		// Always the stored values: an edit must not start from a stale cache.
		fetchPolicy: 'network-only',
	});

	if (!validId) return <BriefNotFound />;
	if (loading && !data) {
		return (
			<Frame>
				<Stack spacing={4} role="status" aria-busy="true" aria-label={t('briefs:form.loading')}>
					<Skeleton variant="text" width="40%" sx={{ fontSize: 32 }} aria-hidden="true" />
					<Skeleton variant="rounded" height={420} aria-hidden="true" />
				</Stack>
			</Frame>
		);
	}
	if (error && !data) {
		const code = getErrorCode(error);
		if (code === ErrorCode.NotFound || code === ErrorCode.BadRequest) return <BriefNotFound />;
		return <ErrorState error={error} title={t('briefs:form.errors.loadFailed')} onRetry={() => void refetch()} />;
	}

	const brief = data?.getBrief;
	if (!brief || !me || brief.memberId !== me._id || brief.briefStatus === BriefStatus.Delete) return <BriefNotFound />;

	return (
		<Frame>
			<Seo title={t('briefs:form.editTitle', { title: brief.briefTitle })} noindex />
			<PageHeader
				current={brief.briefTitle}
				title={t('briefs:form.editTitle', { title: brief.briefTitle })}
				subtitle={t('briefs:form.editSubtitle')}
			/>
			{brief.briefStatus === BriefStatus.Closed && (
				<Stack
					direction="row"
					spacing={3}
					sx={{ mb: 6, p: 4, borderRadius: radiusPx.md, bgcolor: 'neutralSoft', color: 'bodySoft', alignItems: 'flex-start' }}
				>
					<LockOutlinedIcon aria-hidden="true" fontSize="small" sx={{ mt: 0.25 }} />
					<Typography variant="body2" sx={{ color: 'inherit' }}>
						{t('briefs:form.closedNote')}
					</Typography>
				</Stack>
			)}
			{/* key: a different brief (or a fresh load) starts a fresh form. */}
			<BriefForm key={`${brief._id}-${brief.updatedAt}`} mode="edit" briefId={brief._id} initialValues={fromBrief(brief)} />
		</Frame>
	);
};
