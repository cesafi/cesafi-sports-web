'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ModalLayout } from '@/components/ui/modal-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { MatchWithStageDetails, MatchInsert, MatchUpdate } from '@/lib/types/matches';
import { ZodError } from 'zod';
import { useAllSportsSeasonsStages } from '@/hooks/use-sports-seasons-stages';

interface MatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  match?: MatchWithStageDetails;
  selectedStageId: number | null;
  onSubmit: (data: MatchInsert | MatchUpdate) => Promise<void>;
  isSubmitting: boolean;
}

export function MatchModal({
  open,
  onOpenChange,
  mode,
  match,
  selectedStageId,
  onSubmit,
  isSubmitting
}: MatchModalProps) {
  const { data: stages } = useAllSportsSeasonsStages();
  
  const [formData, setFormData] = useState<MatchInsert | MatchUpdate>({
    name: '',
    description: '',
    venue: '',
    stage_id: selectedStageId || 0,
    scheduled_at: null,
    start_at: null,
    end_at: null,
    best_of: 1
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const hasStartedCreating = useRef(false);
  const hasStartedUpdating = useRef(false);

  const selectedStage = stages?.find(stage => stage.id === selectedStageId);

  const handleClose = useCallback(() => {
    setErrors({});
    onOpenChange(false);
  }, [onOpenChange]);

  // Form reset on modal open/close
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && match) {
        setFormData({
          id: match.id,
          name: match.name,
          description: match.description,
          venue: match.venue,
          stage_id: match.stage_id,
          scheduled_at: match.scheduled_at,
          start_at: match.start_at,
          end_at: match.end_at,
          best_of: match.best_of
        });
      } else {
        setFormData({
          name: '',
          description: '',
          venue: '',
          stage_id: selectedStageId || 0,
          scheduled_at: null,
          start_at: null,
          end_at: null,
          best_of: 1
        });
      }
      setErrors({});
      hasStartedCreating.current = false;
      hasStartedUpdating.current = false;
    }
  }, [open, mode, match, selectedStageId]);

  // Handle mutation completion
  useEffect(() => {
    if (hasStartedCreating.current && !isSubmitting && mode === 'add') {
      handleClose();
    }
  }, [isSubmitting, mode, handleClose]);

  useEffect(() => {
    if (hasStartedUpdating.current && !isSubmitting && mode === 'edit') {
      handleClose();
    }
  }, [isSubmitting, mode, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Basic validation
      if (!formData.name?.trim()) {
        setErrors({ name: 'Match name is required' });
        return;
      }
      if (!formData.description?.trim()) {
        setErrors({ description: 'Match description is required' });
        return;
      }
      if (!formData.venue?.trim()) {
        setErrors({ venue: 'Venue is required' });
        return;
      }
      if (!formData.stage_id) {
        setErrors({ stage_id: 'League stage is required' });
        return;
      }

      if (mode === 'add') {
        hasStartedCreating.current = true;
      } else {
        hasStartedUpdating.current = true;
      }

      await onSubmit(formData);
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path) {
            newErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(newErrors);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const handleDateChange = (field: 'scheduled_at' | 'start_at' | 'end_at', value: string) => {
    const dateValue = value ? new Date(value).toISOString() : null;
    setFormData(prev => ({ ...prev, [field]: dateValue }));
  };

  const handleBestOfChange = (value: string) => {
    setFormData(prev => ({ ...prev, best_of: parseInt(value) }));
  };

  return (
    <ModalLayout
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'add' ? 'Add New Match' : 'Edit Match'}
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="match-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'add' ? 'Create Match' : 'Update Match'}
          </Button>
        </div>
      }
    >
      <form id="match-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Match Name */}
        <div className="space-y-2">
          <Label htmlFor="matchName">Match Name *</Label>
          <Input
            id="matchName"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter match name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Match Description */}
        <div className="space-y-2">
          <Label htmlFor="matchDescription">Description *</Label>
          <Textarea
            id="matchDescription"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter match description"
            className={errors.description ? 'border-red-500' : ''}
            rows={3}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Venue */}
        <div className="space-y-2">
          <Label htmlFor="venue">Venue *</Label>
          <Input
            id="venue"
            value={formData.venue}
            onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
            placeholder="Enter venue"
            className={errors.venue ? 'border-red-500' : ''}
          />
          {errors.venue && (
            <p className="text-sm text-red-500">{errors.venue}</p>
          )}
        </div>

        {/* League Stage Display */}
        {selectedStage && (
          <div className="space-y-2">
            <Label>League Stage</Label>
            <div className="p-3 bg-muted rounded-lg text-sm">
              <div className="font-medium">
                {selectedStage.competition_stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
              <div className="text-muted-foreground">
                Stage ID: {selectedStage.id}
              </div>
            </div>
          </div>
        )}

        {/* Best of */}
        <div className="space-y-2">
          <Label htmlFor="bestOf">Best of</Label>
          <Select value={formData.best_of?.toString()} onValueChange={handleBestOfChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select best of" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="7">7</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Scheduled Date */}
        <div className="space-y-2">
          <Label htmlFor="scheduledAt">Scheduled Date</Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            value={formData.scheduled_at ? new Date(formData.scheduled_at).toISOString().slice(0, 16) : ''}
            onChange={(e) => handleDateChange('scheduled_at', e.target.value)}
          />
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="startAt">Start Date</Label>
          <Input
            id="startAt"
            type="datetime-local"
            value={formData.start_at ? new Date(formData.start_at).toISOString().slice(0, 16) : ''}
            onChange={(e) => handleDateChange('start_at', e.target.value)}
          />
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label htmlFor="endAt">End Date</Label>
          <Input
            id="endAt"
            type="datetime-local"
            value={formData.end_at ? new Date(formData.end_at).toISOString().slice(0, 16) : ''}
            onChange={(e) => handleDateChange('end_at', e.target.value)}
          />
        </div>
      </form>
    </ModalLayout>
  );
}
