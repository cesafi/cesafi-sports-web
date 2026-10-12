'use client';

import { AlertCircle, CheckCircle2, Download, FileText, Loader2, Upload } from 'lucide-react';
import { ModalLayout } from '@/components/ui/modal-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAllSportsSeasonsStages } from '@/hooks/use-sports-seasons-stages';
import { useMatchImport } from '@/hooks/use-match-import';
import { MatchImportColumn } from '@/lib/types/match-import';
import { buildMatchImportTemplate } from '@/lib/validations/match-import';
import { formatCategoryName } from '@/lib/utils/sports';

interface MatchImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageId: number | null;
}

const COLUMN_RULES: { column: MatchImportColumn; rule: string }[] = [
  { column: 'Match ID', rule: 'Unique in the file, e.g. CBL26-COL-001 (not saved)' },
  { column: 'Match Participants', rule: 'Two school abbreviations from this stage, e.g. UCLM vs. UPC' },
  { column: 'Match Details', rule: 'Required, for your reference (not saved)' },
  { column: 'Match Format', rule: 'BO1, BO3, BO5 or BO7' },
  { column: 'Scheduled Date', rule: 'YYYY-MM-DD, e.g. 2026-10-17' },
  { column: 'Start Time', rule: 'h:mm AM/PM, e.g. 3:30 PM' },
  { column: 'Venue', rule: 'Required, saved exactly as written' }
];

const titleCase = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const formatFileSize = (bytes: number) =>
  bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;

function downloadTemplate() {
  const url = URL.createObjectURL(new Blob([buildMatchImportTemplate()], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'match-import-template.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export function MatchImportModal({ open, onOpenChange, stageId }: MatchImportModalProps) {
  const { data: stages } = useAllSportsSeasonsStages();
  const { file, fileError, selectFile, runImport, isImporting, result, reset } = useMatchImport(stageId);

  const stage = stages?.find((s) => s.id === stageId);
  const stageLabel = stage
    ? [
        stage.sports_categories?.sports?.name,
        stage.sports_categories && formatCategoryName(stage.sports_categories.division, stage.sports_categories.levels),
        titleCase(stage.competition_stage)
      ]
        .filter(Boolean)
        .join(' · ')
    : `Stage #${stageId}`;

  const handleOpenChange = (next: boolean) => {
    if (isImporting) return;
    if (!next) reset();
    onOpenChange(next);
  };

  const rowErrors = result && !result.success ? (result.rowErrors ?? []) : [];
  const succeeded = result?.success === true;

  return (
    <ModalLayout
      open={open}
      onOpenChange={handleOpenChange}
      title="Import Bulk Matches"
      maxWidth="max-w-3xl"
      height="h-[85vh]"
      footer={
        <div className="flex justify-end gap-3">
          {succeeded ? (
            <Button type="button" variant="primary" onClick={() => handleOpenChange(false)}>
              Done
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isImporting}>
                Cancel
              </Button>
              <Button type="button" variant="primary" onClick={runImport} disabled={!file || isImporting}>
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing…
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Import
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">League Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-3 text-sm font-medium">{stageLabel}</div>
            <p className="text-muted-foreground mt-2 text-xs">
              Every match in the file is created in this stage with status &quot;Upcoming&quot;. Match names and
              descriptions are generated the same way as Add Match.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg">CSV Format</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4" />
              Download template
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <dl className="divide-y rounded-lg border text-sm">
              {COLUMN_RULES.map(({ column, rule }) => (
                <div key={column} className="grid gap-1 p-3 sm:grid-cols-[11rem_1fr]">
                  <dt className="font-medium">{column}</dt>
                  <dd className="text-muted-foreground">{rule}</dd>
                </div>
              ))}
            </dl>
            <p className="text-muted-foreground text-xs">
              Times are Philippine time (UTC+8). If any row has a problem, nothing is imported. Files up to 1 MB and
              500 matches.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="match-import-file">CSV file</Label>
            <Input
              id="match-import-file"
              type="file"
              accept=".csv,text/csv"
              disabled={isImporting}
              onChange={(e) => selectFile(e.target.files?.[0] ?? null)}
            />
            {file && (
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                <span>{file.name}</span>
                <span>({formatFileSize(file.size)})</span>
              </p>
            )}
            {fileError && <p className="text-sm text-red-500">{fileError}</p>}
          </CardContent>
        </Card>

        {result && !result.success && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>
              {rowErrors.length > 0
                ? `No matches were imported. Fix ${rowErrors.length} error${rowErrors.length === 1 ? '' : 's'} and try again.`
                : 'Import failed'}
            </AlertTitle>
            {rowErrors.length === 0 && <AlertDescription>{result.error}</AlertDescription>}
          </Alert>
        )}

        {rowErrors.length > 0 && (
          <ScrollArea className="h-64 rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Row</TableHead>
                  <TableHead>Match ID</TableHead>
                  <TableHead>Column</TableHead>
                  <TableHead>Problem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rowErrors.map((error, index) => (
                  <TableRow key={`${error.row}-${index}`}>
                    <TableCell>{error.row}</TableCell>
                    <TableCell>{error.matchId ?? '—'}</TableCell>
                    <TableCell>{error.field ?? '—'}</TableCell>
                    <TableCell className="whitespace-normal">{error.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}

        {result?.success && (
          <Alert className="border-green-600/40 text-green-700 dark:text-green-400">
            <CheckCircle2 />
            <AlertTitle>
              Imported {result.data.created} match{result.data.created === 1 ? '' : 'es'} into {stageLabel}.
            </AlertTitle>
          </Alert>
        )}
      </div>
    </ModalLayout>
  );
}
