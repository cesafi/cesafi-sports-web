import { z } from 'zod';

export const STANDINGS_MAX_VALUE = 999;

const winLossValue = (label: 'Wins' | 'Losses') => {
  const message = `${label} must be a whole number from 0 to ${STANDINGS_MAX_VALUE}.`;
  return z
    .number({ error: message })
    .int({ error: message })
    .min(0, { error: message })
    .max(STANDINGS_MAX_VALUE, { error: message });
};

export const winsSchema = winLossValue('Wins');
export const lossesSchema = winLossValue('Losses');

export const updateTeamStandingSchema = z.strictObject({
  teamId: z.uuid({ error: 'Invalid team.' }),
  wins: winsSchema,
  losses: lossesSchema,
  expectedUpdatedAt: z.iso.datetime({ offset: true }).nullable()
});

export const standingsSeasonIdSchema = z.number().int().positive();

// Public page search params: bad values fall back to defaults instead of erroring.
export const standingsSearchParamsSchema = z.object({
  season: z.coerce.number().int().positive().optional().catch(undefined),
  category: z.coerce.number().int().positive().optional().catch(undefined)
});

export type UpdateTeamStandingInput = z.infer<typeof updateTeamStandingSchema>;
