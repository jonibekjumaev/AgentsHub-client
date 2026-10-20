import { useCallback, useEffect, useRef, useState } from 'react';
import { getToken, useAuth } from '@/auth';
import { env } from '@/config/env';
import { CHAT_COOLDOWN_MS, CHAT_HISTORY_MAX, chatErrorKey, chatUrl, parseChatFrame, type ChatMessage } from '../lib/chat';

export type ChatStatus = 'connecting' | 'open' | 'closed';
type KeyedMessage = ChatMessage & { key: number };

const RECONNECT_LIMIT = 5;

/**
 * One WebSocket per page view (§3.11). It reconnects when the member changes (login / logout, so the
 * socket uses the new token) and, a few times with growing delays, when the connection drops.
 */
export const useCommunityChat = () => {
	const { status: authStatus, me } = useAuth();
	const [messages, setMessages] = useState<KeyedMessage[]>([]);
	const [online, setOnline] = useState<number | null>(null);
	const [status, setStatus] = useState<ChatStatus>('connecting');
	const [errorKey, setErrorKey] = useState<string | null>(null);
	const [coolingDown, setCoolingDown] = useState(false);
	const socket = useRef<WebSocket | null>(null);
	const nextKey = useRef(0);
	const memberId = me?._id ?? null;

	useEffect(() => {
		// Wait for the session: connecting as a guest first would mean a second connection a moment later.
		if (authStatus === 'loading' || typeof WebSocket === 'undefined') return;
		let attempts = 0;
		let timer: ReturnType<typeof setTimeout> | undefined;
		let disposed = false;

		const keyed = (message: ChatMessage): KeyedMessage => ({ ...message, key: (nextKey.current += 1) });

		const connect = () => {
			setStatus('connecting');
			const ws = new WebSocket(chatUrl(env.wsUrl, getToken()));
			socket.current = ws;
			ws.onopen = () => {
				attempts = 0;
				setStatus('open');
			};
			ws.onmessage = (event) => {
				const frame = parseChatFrame(event.data);
				if (!frame) return;
				if (frame.event === 'getMessages') setMessages(frame.list.map(keyed));
				else if (frame.event === 'message') setMessages((list) => [...list, keyed(frame.message)].slice(-CHAT_HISTORY_MAX));
				else if (frame.event === 'info') setOnline(frame.totalClients);
				else setErrorKey(chatErrorKey(frame.message));
			};
			ws.onclose = () => {
				if (disposed) return;
				setStatus('closed');
				if (attempts < RECONNECT_LIMIT) {
					attempts += 1;
					timer = setTimeout(connect, 1000 * 2 ** attempts);
				}
			};
		};

		connect();
		return () => {
			disposed = true;
			clearTimeout(timer);
			socket.current?.close();
			socket.current = null;
		};
	}, [authStatus, memberId]);

	/** Sends trimmed text; the button rests for a second after (the server allows 1 message per second). */
	const send = useCallback((text: string): boolean => {
		const ws = socket.current;
		const data = text.trim();
		if (!ws || ws.readyState !== WebSocket.OPEN || !data) return false;
		setErrorKey(null);
		ws.send(JSON.stringify({ event: 'message', data }));
		setCoolingDown(true);
		setTimeout(() => setCoolingDown(false), CHAT_COOLDOWN_MS);
		return true;
	}, []);

	return { messages, online, status, errorKey, coolingDown, send, canSend: authStatus === 'member' && me?.memberStatus === 'ACTIVE' };
};
