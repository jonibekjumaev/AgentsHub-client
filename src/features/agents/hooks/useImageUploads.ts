import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import type { UploadProgress } from '@/apollo/uploadFetch';
import { toErrorKey, type ErrorKey } from '@/shared/lib/errors';
import { mediaUrl } from '@/shared/lib/media';
import { UploadAgentImageMutation } from '../graphql/agentForm';
import { IMAGES_MAX } from '../lib/agentForm';
import { checkImageFiles, type ImageRejection } from '../lib/imageFiles';

export type ImageItem = {
	key: string;
	status: 'done' | 'uploading' | 'error';
	/** The stored path once uploaded (what productImages holds). */
	path: string | null;
	/** What the tile shows: the local file while it uploads, the API URL for stored images. */
	preview: string;
	/** 0–100. */
	progress: number;
	errorKey?: ErrorKey;
	file?: File;
};

let nextKey = 0;
const newKey = () => `image-${(nextKey += 1)}`;

const fromPath = (path: string): ImageItem => ({ key: newKey(), status: 'done', path, preview: mediaUrl(path) ?? '', progress: 100 });

/**
 * The image list of AgentForm. Every accepted file uploads at once in its own request
 * (imageUploader), so each tile has its own progress, error and retry, and removing a tile cancels
 * its upload. `onPathsChange` receives the uploaded paths in display order (first = cover) after
 * every user change; the form stores them in productImages.
 */
export const useImageUploads = (initialPaths: readonly string[], onPathsChange: (paths: string[]) => void) => {
	const [items, setItems] = useState<ImageItem[]>(() => initialPaths.map(fromPath));
	const [rejected, setRejected] = useState<ImageRejection[]>([]);
	const [upload] = useMutation(UploadAgentImageMutation);
	const controllers = useRef(new Map<string, AbortController>());
	const objectUrls = useRef(new Set<string>());
	const changed = useRef(false);

	// Report paths after the state settles, only for changes the user made (not the initial list).
	useEffect(() => {
		if (!changed.current) return;
		changed.current = false;
		onPathsChange(items.filter((item) => item.status === 'done' && item.path).map((item) => item.path as string));
	}, [items, onPathsChange]);

	const update = useCallback((recipe: (current: ImageItem[]) => ImageItem[]) => {
		changed.current = true;
		setItems(recipe);
	}, []);

	const patch = useCallback(
		(key: string, values: Partial<ImageItem>) => update((current) => current.map((item) => (item.key === key ? { ...item, ...values } : item))),
		[update],
	);

	const start = useCallback(
		async (key: string, file: File) => {
			const controller = new AbortController();
			controllers.current.set(key, controller);
			try {
				const { data } = await upload({
					variables: { file },
					context: {
						fetchOptions: {
							signal: controller.signal,
							onUploadProgress: ({ loaded, total }: UploadProgress) => patch(key, { progress: Math.round((loaded / total) * 100) }),
						},
					},
				});
				if (!data) throw new Error('Upload returned no path.');
				patch(key, { status: 'done', path: data.imageUploader, progress: 100, file: undefined });
			} catch (error) {
				// Removed while uploading: the tile is gone, nothing to report.
				if (controller.signal.aborted) return;
				patch(key, { status: 'error', errorKey: toErrorKey(error), progress: 0 });
			} finally {
				controllers.current.delete(key);
			}
		},
		[patch, upload],
	);

	/** Checks the picked files first; only accepted ones are uploaded (rejected ones are listed). */
	const addFiles = useCallback(
		(files: readonly File[]) => {
			const { accepted, rejected: refused } = checkImageFiles(files, IMAGES_MAX - items.length);
			setRejected(refused);
			if (accepted.length === 0) return;

			const added = accepted.map((file) => {
				const preview = URL.createObjectURL(file);
				objectUrls.current.add(preview);
				return { key: newKey(), status: 'uploading' as const, path: null, preview, progress: 0, file };
			});
			update((current) => [...current, ...added]);
			added.forEach((item) => void start(item.key, item.file));
		},
		[items.length, start, update],
	);

	const retry = useCallback(
		(key: string) => {
			const item = items.find((candidate) => candidate.key === key);
			if (!item?.file) return;
			patch(key, { status: 'uploading', progress: 0, errorKey: undefined });
			void start(key, item.file);
		},
		[items, patch, start],
	);

	const remove = useCallback(
		(key: string) => {
			controllers.current.get(key)?.abort();
			const preview = items.find((item) => item.key === key)?.preview;
			if (preview && objectUrls.current.delete(preview)) URL.revokeObjectURL(preview);
			update((current) => current.filter((item) => item.key !== key));
		},
		[items, update],
	);

	/** Moves an image to another position (0 = cover). */
	const move = useCallback(
		(from: number, to: number) => {
			update((current) => {
				if (to < 0 || to >= current.length || from === to) return current;
				const next = [...current];
				const [item] = next.splice(from, 1);
				next.splice(to, 0, item);
				return next;
			});
		},
		[update],
	);

	/** Back to a list of stored paths (e.g. after saving an edit), without reporting a change. */
	const reset = useCallback((paths: readonly string[]) => setItems(paths.map(fromPath)), []);

	// Leaving the form: stop uploads and free the local previews.
	useEffect(() => {
		const urls = objectUrls.current;
		const running = controllers.current;
		return () => {
			running.forEach((controller) => controller.abort());
			urls.forEach((url) => URL.revokeObjectURL(url));
		};
	}, []);

	return {
		items,
		rejected,
		uploading: items.some((item) => item.status === 'uploading'),
		hasErrors: items.some((item) => item.status === 'error'),
		addFiles,
		retry,
		remove,
		move,
		reset,
		clearRejected: () => setRejected([]),
	};
};
