import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { Seo } from '@/shared/layout/Seo';
import { mediaUrl } from '@/shared/lib/media';
import { MemberProfileQuery } from '../graphql/creators';

/** "Nova Labs (@nova_labs)"; description = the member's own text, one line; og:image = their photo. */
export const MemberProfileSeo = ({ memberId }: { memberId: string }) => {
	const { t } = useTranslation('creators');
	const { data } = useQuery(MemberProfileQuery, { variables: { memberId }, fetchPolicy: 'cache-only' });
	const member = data?.getMember;
	if (!member) return null;
	const name = member.memberFullName || member.memberNick;
	const description = member.memberDesc?.replace(/\s+/g, ' ').trim().slice(0, 160) || t('creators:seo.profileDescription', { nick: member.memberNick });
	return (
		<Seo
			title={t('creators:seo.profileTitle', { name, nick: member.memberNick })}
			description={description}
			image={mediaUrl(member.memberImage) ?? undefined}
			// Blocked members stay readable, but are not worth indexing.
			noindex={member.memberStatus !== 'ACTIVE'}
		/>
	);
};
