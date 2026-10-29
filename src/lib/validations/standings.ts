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

export const STANDINGS_MAX_POINT_DIFF = 9999;

const pointDiffMessage = `+/− must be a whole number from -${STANDINGS_MAX_POINT_DIFF} to ${STANDINGS_MAX_POINT_DIFF}.`;
export const pointDiffSchema = z
  .number({ error: pointDiffMessage })
  .int({ error: pointDiffMessage })
  .min(-STANDINGS_MAX_POINT_DIFF, { error: pointDiffMessage })
  .max(STANDINGS_MAX_POINT_DIFF, { error: pointDiffMessage });

export const updateTeamStandingSchema = z.strictObject({
  teamId: z.uuid({ error: 'Invalid team.' }),
  wins: winsSchema,
  losses: lossesSchema,
  pointDiff: pointDiffSchema,
  expectedUpdatedAt: z.iso.datetime({ offset: true }).nullable()
});

export const standingsSeasonIdSchema = z.number().int().positive();

// countedThrough null clears the cut-off: every finished match counts.
export const updateStandingsCutoffSchema = z.strictObject({
  seasonId: z.number().int().positive(),
  sportCategoryId: z.number().int().positive(),
  countedThrough: z.iso.date({ error: 'Enter a valid date.' }).nullable()
});

// Public page search params: bad values fall back to defaults instead of erroring.
export const standingsSearchParamsSchema = z.object({
  season: z.coerce.number().int().positive().optional().catch(undefined),
  category: z.coerce.number().int().positive().optional().catch(undefined)
});

export type UpdateTeamStandingInput = z.infer<typeof updateTeamStandingSchema>;
export type UpdateStandingsCutoffInput = z.infer<typeof updateStandingsCutoffSchema>;
