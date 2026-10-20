import { describe, expect, it } from 'vitest';
import { chatErrorKey, chatUrl, parseChatFrame } from './chat';

describe('parseChatFrame (§3.11)', () => {
	it('reads the four events', () => {
		expect(parseChatFrame(JSON.stringify({ event: 'getMessages', list: [{ event: 'message', text: 'hi', memberData: null }] }))).toEqual({
			event: 'getMessages',
			list: [{ text: 'hi', memberData: null }],
		});
		expect(parseChatFrame(JSON.stringify({ event: 'message', text: 'yo', memberData: { _id: '1', memberNick: 'a' } }))).toMatchObject({
			event: 'message',
			message: { text: 'yo', memberData: { _id: '1', memberNick: 'a' } },
		});
		expect(parseChatFrame(JSON.stringify({ event: 'info', totalClients: 3, action: 'joined' }))).toEqual({ event: 'info', totalClients: 3 });
		expect(parseChatFrame(JSON.stringify({ event: 'error', message: 'x' }))).toEqual({ event: 'error', message: 'x' });
	});

	it('ignores junk', () => {
		expect(parseChatFrame('not json')).toBeNull();
		expect(parseChatFrame(JSON.stringify({ event: 'other' }))).toBeNull();
		expect(parseChatFrame(JSON.stringify({ event: 'message', text: 5 }))).toBeNull();
	});
});

describe('chat helpers', () => {
	it('maps server errors to keys and builds the URL', () => {
		expect(chatErrorKey('You can send at most 1 message per second!')).toBe('community:chat.errors.rate');
		expect(chatUrl('ws://localhost:3005/', 'a b')).toBe('ws://localhost:3005?token=a+b');
		expect(chatUrl('ws://localhost:3005', null)).toBe('ws://localhost:3005');
	});
});
