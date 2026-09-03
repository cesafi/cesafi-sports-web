'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ModalLayout } from '@/components/ui/modal-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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

  const prevOpenRef = useRef(false);
  const prevStageIdRef = useRef<number | undefined>(undefined);

  const handleClose = useCallback(() => {
    setErrors({});
    onOpenChange(false);
  }, [onOpenChange]);

  // Form reset only on modal open transition or stage ID change
  useEffect(() => {
    const isOpening = open && !prevOpenRef.current;
    const isStageChanged = open && mode === 'edit' && stage && stage.id !== prevStageIdRef.current;

    if (isOpening || isStageChanged) {
      if (mode === 'edit' && stage) {
        setFormData({
          id: stage.id,
          sport_category_id: stage.sport_category_id || undefined,
          season_id: stage.season_id || undefined,
          competition_stage: stage.competition_stage
        });
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

    prevOpenRef.current = open;
    prevStageIdRef.current = stage?.id;
  }, [open, mode, stage, currentSeason, sportCategories]);

  // Delayed sport selection if categories load after modal is already open
  useEffect(() => {
    if (open && mode === 'edit' && stage?.sport_category_id && !selectedSportId && sportCategories?.length) {
      const category = sportCategories.find((cat) => cat.id === stage.sport_category_id);
      if (category) {
        setSelectedSportId(category.sport_id);
      }
    }
  }, [open, mode, stage?.sport_category_id, selectedSportId, sportCategories]);



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
          <Label htmlFor="competitionStage">Competition Stage Name *</Label>
          <Input
            id="competitionStage"
            value={formData.competition_stage || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                competition_stage: e.target.value
              }))
            }
            placeholder="e.g., Elimination Round, Group Stage, Quarterfinals, Playoffs, Finals"
            className={errors.competition_stage ? 'border-red-500' : ''}
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-xs text-muted-foreground mr-1 self-center">Suggestions:</span>
            {['Elimination Round', 'Group Stage', 'Quarterfinals', 'Semifinals', 'Play-ins', 'Playoffs', 'Finals'].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    competition_stage: suggestion
                  }))
                }
                className="text-xs px-2 py-0.5 rounded-full border bg-muted/50 hover:bg-primary/10 hover:border-primary/50 text-muted-foreground hover:text-primary transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
          {errors.competition_stage && (
            <p className="text-sm text-red-500">{errors.competition_stage}</p>
          )}
        </div>
      </form>
    </ModalLayout>
  );
}
