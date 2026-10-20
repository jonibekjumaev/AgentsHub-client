import { useState } from 'react';
import NextLink from 'next/link';
import { useQuery } from '@apollo/client';
import { Box, Link, Skeleton, Stack, Typography } from '@mui/material';
import { PeopleOutline as PeopleOutlineIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import type { FollowMemberFragment } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui/Avatar';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Pagination } from '@/shared/ui/Pagination';
import { radiusPx } from '@/theme/tokens';
import { FollowersQuery, FollowingsQuery } from '../graphql/follows';
import { FOLLOW_PAGE_SIZE, followersVariables, followingsVariables } from '../lib/follows';
import { FollowButton } from './FollowButton';

const memberHref = (memberId: string) => `/members/${memberId}`;

const MemberRow = ({ member }: { member: FollowMemberFragment }) => {
	const { t } = useTranslation(['follows', 'common']);
	const format = useFormat();
	const name = member.memberFullName || member.memberNick;

	return (
		<Stack
			component="li"
			direction="row"
			spacing={3}
			alignItems="center"
			sx={{ p: 4, bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: radiusPx.lg, minWidth: 0 }}
		>
			<Avatar memberId={member._id} name={name} image={member.memberImage} size={44} />
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Link component={NextLink} href={memberHref(member._id)} sx={{ color: 'ink', fontWeight: 800, overflowWrap: 'anywhere' }}>
					{name}
				</Link>
				<Typography variant="meta">
					@{member.memberNick} · {t(`common:enums.MemberType.${member.memberType}`)} ·{' '}
					{t('follows:followers', { count: member.memberFollowers, formatted: format.compact(member.memberFollowers) })}
				</Typography>
			</Box>
			<FollowButton memberId={member._id} nick={member.memberNick} size="small" />
		</Stack>
	);
};

const ListSkeleton = () => {
	const { t } = useTranslation('follows');
	return (
		<Stack spacing={2} role="status" aria-busy="true" aria-label={t('follows:loading')}>
			{[0, 1, 2].map((index) => (
				<Skeleton key={index} variant="rounded" height={76} aria-hidden="true" />
			))}
		</Stack>
	);
};

/** A profile's Followers or Following tab. Paged with buttons: the page is not in the URL. */
export const FollowList = ({ memberId, kind }: { memberId: string; kind: 'followers' | 'following' }) => {
	const { t } = useTranslation('follows');
	const [page, setPage] = useState(1);
	const followers = useQuery(FollowersQuery, { variables: followersVariables(memberId, page), skip: kind !== 'followers' });
	const followings = useQuery(FollowingsQuery, { variables: followingsVariables(memberId, page), skip: kind !== 'following' });
	const query = kind === 'followers' ? followers : followings;

	const members: FollowMemberFragment[] =
		kind === 'followers'
			? (followers.data?.getMemberFollowers.list ?? []).flatMap((item) => (item.followerData ? [item.followerData] : []))
			: (followings.data?.getMemberFollowings.list ?? []).flatMap((item) => (item.followingData ? [item.followingData] : []));
	const total =
		(kind === 'followers' ? followers.data?.getMemberFollowers.metaCounter : followings.data?.getMemberFollowings.metaCounter)?.[0]
			?.total ?? 0;

	if (query.loading && !query.data) return <ListSkeleton />;
	if (query.error && !query.data) {
		return <ErrorState error={query.error} title={t('follows:errorTitle')} onRetry={() => void query.refetch()} />;
	}
	if (members.length === 0) {
		return <EmptyState icon={<PeopleOutlineIcon />} title={t(`follows:empty.${kind}`)} headingLevel="h3" />;
	}

	return (
		<Stack spacing={4}>
			<Box component="ul" aria-label={t(`follows:listLabel.${kind}`)} sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
				{members.map((member) => (
					<MemberRow key={member._id} member={member} />
				))}
			</Box>
			<Pagination page={page} count={Math.ceil(total / FOLLOW_PAGE_SIZE)} onChange={setPage} />
		</Stack>
	);
};
