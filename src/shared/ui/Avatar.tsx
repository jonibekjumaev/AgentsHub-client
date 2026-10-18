import { Avatar as MuiAvatar } from '@mui/material';
import { mediaUrl } from '@/shared/lib/media';

/** DESIGN §3 Avatars: four soft/strong pairs, picked by a stable hash of the member id. */
export const AVATAR_PALETTES = [
	{ bgcolor: 'accentSoft', color: 'primary.main' },
	{ bgcolor: 'successSoft', color: 'success.main' },
	{ bgcolor: 'warningSoft', color: 'warning.main' },
	{ bgcolor: 'neutralSoft', color: 'body' },
] as const;

/** FNV-1a: the same id always gets the same palette, on the server and in every browser. */
export const avatarPaletteIndex = (memberId: string): number => {
	let hash = 0x811c9dc5;
	for (let i = 0; i < memberId.length; i += 1) {
		hash ^= memberId.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return (hash >>> 0) % AVATAR_PALETTES.length;
};

/** "Sarah Chen" → "SC", "aria" → "AR". */
export const initialsOf = (name: string): string => {
	const words = name.trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return '?';
	const letters = words.length > 1 ? words[0][0] + words[1][0] : Array.from(words[0]).slice(0, 2).join('');
	return letters.toUpperCase();
};

type AvatarProps = {
	memberId: string;
	/** Full name or nick; used for initials and alt text. */
	name: string;
	/** Member image path; '' or null shows initials (D-15). */
	image?: string | null;
	/** 36 header/comments, 52 creator card, 96 profile. */
	size?: number;
	/** Corner radius in px; default is a circle. Creator card 14, profile 24. */
	radius?: number;
};

export const Avatar = ({ memberId, name, image, size = 36, radius }: AvatarProps) => {
	const src = mediaUrl(image) ?? undefined;
	const palette = AVATAR_PALETTES[avatarPaletteIndex(memberId)];

	return (
		<MuiAvatar
			src={src}
			alt={name}
			// Initials read as the name, not as letters.
			{...(src ? {} : { role: 'img', 'aria-label': name })}
			data-palette={src ? undefined : avatarPaletteIndex(memberId)}
			sx={{
				width: size,
				height: size,
				borderRadius: radius === undefined ? '50%' : `${radius}px`,
				fontSize: Math.round(size / 3),
				fontWeight: 800,
				...(src ? {} : palette),
			}}
		>
			{initialsOf(name)}
		</MuiAvatar>
	);
};
