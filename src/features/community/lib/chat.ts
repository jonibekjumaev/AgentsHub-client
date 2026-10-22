/**
 * Community chat protocol (FRONTEND_MIGRATION §3.11, D-19): a raw WebSocket, JSON frames with `event`.
 * Parsing is defensive: an unknown or malformed frame is ignored, never shown.
 */
export const CHAT_MESSAGE_MAX = 500;
export const CHAT_COOLDOWN_MS = 1000;
/** Messages kept on screen; older ones scroll away. */
export const CHAT_HISTORY_MAX = 100;

export type ChatMember = { _id: string; memberNick: string; memberImage?: string | null; memberType?: string };
export type ChatMessage = { text: string; memberData: ChatMember | null };

export type ChatFrame =
	| { event: 'getMessages'; list: ChatMessage[] }
	| { event: 'message'; message: ChatMessage }
	| { event: 'info'; totalClients: number }
	| { event: 'error'; message: string };

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const toMember = (value: unknown): ChatMember | null => {
	if (!isObject(value) || typeof value._id !== 'string' || typeof value.memberNick !== 'string') return null;
	return {
		_id: value._id,
		memberNick: value.memberNick,
		memberImage: typeof value.memberImage === 'string' ? value.memberImage : null,
		memberType: typeof value.memberType === 'string' ? value.memberType : undefined,
	};
};

const toMessage = (value: unknown): ChatMessage | null =>
	isObject(value) && typeof value.text === 'string' ? { text: value.text, memberData: toMember(value.memberData) } : null;

export const parseChatFrame = (raw: unknown): ChatFrame | null => {
	let data: unknown;
	try {
		data = typeof raw === 'string' ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
	if (!isObject(data)) return null;
	switch (data.event) {
		case 'getMessages':
			return { event: 'getMessages', list: Array.isArray(data.list) ? data.list.map(toMessage).filter((item): item is ChatMessage => item !== null) : [] };
		case 'message': {
			const message = toMessage(data);
			return message ? { event: 'message', message } : null;
		}
		case 'info':
			return typeof data.totalClients === 'number' ? { event: 'info', totalClients: data.totalClients } : null;
		case 'error':
			return typeof data.message === 'string' ? { event: 'error', message: data.message } : null;
		default:
			return null;
	}
};

/** The server's error messages, mapped to i18n keys (never shown raw). */
export const chatErrorKey = (message: string): string => {
	if (message.startsWith('You are not authenticated')) return 'community:chat.errors.guest';
	if (message.startsWith('Message must be text')) return 'community:chat.errors.length';
	if (message.startsWith('You can send at most')) return 'community:chat.errors.rate';
	return 'community:chat.errors.unknown';
};

export const chatUrl = (base: string, token: string | null): string =>
	token ? `${base.replace(/\/+$/, '')}?${new URLSearchParams({ token })}` : base.replace(/\/+$/, '');
