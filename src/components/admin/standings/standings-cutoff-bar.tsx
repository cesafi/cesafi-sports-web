'use client';

import { useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SavedStandingsCutoff, StandingsResult } from '@/lib/types/standings';

interface StandingsCutoffBarProps {
  /** YYYY-MM-DD, or null when every finished match counts */
  countedThrough: string | null;
  onSave: (countedThrough: string | null) => Promise<StandingsResult<SavedStandingsCutoff>>;
}

const INPUT_ID = 'standings-cutoff-date';
const ERROR_ID = 'standings-cutoff-error';

export function StandingsCutoffBar({ countedThrough, onSave }: StandingsCutoffBarProps) {
  const saved = countedThrough ?? '';
  const [syncedValue, setSyncedValue] = useState(saved);
  const [draft, setDraft] = useState(saved);
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  // Saved date changed (save, other admin, category switch): show the latest value.
  if (syncedValue !== saved) {
    setSyncedValue(saved);
    setDraft(saved);
    setError(undefined);
  }

  const submit = async (value: string | null) => {
    if (saving) return;
    setSaving(true);
    try {
      const result = await onSave(value);
      setError(result.success ? undefined : result.fieldErrors?.countedThrough?.[0]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card space-y-2 rounded-lg border p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={INPUT_ID}>Starting record covers games through</Label>
          <Input
            id={INPUT_ID}
            type="date"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setError(undefined);
            }}
            disabled={saving}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? ERROR_ID : undefined}
            className="h-9 w-44"
          />
        </div>
        <Button
          size="sm"
          onClick={() => submit(draft)}
          disabled={saving || draft === '' || draft === saved}
          aria-label="Save cut-off date"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => submit(null)}
          disabled={saving || countedThrough === null}
          aria-label="Clear cut-off date"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      </div>
      {error && (
        <p id={ERROR_ID} className="text-destructive text-xs">
          {error}
        </p>
      )}
      <p className="text-muted-foreground text-xs">
        Finished matches on or before this date are already in the starting record and are not added again. Leave
        empty to count every finished match.
      </p>
    </div>
  );
}
