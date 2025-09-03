'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ModalLayout } from '@/components/ui/modal-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  SportsSeasonsStage,
  SportsSeasonsStageInsert,
  SportsSeasonsStageUpdate
} from '@/lib/types/sports-seasons-stages';
import {
  createSportsSeasonsStageSchema,
  updateSportsSeasonsStageSchema
} from '@/lib/validations/sports-seasons-stages';
import { ZodError } from 'zod';
import { useSeason } from '@/components/contexts/season-provider';
import { useAllSports } from '@/hooks/use-sports';
import { useAllSportCategories } from '@/hooks/use-sports';
import { CompetitionStage } from '@/lib/types/sports-seasons-stages';
import { formatCategoryName } from '@/lib/utils/sports';

interface LeagueStageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  stage?: SportsSeasonsStage;
  onSubmit: (data: SportsSeasonsStageInsert | SportsSeasonsStageUpdate) => Promise<void>;
  isSubmitting: boolean;
}

export function LeagueStageModal({
  open,
  onOpenChange,
  mode,
  stage,
  onSubmit,
  isSubmitting
}: LeagueStageModalProps) {
  const { currentSeason, availableSeasons } = useSeason();
  const { data: sports } = useAllSports();
  const { data: sportCategories } = useAllSportCategories();

  const [formData, setFormData] = useState<SportsSeasonsStageInsert | SportsSeasonsStageUpdate>({
    sport_category_id: undefined,
    season_id: undefined,
    competition_stage: undefined
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedSportId, setSelectedSportId] = useState<number | undefined>();

  const hasStartedCreating = useRef(false);
  const hasStartedUpdating = useRef(false);

  // Filter sport categories by selected sport
  const filteredSportCategories =
    sportCategories?.filter(
      (category) => !selectedSportId || category.sport_id === selectedSportId
    ) || [];

  const handleClose = useCallback(() => {
    setErrors({});
    onOpenChange(false);
  }, [onOpenChange]);

  // Form reset on modal open/close
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && stage) {
        setFormData({
          id: stage.id,
          sport_category_id: stage.sport_category_id || undefined,
          season_id: stage.season_id || undefined,
          competition_stage: stage.competition_stage
        });
        // Set the selected sport ID based on the sport category
        if (stage.sport_category_id && sportCategories) {
          const category = sportCategories.find((cat) => cat.id === stage.sport_category_id);
          setSelectedSportId(category?.sport_id);
        }
      } else {
        setFormData({
          sport_category_id: undefined,
          season_id: currentSeason?.id || undefined,
          competition_stage: undefined
        });
        setSelectedSportId(undefined);
      }
      setErrors({});
      hasStartedCreating.current = false;
      hasStartedUpdating.current = false;
    }
  }, [open, mode, stage, currentSeason, sportCategories]);

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
      const schema =
        mode === 'add' ? createSportsSeasonsStageSchema : updateSportsSeasonsStageSchema;
      const validatedData = schema.parse(formData);

      if (mode === 'add') {
        hasStartedCreating.current = true;
      } else {
        hasStartedUpdating.current = true;
      }

      await onSubmit(validatedData);
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

  const handleSportChange = (sportId: string) => {
    const numSportId = parseInt(sportId);
    setSelectedSportId(numSportId);
    setFormData((prev) => ({ ...prev, sport_category_id: undefined }));
  };

  const handleSportCategoryChange = (categoryId: string) => {
    setFormData((prev) => ({ ...prev, sport_category_id: parseInt(categoryId) }));
  };

  const handleSeasonChange = (seasonId: string) => {
    setFormData((prev) => ({ ...prev, season_id: parseInt(seasonId) }));
  };

  const handleCompetitionStageChange = (stage: string) => {
    setFormData((prev) => ({ ...prev, competition_stage: stage as CompetitionStage }));
  };

  return (
    <ModalLayout
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'add' ? 'Add New League Stage' : 'Edit League Stage'}
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="league-stage-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'add' ? 'Create Stage' : 'Update Stage'}
          </Button>
        </div>
      }
    >
      <form id="league-stage-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Sport Selection */}
        <div className="space-y-2">
          <Label htmlFor="sport">Sport *</Label>
          <Select value={selectedSportId?.toString()} onValueChange={handleSportChange}>
            <SelectTrigger className={errors.sport_category_id ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select a sport" />
            </SelectTrigger>
            <SelectContent>
              {sports?.map((sport) => (
                <SelectItem key={sport.id} value={sport.id.toString()}>
                  {sport.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sport_category_id && (
            <p className="text-sm text-red-500">{errors.sport_category_id}</p>
          )}
        </div>

        {/* Sport Category Selection */}
        <div className="space-y-2">
          <Label htmlFor="sportCategory">Sport Category *</Label>
          <Select
            value={formData.sport_category_id?.toString()}
            onValueChange={handleSportCategoryChange}
            disabled={!selectedSportId}
          >
            <SelectTrigger className={errors.sport_category_id ? 'border-red-500' : ''}>
              <SelectValue
                placeholder={selectedSportId ? 'Select a category' : 'Select a sport first'}
              />
            </SelectTrigger>
            <SelectContent>
              {filteredSportCategories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {formatCategoryName(category.division, category.levels)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sport_category_id && (
            <p className="text-sm text-red-500">{errors.sport_category_id}</p>
          )}
        </div>

        {/* Season Selection */}
        <div className="space-y-2">
          <Label htmlFor="season">Season *</Label>
          <Select value={formData.season_id?.toString()} onValueChange={handleSeasonChange}>
            <SelectTrigger className={errors.season_id ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select a season" />
            </SelectTrigger>
            <SelectContent>
              {availableSeasons?.map((season) => (
                <SelectItem key={season.id} value={season.id.toString()}>
                  Season {season.id} {season.id === currentSeason?.id ? '(Current)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.season_id && <p className="text-sm text-red-500">{errors.season_id}</p>}
        </div>

        {/* Competition Stage Selection */}
        <div className="space-y-2">
          <Label htmlFor="competitionStage">Competition Stage *</Label>
          <Select value={formData.competition_stage} onValueChange={handleCompetitionStageChange}>
            <SelectTrigger className={errors.competition_stage ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select competition stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="group_stage">Group Stage</SelectItem>
              <SelectItem value="playins">Play-ins</SelectItem>
              <SelectItem value="playoffs">Playoffs</SelectItem>
              <SelectItem value="finals">Finals</SelectItem>
            </SelectContent>
          </Select>
          {errors.competition_stage && (
            <p className="text-sm text-red-500">{errors.competition_stage}</p>
          )}
        </div>
      </form>
    </ModalLayout>
  );
}
