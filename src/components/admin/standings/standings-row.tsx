'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2, RotateCcw, Save } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { lossesSchema, STANDINGS_MAX_VALUE, winsSchema } from '@/lib/validations/standings';
import type {
  RankedTeamStanding,
  SavedTeamStanding,
  StandingsFieldErrors,
  StandingsResult
} from '@/lib/types/standings';

type Field = 'wins' | 'losses';

interface StandingsRowProps {
  team: RankedTeamStanding;
  onSave: (values: { wins: number; losses: number }) => Promise<StandingsResult<SavedTeamStanding>>;
}

const SCHEMAS = { wins: winsSchema, losses: lossesSchema };

// An empty field is invalid, never 0.
const clientError = (field: Field, draft: string): string | undefined => {
  const result = SCHEMAS[field].safeParse(draft.trim() === '' ? Number.NaN : Number(draft));
  return result.success ? undefined : result.error.issues[0]?.message;
};

export function StandingsRow({ team, onSave }: StandingsRowProps) {
  const savedKey = `${team.wins}|${team.losses}|${team.updatedAt}`;
  const [syncedKey, setSyncedKey] = useState(savedKey);
  const [draft, setDraft] = useState({ wins: String(team.wins), losses: String(team.losses) });
  const [serverErrors, setServerErrors] = useState<StandingsFieldErrors>({});
  const [saving, setSaving] = useState(false);

  // Saved values changed (save, conflict reload, refetch): show the latest numbers.
  if (syncedKey !== savedKey) {
    setSyncedKey(savedKey);
    setDraft({ wins: String(team.wins), losses: String(team.losses) });
    setServerErrors({});
  }

  const errors: Record<Field, string | undefined> = {
    wins: clientError('wins', draft.wins) ?? serverErrors.wins?.[0],
    losses: clientError('losses', draft.losses) ?? serverErrors.losses?.[0]
  };
  const invalid = Boolean(clientError('wins', draft.wins) || clientError('losses', draft.losses));
  const dirty = draft.wins !== String(team.wins) || draft.losses !== String(team.losses);

  const handleChange = (field: Field, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setServerErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSave = async () => {
    if (saving || invalid) return;
    setSaving(true);
    try {
      const result = await onSave({ wins: Number(draft.wins), losses: Number(draft.losses) });
      if (!result.success && result.fieldErrors) setServerErrors(result.fieldErrors);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setDraft({ wins: String(team.wins), losses: String(team.losses) });
    setServerErrors({});
  };

  const renderInput = (field: Field, label: 'Wins' | 'Losses') => {
    const errorId = `${team.teamId}-${field}-error`;
    return (
      <div className="flex flex-col gap-1">
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          max={STANDINGS_MAX_VALUE}
          step={1}
          value={draft[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          disabled={saving}
          aria-label={`${label} for ${team.teamName}`}
          aria-invalid={errors[field] ? true : undefined}
          aria-describedby={errors[field] ? errorId : undefined}
          className="h-9 w-20"
        />
        {errors[field] && (
          <p id={errorId} className="text-destructive max-w-40 text-xs">
            {errors[field]}
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
      <TableCell className="px-4 align-top">{renderInput('wins', 'Wins')}</TableCell>
      <TableCell className="px-4 align-top">{renderInput('losses', 'Losses')}</TableCell>
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
