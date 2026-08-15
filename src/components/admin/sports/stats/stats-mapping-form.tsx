'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSportStatMappings, useUpdateSportStatMappings } from '@/hooks/use-statistics';

interface StatsMappingFormProps {
  sportId: number;
}

const STAT_COLUMNS = Array.from({ length: 12 }, (_, i) => `stat${i + 1}`);

export function StatsMappingForm({ sportId }: StatsMappingFormProps) {
  const { data: currentMappings, isLoading } = useSportStatMappings(sportId);
  const { mutateAsync: updateMappings, isPending } = useUpdateSportStatMappings();

  // Local state for the 12 stat labels
  const [labels, setLabels] = useState<Record<string, string>>({});

  // Initialize state when data loads
  useEffect(() => {
    if (currentMappings) {
      const initialLabels: Record<string, string> = {};
      currentMappings.forEach(mapping => {
        initialLabels[mapping.stat_column] = mapping.label;
      });
      setLabels(initialLabels);
    }
  }, [currentMappings]);

  const handleLabelChange = (column: string, value: string) => {
    setLabels(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert object to array of mappings, filtering out empty ones
    const mappingsToSave = STAT_COLUMNS.filter(col => labels[col]?.trim()).map(col => ({
      stat_column: col,
      label: labels[col].trim()
    }));

    try {
      const result = await updateMappings({ sportId, mappings: mappingsToSave });
      if (result.success) {
        toast.success('Stat mappings updated successfully');
      } else {
        toast.error(result.error || 'Failed to update stat mappings');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  if (isLoading) {
    return <div>Loading stat configuration...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Statistics Configuration</CardTitle>
        <CardDescription>
          Map the flexible stat columns (1-12) to human-readable labels for this sport. 
          Leave a field blank if this sport doesn't use that stat column.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STAT_COLUMNS.map(column => (
            <div key={column} className="space-y-2">
              <Label htmlFor={column} className="font-mono text-xs uppercase text-muted-foreground tracking-wider">
                {column}
              </Label>
              <Input
                id={column}
                placeholder="e.g. Points, Goals, Assists"
                value={labels[column] || ''}
                onChange={(e) => handleLabelChange(column, e.target.value)}
                disabled={isPending}
              />
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-end pt-6 border-t">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Configuration'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
