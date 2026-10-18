import { useId } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { Box, Button, Link, Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import type { CreatorAgentRowFragment } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { mediaUrl } from '@/shared/lib/media';
import { PriceTag } from '@/shared/ui/PriceTag';
import { StatusChip } from '@/shared/ui/StatusChip';
import { visuallyHidden } from '@/shared/ui/visuallyHidden';
import { radiusPx } from '@/theme/tokens';
import { statusActions, type StatusAction } from '../../lib/myAgents';

export const editAgentHref = (agentId: string) => `/dashboard/agents/${agentId}/edit`;
export const previewAgentHref = (agentId: string) => `/dashboard/agents/${agentId}`;

type MyAgentsTableProps = {
	agents: CreatorAgentRowFragment[];
	/** The agent whose status request is in flight: its actions are inactive. */
	busyId: string | null;
	onAction: (agent: CreatorAgentRowFragment, action: StatusAction) => void;
};

const cellSx: SxProps<Theme> = {
	px: 4,
	py: 3.5,
	borderBottom: 1,
	borderColor: 'borderSoft',
	textAlign: 'left',
	verticalAlign: 'middle',
	whiteSpace: 'nowrap',
};

const headSx: SxProps<Theme> = {
	...cellSx,
	fontSize: 12,
	fontWeight: 800,
	letterSpacing: '0.06em',
	textTransform: 'uppercase',
	color: 'muted',
	bgcolor: 'surfaceMuted',
};

const numberSx: SxProps<Theme> = { ...cellSx, typography: 'mono', fontSize: 14, textAlign: 'right' };

const smallButtonSx: SxProps<Theme> = { height: 32, px: 3, fontSize: 13, borderRadius: radiusPx.sm };

/**
 * Dashboard.html "My agents" table. A real <table> (row/column headers for screen readers); on narrow
 * screens it scrolls sideways inside a focusable, labelled region instead of turning into cards.
 */
export const MyAgentsTable = ({ agents, busyId, onAction }: MyAgentsTableProps) => {
	const { t } = useTranslation(['dashboard', 'common']);
	const format = useFormat();
	const captionId = useId();

	return (
		<Box
			role="region"
			aria-labelledby={captionId}
			tabIndex={0}
			sx={{
				overflowX: 'auto',
				bgcolor: 'surface',
				border: 1,
				borderColor: 'border',
				borderRadius: radiusPx.lg,
				'&:focus-visible': { outline: 2, outlineStyle: 'solid', outlineColor: 'primary.main', outlineOffset: 2 },
			}}
		>
			<Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
				<Box component="caption" id={captionId} sx={visuallyHidden}>
					{t('dashboard:myAgents.table.caption')}
				</Box>
				<thead>
					<tr>
						<Box component="th" scope="col" sx={headSx}>
							{t('dashboard:myAgents.table.agent')}
						</Box>
						<Box component="th" scope="col" sx={headSx}>
							{t('dashboard:myAgents.table.status')}
						</Box>
						<Box component="th" scope="col" sx={headSx}>
							{t('dashboard:myAgents.table.price')}
						</Box>
						<Box component="th" scope="col" sx={{ ...headSx, textAlign: 'right' }}>
							{t('dashboard:myAgents.table.views')}
						</Box>
						<Box component="th" scope="col" sx={{ ...headSx, textAlign: 'right' }}>
							{t('dashboard:myAgents.table.likes')}
						</Box>
						<Box component="th" scope="col" sx={{ ...headSx, textAlign: 'right' }}>
							{t('dashboard:myAgents.table.questions')}
						</Box>
						<Box component="th" scope="col" sx={headSx}>
							{t('dashboard:myAgents.table.updated')}
						</Box>
						<Box component="th" scope="col" sx={headSx}>
							{t('dashboard:myAgents.table.actions')}
						</Box>
					</tr>
				</thead>
				<tbody>
					{agents.map((agent) => {
						const src = mediaUrl(agent.productImages[0]);
						const busy = busyId === agent._id;
						const title = agent.productTitle;
						return (
							<Box
								component="tr"
								key={agent._id}
								aria-busy={busy || undefined}
								sx={{ bgcolor: agent.productStatus === 'PAUSED' ? 'surfaceMuted' : 'surface' }}
							>
								<Box component="th" scope="row" sx={{ ...cellSx, fontWeight: 'inherit' }}>
									<Stack direction="row" spacing={3} alignItems="center">
										<Box
											sx={{
												position: 'relative',
												flex: 'none',
												width: 40,
												height: 40,
												borderRadius: radiusPx.sm,
												overflow: 'hidden',
												bgcolor: 'accentSoft',
											}}
										>
											{src && <Image src={src} alt="" fill sizes="40px" style={{ objectFit: 'cover' }} />}
										</Box>
										<Box sx={{ minWidth: 0 }}>
											<Link
												component={NextLink}
												href={previewAgentHref(agent._id)}
												sx={{ color: 'ink', fontWeight: 800, whiteSpace: 'normal', overflowWrap: 'anywhere' }}
											>
												{title}
											</Link>
											<Typography variant="caption" component="div">
												{t(`common:enums.AgentCategory.${agent.productCategory}`)}
												{agent.productStatus === 'PAUSED' && ` · ${t('dashboard:myAgents.table.hidden')}`}
											</Typography>
										</Box>
									</Stack>
								</Box>
								<Box component="td" sx={cellSx}>
									<StatusChip kind="product" status={agent.productStatus} />
								</Box>
								<Box component="td" sx={cellSx}>
									<PriceTag pricing={agent.productPricing} price={agent.productPrice} />
								</Box>
								<Box component="td" sx={numberSx}>
									{format.number(agent.productViews)}
								</Box>
								<Box component="td" sx={numberSx}>
									{format.number(agent.productLikes)}
								</Box>
								<Box component="td" sx={numberSx}>
									{format.number(agent.productComments)}
								</Box>
								<Box component="td" sx={{ ...cellSx, color: 'muted' }}>
									<time dateTime={agent.updatedAt}>{format.date(agent.updatedAt)}</time>
								</Box>
								<Box component="td" sx={cellSx}>
									<Stack direction="row" spacing={2}>
										<Button
											component={NextLink}
											href={editAgentHref(agent._id)}
											variant="outlined"
											aria-label={t('dashboard:myAgents.actions.editLabel', { title })}
											sx={smallButtonSx}
										>
											{t('dashboard:myAgents.actions.edit')}
										</Button>
										<Button
											component={NextLink}
											href={previewAgentHref(agent._id)}
											variant="outlined"
											aria-label={t('dashboard:myAgents.actions.previewLabel', { title })}
											sx={smallButtonSx}
										>
											{t('dashboard:myAgents.actions.preview')}
										</Button>
										{statusActions(agent.productStatus).map((action) => (
											<Button
												key={action}
												variant="outlined"
												disabled={busy}
												aria-label={t(`dashboard:myAgents.actions.${action}Label`, { title })}
												onClick={() => onAction(agent, action)}
												sx={{
													...smallButtonSx,
													...(action === 'delete' && { color: 'error.main' }),
													...(action === 'resume' && { color: 'primary.main', bgcolor: 'accentSoft', borderColor: 'accentBorder' }),
												}}
											>
												{t(`dashboard:myAgents.actions.${action}`)}
											</Button>
										))}
									</Stack>
								</Box>
							</Box>
						);
					})}
				</tbody>
			</Box>
		</Box>
	);
};
