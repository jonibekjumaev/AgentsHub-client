import NextLink from 'next/link';
import { Box, Button, GlobalStyles, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import { agentsHref, parseAgentFilters } from '@/features/agents';
import { AgentCategory } from '@/gql/enums';
import { colors, fonts, home } from '@/theme/tokens';
import { focusRingSx, noMotionSx } from '../kit';

/**
 * The six tiles of "Watch agents do the work". Every demo is illustrative (the intro says so) and every
 * loop is a CSS keyframe on transform / opacity only. Under prefers-reduced-motion each one shows its
 * final state.
 */

const tileSx = {
	display: 'flex',
	flexDirection: 'column',
	gap: 4,
	p: { xs: 6, sm: 7 },
	borderRadius: home.radius.card,
	bgcolor: 'surface',
	border: 1,
	borderColor: 'border',
	minWidth: 0,
} as const;

const titleSx = { fontSize: { xs: 21, sm: 24 }, lineHeight: 1.15, fontWeight: 700, letterSpacing: '-0.02em' } as const;

/* ---------- Support chat (2×2, dark) ---------- */

/** A message appears at `from`% of the 12s loop and stays until 94%. */
const message = (from: number) => keyframes`
	0%, ${from - 4}% { opacity: 0; transform: translateY(8px); }
	${from}%, 94% { opacity: 1; transform: none; }
	100% { opacity: 0; }
`;
const typing = keyframes`
	0%, 42% { opacity: 0; }
	45%, 54% { opacity: 1; }
	56%, 100% { opacity: 0; }
`;
const bounce = keyframes`
	0%, 100% { transform: translateY(0); opacity: 0.5; }
	50% { transform: translateY(-3px); opacity: 1; }
`;

const bubbleSx = (side: 'user' | 'agent') =>
	({
		alignSelf: side === 'user' ? 'flex-end' : 'flex-start',
		maxWidth: side === 'user' ? '78%' : '82%',
		px: 3.5,
		py: 2.5,
		borderRadius: side === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
		bgcolor: side === 'user' ? colors.white : home.chatAgent,
		color: side === 'user' ? 'ink' : colors.white,
		fontSize: 15,
		lineHeight: 1.4,
	}) as const;

const loopSx = (frames: ReturnType<typeof keyframes>) =>
	({ animation: `${frames} 12s ease infinite`, ...noMotionSx }) as const;

export const SupportChatTile = () => {
	const { t } = useTranslation('home');
	const supportHref = agentsHref({ ...parseAgentFilters({}), categories: [AgentCategory.CustomerSupport] });
	return (
		<Box
			component="article"
			sx={{
				...tileSx,
				gridColumn: { md: 'span 2' },
				gridRow: { md: 'span 2' },
				position: 'relative',
				overflow: 'hidden',
				gap: 5.5,
				p: { xs: 6, sm: 8 },
				borderRadius: home.radius.panel,
				bgcolor: home.night,
				border: 0,
				color: colors.white,
			}}
		>
			<Box
				aria-hidden="true"
				sx={{ position: 'absolute', right: -120, top: -120, width: 380, height: 380, borderRadius: '50%', bgcolor: home.nightGlow, filter: 'blur(70px)' }}
			/>
			<Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 2 }}>
				<Typography variant="h3" sx={{ ...titleSx, fontSize: { xs: 25, sm: 30 }, color: colors.white }}>
					{t('home:work.chat.title')}
				</Typography>
				<Typography sx={{ maxWidth: 420, fontSize: 16, lineHeight: 1.55, color: home.nightText }}>{t('home:work.chat.text')}</Typography>
			</Box>
			<Box
				role="img"
				aria-label={t('home:work.chat.label')}
				sx={{
					position: 'relative',
					flex: '1 1 auto',
					minHeight: 280,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'flex-end',
					gap: 2.5,
					p: 5,
					borderRadius: '18px',
					bgcolor: home.nightFill,
					border: 1,
					borderColor: home.nightLine,
				}}
			>
				<Box sx={{ ...bubbleSx('user'), ...loopSx(message(6)) }}>{t('home:work.chat.m1')}</Box>
				<Box sx={{ ...bubbleSx('agent'), ...loopSx(message(20)) }}>{t('home:work.chat.m2')}</Box>
				<Box sx={{ ...bubbleSx('user'), ...loopSx(message(38)) }}>{t('home:work.chat.m3')}</Box>
				<Box sx={{ position: 'relative', alignSelf: 'flex-start', maxWidth: '82%' }}>
					<Box
						sx={{
							position: 'absolute',
							left: 0,
							bottom: 0,
							display: 'flex',
							gap: 1.25,
							px: 4,
							py: 3.25,
							borderRadius: '16px 16px 16px 4px',
							bgcolor: home.chatAgent,
							animation: `${typing} 12s ease infinite`,
							'@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 0 },
						}}
					>
						{[0, 0.15, 0.3].map((delay) => (
							<Box
								key={delay}
								component="span"
								sx={{
									width: 7,
									height: 7,
									borderRadius: '50%',
									bgcolor: colors.white,
									animation: `${bounce} 1s ease-in-out ${delay}s infinite`,
									...noMotionSx,
								}}
							/>
						))}
					</Box>
					<Box sx={{ ...bubbleSx('agent'), maxWidth: 'none', ...loopSx(message(60)) }}>{t('home:work.chat.m4')}</Box>
				</Box>
			</Box>
			<Button
				component={NextLink}
				href={supportHref}
				sx={{
					position: 'relative',
					alignSelf: 'flex-start',
					minHeight: 44,
					px: 4.5,
					bgcolor: colors.white,
					color: home.night,
					fontSize: 15,
					'&:hover': { bgcolor: home.nightTextSoft },
					...focusRingSx,
				}}
			>
				{t('home:work.chat.action')}
			</Button>
		</Box>
	);
};

/* ---------- Lead scores (2 columns) ---------- */

const grow = keyframes`
	0% { transform: scaleX(0); }
	28%, 86% { transform: scaleX(1); opacity: 1; }
	100% { transform: scaleX(1); opacity: 0; }
`;

/** Bar and number color by score band. */
export const scoreColors = (score: number): readonly [string, string] => {
	if (score >= 85) return home.scoreHot;
	if (score >= 65) return home.scoreWarm;
	if (score >= 45) return home.scoreMid;
	return home.scoreCold;
};

const LEADS = [
	{ key: 'l1', score: 92 },
	{ key: 'l2', score: 74 },
	{ key: 'l3', score: 58 },
	{ key: 'l4', score: 31 },
];

export const LeadScoresTile = () => {
	const { t } = useTranslation('home');
	return (
		<Box component="article" sx={{ ...tileSx, gridColumn: { md: 'span 2' }, gap: 4.5 }}>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 2 }}>
				<Typography variant="h3" sx={titleSx}>
					{t('home:work.leads.title')}
				</Typography>
				<Typography component="span" sx={{ fontSize: 13, color: 'muted' }}>
					{t('home:work.leads.label')}
				</Typography>
			</Box>
			<Box role="img" aria-label={t('home:work.leads.aria')} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				{LEADS.map(({ key, score }, index) => {
					const [bar, text] = scoreColors(score);
					return (
						<Box
							key={key}
							sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 2fr) 44px', alignItems: 'center', gap: 3.5 }}
						>
							<Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
								<Box component="span" sx={{ fontSize: 15, fontWeight: 600, color: 'ink' }}>
									{t(`home:work.leads.${key}.name`)}
								</Box>
								<Box component="span" sx={{ fontSize: 13, color: 'muted' }}>
									{t(`home:work.leads.${key}.biz`)}
								</Box>
							</Box>
							<Box sx={{ height: 10, borderRadius: '999px', bgcolor: home.slotEmpty, overflow: 'hidden' }}>
								<Box
									sx={{
										width: `${score}%`,
										height: '100%',
										borderRadius: '999px',
										bgcolor: bar,
										transformOrigin: 'left center',
										animation: `${grow} 7s cubic-bezier(.2,.7,.2,1) ${index * 0.25}s infinite`,
										...noMotionSx,
									}}
								/>
							</Box>
							<Box component="span" sx={{ fontSize: 15, fontWeight: 800, textAlign: 'right', color: text }}>
								{score}
							</Box>
						</Box>
					);
				})}
			</Box>
		</Box>
	);
};

/* ---------- Calendar (1 column) ---------- */

const BOOKED = [1, 3, 5, 6, 8, 9, 12, 14];

/** The indigo fill of a slot fades in and out (opacity only); the grey slot stays underneath. */
const book = keyframes`
	0%, 8% { opacity: 0; }
	16%, 90% { opacity: 1; }
	100% { opacity: 0; }
`;

export const CalendarTile = () => {
	const { t } = useTranslation('home');
	const days = t('home:work.calendar.days', { returnObjects: true }) as string[];
	return (
		<Box component="article" sx={{ ...tileSx, p: 6.5 }}>
			<Typography variant="h3" sx={{ ...titleSx, fontSize: 22 }}>
				{t('home:work.calendar.title')}
			</Typography>
			<Box
				role="img"
				aria-label={t('home:work.calendar.aria')}
				sx={{ mt: 'auto', display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 1.5 }}
			>
				{Array.from({ length: 15 }, (_, slot) => {
					const order = BOOKED.indexOf(slot);
					return (
						<Box key={slot} component="span" sx={{ position: 'relative', height: 26, borderRadius: '7px', bgcolor: home.slotEmpty, overflow: 'hidden' }}>
							{order >= 0 && (
								<Box
									component="span"
									sx={{
										position: 'absolute',
										inset: 0,
										bgcolor: 'primary.main',
										animation: `${book} 9s ease ${order * 0.45}s infinite`,
										'@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 1 },
									}}
								/>
							)}
						</Box>
					);
				})}
			</Box>
			<Box
				aria-hidden="true"
				sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 1.5, fontSize: 12, color: 'muted', textAlign: 'center' }}
			>
				{days.map((day) => (
					<span key={day}>{day}</span>
				))}
			</Box>
		</Box>
	);
};

/* ---------- Invoices (1 column, green) ---------- */

export const INVOICE_TARGET = 45;

/**
 * 0 → 45 with a registered custom property (@property, syntax <integer>), so the browser interpolates
 * the number and `counter()` prints it. Where @property is not supported the number just shows 45.
 */
const count = keyframes`
	0% { --ah-invoices: 0; }
	45%, 100% { --ah-invoices: ${INVOICE_TARGET}; }
`;

export const InvoicesTile = () => {
	const { t } = useTranslation('home');
	return (
		<Box
			component="article"
			sx={{ ...tileSx, p: 6.5, justifyContent: 'space-between', bgcolor: home.invoiceBg, borderColor: home.invoiceBorder }}
		>
			<GlobalStyles styles={{ '@property --ah-invoices': { syntax: "'<integer>'", initialValue: '0', inherits: 'false' } }} />
			<Typography variant="h3" sx={{ ...titleSx, fontSize: 22, color: home.invoiceInk }}>
				{t('home:work.invoices.title')}
			</Typography>
			<Box role="img" aria-label={t('home:work.invoices.aria', { count: INVOICE_TARGET })} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
				<Box
					component="span"
					aria-hidden="true"
					sx={{
						fontFamily: fonts.display,
						fontSize: 72,
						lineHeight: 1,
						fontWeight: 800,
						letterSpacing: '-0.04em',
						color: home.invoiceNumber,
						'--ah-invoices': INVOICE_TARGET,
						counterReset: 'ah-invoices var(--ah-invoices)',
						animation: `${count} 7s cubic-bezier(.2,.7,.2,1) infinite`,
						'&::after': { content: 'counter(ah-invoices)' },
						...noMotionSx,
					}}
				/>
				<Box component="span" aria-hidden="true" sx={{ fontSize: 15, color: home.invoiceText }}>
					{t('home:work.invoices.text')}
				</Box>
			</Box>
		</Box>
	);
};

/* ---------- Social queue (2 columns) ---------- */

/** Translating the doubled list by −50% lands exactly on the copy: a seamless loop. */
const scrollUp = keyframes`
	from { transform: translateY(0); }
	to { transform: translateY(-50%); }
`;

const POSTS = ['p1', 'p2', 'p3'];

export const SocialQueueTile = () => {
	const { t } = useTranslation('home');
	return (
		<Box component="article" sx={{ ...tileSx, gridColumn: { md: 'span 2' } }}>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 2 }}>
				<Typography variant="h3" sx={titleSx}>
					{t('home:work.queue.title')}
				</Typography>
				<Typography component="span" sx={{ fontSize: 13, color: 'muted' }}>
					{t('home:work.queue.label')}
				</Typography>
			</Box>
			<Box
				role="img"
				aria-label={t('home:work.queue.aria')}
				sx={{
					position: 'relative',
					height: 150,
					overflow: 'hidden',
					WebkitMaskImage: home.fadeY,
					maskImage: home.fadeY,
				}}
			>
				<Box sx={{ display: 'flex', flexDirection: 'column', animation: `${scrollUp} 16s linear infinite`, ...noMotionSx }}>
					{[...POSTS, ...POSTS].map((key, index) => (
						<Box
							key={`${key}-${index}`}
							aria-hidden="true"
							// margin-bottom instead of gap: both halves are then exactly the same height.
							sx={{
								mb: 2.5,
								display: 'flex',
								alignItems: 'center',
								gap: 3,
								px: 3,
								py: 2.5,
								borderRadius: '12px',
								bgcolor: 'surfaceMuted',
								border: 1,
								borderColor: 'borderSoft',
							}}
						>
							<Box
								component="span"
								sx={{ flex: 'none', px: 2.25, py: 1, borderRadius: '8px', bgcolor: home.postChip, fontSize: 12, fontWeight: 700, color: home.postChipText }}
							>
								{t(`home:work.queue.${key}.when`)}
							</Box>
							<Box component="span" sx={{ flex: '1 1 auto', minWidth: 0, fontSize: 15, color: 'ink' }}>
								{t(`home:work.queue.${key}.title`)}
							</Box>
							<Box component="span" sx={{ fontSize: 13, color: 'muted', display: { xs: 'none', sm: 'inline' } }}>
								{t(`home:work.queue.${key}.channel`)}
							</Box>
						</Box>
					))}
				</Box>
			</Box>
		</Box>
	);
};

/* ---------- Creator call to action (2 columns, dashed) ---------- */

export const CreatorCtaTile = () => {
	const { t } = useTranslation('home');
	return (
		<Box
			component="article"
			sx={{
				...tileSx,
				gridColumn: { md: 'span 2' },
				flexDirection: 'row',
				flexWrap: 'wrap',
				alignItems: 'center',
				justifyContent: 'space-between',
				gap: 5,
				bgcolor: 'ground',
				border: `1.5px dashed ${home.dashedBorder}`,
			}}
		>
			<Box sx={{ maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
				<Typography variant="h3" sx={titleSx}>
					{t('home:work.cta.title')}
				</Typography>
				<Typography sx={{ fontSize: 16, lineHeight: 1.5, color: 'bodySoft' }}>{t('home:work.cta.text')}</Typography>
			</Box>
			<Button component={NextLink} href="/signup" sx={{ minHeight: 48, px: 5.5, fontSize: 16, borderRadius: home.radius.button, ...focusRingSx }}>
				{t('home:sellAgent')}
			</Button>
		</Box>
	);
};
