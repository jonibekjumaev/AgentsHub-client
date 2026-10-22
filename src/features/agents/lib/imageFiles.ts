/**
 * Client-side checks before any upload (a rejected file is never sent). Same limits as the API:
 * - type: the browser's MIME type must be one the API accepts (libs/config.ts validMimeTypes);
 * - size: graphqlUploadExpress({ maxFileSize: uploadMaxFileSize }) — 10 000 000 bytes, decimal megabytes (D-41);
 * - count: the form keeps at most IMAGES_MAX images.
 */
export const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
export const IMAGE_ACCEPT = 'image/png,image/jpeg';
export const IMAGE_MAX_BYTES = 10_000_000;

export type ImageRejection = { name: string; reason: 'type' | 'size' | 'count' };

/** Splits picked files into the ones to upload and the ones refused (with why). `room` = free slots. */
export const checkImageFiles = (files: readonly File[], room: number): { accepted: File[]; rejected: ImageRejection[] } => {
	const accepted: File[] = [];
	const rejected: ImageRejection[] = [];
	for (const file of files) {
		if (!IMAGE_MIME_TYPES.includes(file.type)) rejected.push({ name: file.name, reason: 'type' });
		else if (file.size > IMAGE_MAX_BYTES) rejected.push({ name: file.name, reason: 'size' });
		else if (accepted.length >= room) rejected.push({ name: file.name, reason: 'count' });
		else accepted.push(file);
	}
	return { accepted, rejected };
};
