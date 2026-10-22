/**
 * `fetch` for the upload link that can report upload progress — fetch() itself can't.
 * An operation opts in with `context: { fetchOptions: { onUploadProgress } }`; apollo-upload-client
 * passes fetchOptions through to here. Everything else goes to the normal fetch.
 */

export type UploadProgress = { loaded: number; total: number };
export type UploadFetchOptions = RequestInit & { onUploadProgress?: (progress: UploadProgress) => void };

const parseHeaders = (raw: string): Headers => {
	const headers = new Headers();
	raw
		.trim()
		.split(/[\r\n]+/)
		.forEach((line) => {
			const index = line.indexOf(':');
			if (index > 0) headers.append(line.slice(0, index).trim(), line.slice(index + 1).trim());
		});
	return headers;
};

export const uploadFetch: typeof fetch = (input, init) => {
	const { onUploadProgress, ...options } = (init ?? {}) as UploadFetchOptions;
	// DOM and Node (undici) fetch typings disagree on Request; the value is passed through unchanged.
	if (!onUploadProgress) return fetch(input as Parameters<typeof fetch>[0], options);

	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open(options.method ?? 'POST', String(input));
		new Headers(options.headers).forEach((value, key) => xhr.setRequestHeader(key, value));

		xhr.upload.onprogress = (event) => {
			if (event.lengthComputable) onUploadProgress({ loaded: event.loaded, total: event.total });
		};
		xhr.onload = () =>
			resolve(new Response(xhr.responseText, { status: xhr.status, statusText: xhr.statusText, headers: parseHeaders(xhr.getAllResponseHeaders()) }));
		// Same rejection types as fetch(), so Apollo treats them as network errors / aborts.
		xhr.onerror = () => reject(new TypeError('Network request failed'));
		xhr.onabort = () => reject(new DOMException('The upload was aborted.', 'AbortError'));

		if (options.signal) {
			if (options.signal.aborted) {
				reject(new DOMException('The upload was aborted.', 'AbortError'));
				return;
			}
			options.signal.addEventListener('abort', () => xhr.abort(), { once: true });
		}
		xhr.send(options.body as XMLHttpRequestBodyInit | null);
	});
};
