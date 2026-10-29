'use client';

import { useState, type ComponentProps } from 'react';
import Image from 'next/image';
import { Loader2, RotateCcw, Save } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  lossesSchema,
  pointDiffSchema,
  STANDINGS_MAX_POINT_DIFF,
  STANDINGS_MAX_VALUE,
  winsSchema
} from '@/lib/validations/standings';
import { formatPointDiff } from '@/lib/utils/standings-calc';
import type {
  RankedTeamStanding,
  SavedTeamStanding,
  StandingLine,
  StandingsFieldErrors,
  StandingsResult
} from '@/lib/types/standings';

type Field = 'wins' | 'losses' | 'pointDiff';
type Draft = Record<Field, string>;

interface StandingsRowProps {
  team: RankedTeamStanding;
  onSave: (values: StandingLine) => Promise<StandingsResult<SavedTeamStanding>>;
}

const FIELDS: Field[] = ['wins', 'losses', 'pointDiff'];
const SCHEMAS = { wins: winsSchema, losses: lossesSchema, pointDiff: pointDiffSchema };

// +/- is a text input so phone keyboards offer a minus sign and "+5" is not wiped by the browser.
const INPUTS: Record<Field, { label: string; props: ComponentProps<typeof Input> }> = {
  wins: { label: 'Starting wins', props: { type: 'number', inputMode: 'numeric', min: 0, max: STANDINGS_MAX_VALUE, step: 1 } },
  losses: { label: 'Starting losses', props: { type: 'number', inputMode: 'numeric', min: 0, max: STANDINGS_MAX_VALUE, step: 1 } },
  pointDiff: {
    label: 'Starting point difference',
    props: { type: 'text', maxLength: String(-STANDINGS_MAX_POINT_DIFF).length }
  }
};

// An empty field is invalid, never 0.
const clientError = (field: Field, draft: string): string | undefined => {
  const result = SCHEMAS[field].safeParse(draft.trim() === '' ? Number.NaN : Number(draft));
  return result.success ? undefined : result.error.issues[0]?.message;
};

const toDraft = ({ wins, losses, pointDiff }: StandingLine): Draft => ({
  wins: String(wins),
  losses: String(losses),
  pointDiff: String(pointDiff)
});

const formatLine = ({ wins, losses }: { wins: number; losses: number }) => `${wins}-${losses}`;

export function StandingsRow({ team, onSave }: StandingsRowProps) {
  const { starting, fromMatches } = team;
  const savedKey = `${starting.wins}|${starting.losses}|${starting.pointDiff}|${team.updatedAt}`;
  const [syncedKey, setSyncedKey] = useState(savedKey);
  const [draft, setDraft] = useState<Draft>(() => toDraft(starting));
  const [serverErrors, setServerErrors] = useState<StandingsFieldErrors>({});
  const [saving, setSaving] = useState(false);

  // Saved values changed (save, conflict reload, refetch): show the latest numbers.
  if (syncedKey !== savedKey) {
    setSyncedKey(savedKey);
    setDraft(toDraft(starting));
    setServerErrors({});
  }

  const clientErrors = Object.fromEntries(FIELDS.map((f) => [f, clientError(f, draft[f])])) as Record<
    Field,
    string | undefined
  >;
  const invalid = FIELDS.some((f) => clientErrors[f]);
  const saved = toDraft(starting);
  const dirty = FIELDS.some((f) => draft[f] !== saved[f]);
  const hasMatches = fromMatches.wins + fromMatches.losses > 0;

  const handleChange = (field: Field, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setServerErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSave = async () => {
    if (saving || invalid) return;
    setSaving(true);
    try {
      const result = await onSave({
        wins: Number(draft.wins),
        losses: Number(draft.losses),
        pointDiff: Number(draft.pointDiff)
      });
      if (!result.success && result.fieldErrors) setServerErrors(result.fieldErrors);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setDraft(toDraft(starting));
    setServerErrors({});
  };

  const renderInput = (field: Field) => {
    const errorId = `${team.teamId}-${field}-error`;
    const error = clientErrors[field] ?? serverErrors[field]?.[0];
    return (
      <div className="flex flex-col gap-1">
        <Input
          {...INPUTS[field].props}
          value={draft[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          disabled={saving}
          aria-label={`${INPUTS[field].label} for ${team.teamName}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="h-9 w-20"
        />
        {error && (
          <p id={errorId} className="text-destructive max-w-40 text-xs">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <TableRow>
      <TableCell className="w-16 px-4 text-center text-base font-semibold">
        {team.rank === null ? <span aria-label="Not ranked yet">–</span> : team.rank}
      </TableCell>
      <TableCell className="px-4">
        <div className="flex items-center gap-3">
          <Image
            src={team.school.logoUrl ?? '/img/cesafi-logo.webp'}
            alt={team.school.name}
            width={32}
            height={32}
            className="h-8 w-8 flex-shrink-0 object-contain"
          />
          <div className="min-w-0">
            <p className="truncate font-medium">{team.teamName}</p>
            <p className="text-muted-foreground truncate text-xs">{team.school.name}</p>
          </div>
        </div>
      </TableCell>
      {FIELDS.map((field) => (
        <TableCell key={field} className="px-4 align-top">
          {renderInput(field)}
        </TableCell>
      ))}
      <TableCell className="text-muted-foreground px-4 whitespace-nowrap tabular-nums">
        {hasMatches ? `${formatLine(fromMatches)} · ${formatPointDiff(fromMatches.pointDiff)}` : '—'}
      </TableCell>
      <TableCell className="px-4 font-medium whitespace-nowrap tabular-nums">
        {`${formatLine(team)} · ${team.points} pts · ${formatPointDiff(team.pointDiff)}`}
      </TableCell>
      <TableCell className="w-48 px-4">
        {dirty && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || invalid}
              aria-label={`Save ${team.teamName}`}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleReset}
              disabled={saving}
              aria-label={`Reset ${team.teamName}`}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
