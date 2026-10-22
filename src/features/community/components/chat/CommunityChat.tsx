import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Box, Button, FormHelperText, Link, OutlinedInput, Stack, Typography } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { Avatar } from '@/shared/ui/Avatar';
import { radiusPx } from '@/theme/tokens';
import { useCommunityChat } from '../../hooks/useCommunityChat';
import { CHAT_MESSAGE_MAX } from '../../lib/chat';

/**
 * Public chat (D-19, §3.11). Everyone reads; signed-in ACTIVE members write. Text is rendered as text
 * nodes only. No private messages (D-08).
 */
export const CommunityChat = () => {
	const { t } = useTranslation('community');
	const { asPath } = useRouter();
	const { me } = useAuth();
	const { messages, online, status, errorKey, coolingDown, send, canSend } = useCommunityChat();
	const [text, setText] = useState('');
	const inputId = useId();
	const logRef = useRef<HTMLDivElement>(null);

	// Keep the newest message in view.
	useEffect(() => {
		const log = logRef.current;
		if (log) log.scrollTop = log.scrollHeight;
	}, [messages]);

	const onSubmit = (event: FormEvent) => {
		event.preventDefault();
		if (send(text)) setText('');
	};

	return (
		<Box
			component="section"
			aria-labelledby="community-chat"
			sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 5, bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: radiusPx.lg }}
		>
			<Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={2}>
				<Typography id="community-chat" variant="h2" sx={{ fontSize: 17 }}>
					{t('community:chat.title')}
				</Typography>
				<Typography variant="meta" component="span" role="status">
					{status === 'open'
						? online !== null && t('community:chat.online', { count: online })
						: t(status === 'connecting' ? 'community:chat.connecting' : 'community:chat.offline')}
				</Typography>
			</Stack>

			<Box
				ref={logRef}
				role="log"
				aria-live="polite"
				aria-label={t('community:chat.logLabel')}
				tabIndex={0}
				sx={{ height: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, p: 3, bgcolor: 'ground', borderRadius: radiusPx.md }}
			>
				{messages.length === 0 ? (
					<Typography variant="body2" sx={{ color: 'muted', m: 'auto' }}>
						{t('community:chat.empty')}
					</Typography>
				) : (
					messages.map((message) => {
						const nick = message.memberData?.memberNick ?? t('community:chat.guest');
						const mine = Boolean(me && message.memberData?._id === me._id);
						return (
							<Stack key={message.key} direction="row" spacing={2} sx={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '90%' }}>
								{!mine && <Avatar memberId={message.memberData?._id ?? 'guest'} name={nick} image={message.memberData?.memberImage} size={28} />}
								<Box sx={{ px: 3, py: 2, borderRadius: radiusPx.md, bgcolor: mine ? 'accentSoft' : 'surface', minWidth: 0 }}>
									{!mine && (
										<Typography variant="caption" component="p" sx={{ fontWeight: 700, color: 'ink' }}>
											@{nick}
										</Typography>
									)}
									{/* Plain text only (§3.11). */}
									<Typography variant="body2" sx={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>
										{message.text}
									</Typography>
								</Box>
							</Stack>
						);
					})
				)}
			</Box>

			{canSend ? (
				<Box component="form" onSubmit={onSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
					<Stack direction="row" spacing={2}>
						<OutlinedInput
							id={inputId}
							value={text}
							onChange={(event) => setText(event.target.value)}
							placeholder={t('community:chat.placeholder')}
							fullWidth
							inputProps={{ maxLength: CHAT_MESSAGE_MAX, 'aria-label': t('community:chat.inputLabel'), 'aria-describedby': errorKey ? `${inputId}-error` : undefined }}
							sx={{ height: 42 }}
						/>
						<Button
							type="submit"
							disabled={status !== 'open' || coolingDown || text.trim() === ''}
							aria-label={t('community:chat.send')}
							sx={{ minWidth: 0, px: 4, height: 42 }}
						>
							<SendIcon fontSize="small" />
						</Button>
					</Stack>
					{errorKey && (
						<FormHelperText id={`${inputId}-error`} error role="alert" sx={{ m: 0 }}>
							{t(errorKey, { max: CHAT_MESSAGE_MAX })}
						</FormHelperText>
					)}
				</Box>
			) : (
				<Typography variant="body2" sx={{ color: 'bodySoft' }}>
					<Link component={NextLink} href={`/login?${new URLSearchParams({ next: asPath })}`} sx={{ fontWeight: 700 }}>
						{t('community:chat.login')}
					</Link>{' '}
					{t('community:chat.loginText')}
				</Typography>
			)}
		</Box>
	);
};
