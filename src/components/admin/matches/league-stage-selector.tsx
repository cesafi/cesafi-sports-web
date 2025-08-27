'use client';

import { useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAllSports } from '@/hooks/use-sports';
import { useAllSportCategories } from '@/hooks/use-sports';
import { useAllSportsSeasonsStages } from '@/hooks/use-sports-seasons-stages';
import { formatCategoryName } from '@/lib/utils/sports';

interface LeagueStageSelectorProps {
  selectedSportId: number | null;
  selectedSportCategoryId: number | null;
  selectedStageId: number | null;
  onSportChange: (sportId: number) => void;
  onSportCategoryChange: (categoryId: number) => void;
  onStageChange: (stageId: number) => void;
  className?: string;
}

export function LeagueStageSelector({
  selectedSportId,
  selectedSportCategoryId,
  selectedStageId,
  onSportChange,
  onSportCategoryChange,
  onStageChange,
  className
}: LeagueStageSelectorProps) {
  const { data: sports, isLoading: sportsLoading } = useAllSports();
  const { data: sportCategories, isLoading: categoriesLoading } = useAllSportCategories();
  const { data: stages, isLoading: stagesLoading } = useAllSportsSeasonsStages();

  // Memoize filtered data to prevent unnecessary re-renders
  const filteredSportCategories = useMemo(() => {
    if (!sportCategories || !selectedSportId) return [];
    return sportCategories.filter(category => category.sport_id === selectedSportId);
  }, [sportCategories, selectedSportId]);

  const filteredStages = useMemo(() => {
    if (!stages || !selectedSportCategoryId) return [];
    return stages.filter(stage => stage.sport_category_id === selectedSportCategoryId);
  }, [stages, selectedSportCategoryId]);

  // Auto-select first sport if none selected
  useEffect(() => {
    if (!selectedSportId && sports && sports.length > 0) {
      onSportChange(sports[0].id);
    }
  }, [selectedSportId, sports, onSportChange]);

  // Auto-select first sport category if none selected and sport is selected
  useEffect(() => {
    if (selectedSportId && !selectedSportCategoryId && filteredSportCategories.length > 0) {
      onSportCategoryChange(filteredSportCategories[0].id);
    }
  }, [selectedSportId, selectedSportCategoryId, filteredSportCategories, onSportCategoryChange]);

  // Auto-select first stage if none selected and sport category is selected
  useEffect(() => {
    if (selectedSportCategoryId && !selectedStageId && filteredStages.length > 0) {
      onStageChange(filteredStages[0].id);
    }
  }, [selectedSportCategoryId, selectedStageId, filteredStages, onStageChange]);

  // Show loading state
  if (sportsLoading || categoriesLoading || stagesLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-sm text-muted-foreground">
          Loading sports and categories...
        </div>
      </div>
    );
  }

  // Show error state if no sports available
  if (!sports || sports.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-sm text-muted-foreground">
          No sports available
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Sport Selection */}
      <div className="space-y-2">
        <Label htmlFor="sport-selector">Sport</Label>
        <Select value={selectedSportId?.toString()} onValueChange={(value) => onSportChange(parseInt(value))}>
          <SelectTrigger id="sport-selector" className="w-full">
            <SelectValue placeholder="Select a sport" />
          </SelectTrigger>
          <SelectContent>
            {sports.map((sport) => (
              <SelectItem key={sport.id} value={sport.id.toString()}>
                {sport.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sport Category Selection */}
      <div className="space-y-2">
        <Label htmlFor="sport-category-selector">Sport Category</Label>
        <Select 
          value={selectedSportCategoryId?.toString()} 
          onValueChange={(value) => onSportCategoryChange(parseInt(value))}
          disabled={!selectedSportId}
        >
          <SelectTrigger id="sport-category-selector" className="w-full">
            <SelectValue placeholder={selectedSportId ? "Select a category" : "Select a sport first"} />
          </SelectTrigger>
          <SelectContent>
            {filteredSportCategories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {formatCategoryName(category.division, category.levels)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedSportId && filteredSportCategories.length === 0 && (
          <div className="text-xs text-muted-foreground">
            No categories available for selected sport
          </div>
        )}
      </div>

      {/* League Stage Selection */}
      <div className="space-y-2">
        <Label htmlFor="stage-selector">League Stage</Label>
        <Select 
          value={selectedStageId?.toString()} 
          onValueChange={(value) => onStageChange(parseInt(value))}
          disabled={!selectedSportCategoryId}
        >
          <SelectTrigger id="stage-selector" className="w-full">
            <SelectValue placeholder={selectedSportCategoryId ? "Select a stage" : "Select a sport category first"} />
          </SelectTrigger>
          <SelectContent>
            {filteredStages.map((stage) => (
              <SelectItem key={stage.id} value={stage.id.toString()}>
                {stage.competition_stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedSportCategoryId && filteredStages.length === 0 && (
          <div className="text-xs text-muted-foreground">
            No stages available for selected category
          </div>
        )}
      </div>
    </div>
  );
}
