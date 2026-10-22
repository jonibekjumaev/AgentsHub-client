import { afterEach, describe, expect, it, vi } from 'vitest';
import { uploadFetch } from './uploadFetch';

/** A scripted XMLHttpRequest: the test drives progress and the response. */
class FakeXhr {
	static last: FakeXhr;
	upload: { onprogress: ((event: { lengthComputable: boolean; loaded: number; total: number }) => void) | null } = { onprogress: null };
	onload: (() => void) | null = null;
	onerror: (() => void) | null = null;
	onabort: (() => void) | null = null;
	status = 0;
	statusText = '';
	responseText = '';
	method = '';
	url = '';
	headers: Record<string, string> = {};
	body: unknown;
	aborted = false;

	constructor() {
		FakeXhr.last = this;
	}
	open(method: string, url: string) {
		this.method = method;
		this.url = url;
	}
	setRequestHeader(key: string, value: string) {
		this.headers[key] = value;
	}
	send(body: unknown) {
		this.body = body;
	}
	abort() {
		this.aborted = true;
		this.onabort?.();
	}
	getAllResponseHeaders() {
		return 'content-type: application/json\r\n';
	}
}

describe('uploadFetch', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('uses plain fetch when no progress is asked for', async () => {
		const fetchMock = vi.fn(async () => new Response('{}'));
		vi.stubGlobal('fetch', fetchMock);
		await uploadFetch('http://api.test/graphql', { method: 'POST', body: 'x' });
		expect(fetchMock).toHaveBeenCalledWith('http://api.test/graphql', { method: 'POST', body: 'x' });
	});

	it('uploads through XHR, reporting progress, with the headers kept', async () => {
		vi.stubGlobal('XMLHttpRequest', FakeXhr);
		const onUploadProgress = vi.fn();
		const body = new FormData();

		const pending = uploadFetch('http://api.test/graphql', {
			method: 'POST',
			headers: { 'Apollo-Require-Preflight': 'true' },
			body,
			onUploadProgress,
		} as RequestInit);
		const xhr = FakeXhr.last;
		expect(xhr.method).toBe('POST');
		expect(xhr.headers['apollo-require-preflight']).toBe('true');
		expect(xhr.body).toBe(body);

		xhr.upload.onprogress?.({ lengthComputable: true, loaded: 50, total: 200 });
		expect(onUploadProgress).toHaveBeenCalledWith({ loaded: 50, total: 200 });

		xhr.status = 200;
		xhr.responseText = '{"data":{"imageUploader":"uploads/product/a.png"}}';
		xhr.onload?.();
		const response = await pending;
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toBe('application/json');
		expect(await response.json()).toEqual({ data: { imageUploader: 'uploads/product/a.png' } });
	});

	it('aborts the XHR with the signal and rejects like fetch', async () => {
		vi.stubGlobal('XMLHttpRequest', FakeXhr);
		const controller = new AbortController();
		const pending = uploadFetch('http://api.test/graphql', { signal: controller.signal, onUploadProgress: vi.fn() } as RequestInit);

		controller.abort();
		await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
		expect(FakeXhr.last.aborted).toBe(true);
	});

	it('rejects a network failure as a TypeError, like fetch', async () => {
		vi.stubGlobal('XMLHttpRequest', FakeXhr);
		const pending = uploadFetch('http://api.test/graphql', { onUploadProgress: vi.fn() } as RequestInit);
		FakeXhr.last.onerror?.();
		await expect(pending).rejects.toBeInstanceOf(TypeError);
	});
});
