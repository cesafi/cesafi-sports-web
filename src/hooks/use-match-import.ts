import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { importMatchesFromCsv } from '@/actions/match-import';
import { matchKeys } from '@/hooks/use-matches';
import { MatchImportResponse } from '@/lib/types/match-import';
import { validateImportFile } from '@/lib/validations/match-import';

// Browsers refuse to re-read a picked file once it has been edited and saved on disk.
class UnreadableFileError extends Error {}

export function useMatchImport(stageId: number | null) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchImportResponse | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ file, stageId }: { file: File; stageId: number }) => {
      let csvText: string;
      try {
        csvText = await file.text();
      } catch {
        throw new UnreadableFileError(
          'The file could not be read. It may have changed since you chose it. Choose it again.'
        );
      }
      return importMatchesFromCsv(stageId, csvText);
    },
    onSuccess: (response, { stageId }) => {
      setResult(response);
      if (!response.success) return;

      toast.success(`Imported ${response.data.created} matches`);
      // Same refresh set as creating a single match
      queryClient.invalidateQueries({ queryKey: matchKeys.all });
      queryClient.invalidateQueries({ queryKey: ['matches', 'schedule'] });
      queryClient.invalidateQueries({ queryKey: ['matches', 'scheduleByDate'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      queryClient.invalidateQueries({ queryKey: ['recent'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming'] });
      queryClient.invalidateQueries({ queryKey: matchKeys.byStage(stageId) });
    },
    onError: (error) => {
      if (error instanceof UnreadableFileError) setFile(null);
      setResult({ success: false, error: error instanceof Error ? error.message : 'Failed to import matches.' });
    }
  });

  const selectFile = (next: File | null) => {
    setResult(null);
    if (!next) {
      setFile(null);
      setFileError(null);
      return;
    }
    const error = validateImportFile(next);
    setFile(error ? null : next);
    setFileError(error);
  };

  const runImport = () => {
    if (!file || !stageId || mutation.isPending) return;
    setResult(null);
    mutation.mutate({ file, stageId });
  };

  const reset = () => {
    setFile(null);
    setFileError(null);
    setResult(null);
    mutation.reset();
  };

  return { file, fileError, selectFile, runImport, isImporting: mutation.isPending, result, reset };
}
