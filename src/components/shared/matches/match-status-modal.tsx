'use client';

import { useState, useEffect } from 'react';
import { ModalLayout } from '@/components/ui/modal-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Square, Calendar, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { MatchWithFullDetails, MatchUpdate, MatchScoreUpdate } from '@/lib/types/matches';
import { formatTableDate } from '@/lib/utils/date';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateMatchScores } from '@/actions/match-participants';

interface MatchStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: MatchWithFullDetails;
  onUpdateMatch: (data: MatchUpdate) => Promise<void>;
  isSubmitting: boolean;
}

type MatchStatus = 'upcoming' | 'ongoing' | 'finished' | 'cancelled';

const statusConfig = {
  upcoming: {
    label: 'Upcoming',
    color: 'bg-amber-100 text-amber-800',
    icon: Calendar,
    description: 'Match is scheduled but not started'
  },
  ongoing: {
    label: 'Ongoing',
    color: 'bg-primary/10 text-primary',
    icon: Play,
    description: 'Match is currently in progress'
  },
  finished: {
    label: 'Finished',
    color: 'bg-green-100 text-green-800',
    icon: Square,
    description: 'Match has been completed'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: AlertTriangle,
    description: 'Match has been cancelled'
  }
};

export function MatchStatusModal({
  open,
  onOpenChange,
  match,
  onUpdateMatch,
  isSubmitting
}: MatchStatusModalProps) {
  const [formData, setFormData] = useState<{
    status: MatchStatus;
    scheduled_at: string;
    start_at: string;
    end_at: string;
    scores: { [teamId: string]: number | null };
  }>({
    status: 'upcoming',
    scheduled_at: '',
    start_at: '',
    end_at: '',
    scores: {}
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when modal opens
  useEffect(() => {
    if (open && match) {
      // Initialize scores from match participants
      const initialScores: { [teamId: string]: number | null } = {};
      match.match_participants.forEach(participant => {
        initialScores[participant.team_id] = participant.match_score;
      });

      setFormData({
        status: (match.status as MatchStatus) || 'upcoming',
        scheduled_at: match.scheduled_at ? new Date(match.scheduled_at).toISOString().slice(0, 16) : '',
        start_at: match.start_at ? new Date(match.start_at).toISOString().slice(0, 16) : '',
        end_at: match.end_at ? new Date(match.end_at).toISOString().slice(0, 16) : '',
        scores: initialScores
      });
      setErrors({});
    }
  }, [open, match]);

  const handleStatusChange = (status: MatchStatus) => {
    setFormData(prev => ({ ...prev, status }));
    
    // Auto-set timing based on status
    const now = new Date().toISOString().slice(0, 16);
    
    if (status === 'ongoing' && !formData.start_at) {
      setFormData(prev => ({ ...prev, start_at: now }));
    } else if (status === 'finished' && !formData.end_at) {
      setFormData(prev => ({ ...prev, end_at: now }));
    } else if (status === 'upcoming') {
      // Clear start and end times for upcoming matches
      setFormData(prev => ({ ...prev, start_at: '', end_at: '' }));
    }
  };

  const handleDateTimeChange = (field: 'scheduled_at' | 'start_at' | 'end_at', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleScoreChange = (teamId: string, value: string) => {
    const score = value === '' ? null : parseInt(value);
    setFormData(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [teamId]: score
      }
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate timing logic
    if (formData.start_at && formData.end_at) {
      const startTime = new Date(formData.start_at);
      const endTime = new Date(formData.end_at);
      
      if (endTime <= startTime) {
        newErrors.end_at = 'End time must be after start time';
      }
    }

    // Status-specific validations
    if (formData.status === 'ongoing' && !formData.start_at) {
      newErrors.start_at = 'Start time is required for ongoing matches';
    }
    
    if (formData.status === 'finished') {
      if (!formData.start_at) {
        newErrors.start_at = 'Start time is required for finished matches';
      }
      if (!formData.end_at) {
        newErrors.end_at = 'End time is required for finished matches';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const updateData: MatchUpdate = {
        id: match.id,
        status: formData.status,
        scheduled_at: formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : null,
        start_at: formData.start_at ? new Date(formData.start_at).toISOString() : null,
        end_at: formData.end_at ? new Date(formData.end_at).toISOString() : null
      };

      await onUpdateMatch(updateData);

      // Update scores using the action
      const scoreUpdates: MatchScoreUpdate[] = Object.entries(formData.scores).map(([teamId, score]) => ({
        match_id: match.id,
        team_id: teamId,
        match_score: score
      }));
      
      if (scoreUpdates.length > 0) {
        const scoreResult = await updateMatchScores(scoreUpdates);
        if (!scoreResult.success) {
          toast.error(scoreResult.error || 'Failed to update match scores');
          return;
        }
        toast.success('Match scores updated successfully');
      }
    } catch (error) {
      console.error('Failed to update match status:', error);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
  };

  const currentStatus = statusConfig[formData.status];
  const StatusIcon = currentStatus.icon;

  return (
    <ModalLayout
      open={open}
      onOpenChange={handleClose}
      title="Manage Match Status & Timing"
      maxWidth="max-w-2xl"
      footer={
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(errors).length > 0}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Updating...</span>
              </div>
            ) : (
              'Update Match'
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Current Match Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              Match Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">{match.name}</h3>
              <div className="text-sm text-muted-foreground">
                <p>{match.description}</p>
                <p className="mt-1">Venue: {match.venue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              Status Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="status">Match Status *</Label>
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select match status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([value, config]) => {
                    const Icon = config.icon;
                    return (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              {/* Status Preview */}
              <div className="flex items-center space-x-2">
                <StatusIcon className="h-4 w-4" />
                <Badge variant="secondary" className={currentStatus.color}>
                  {currentStatus.label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {currentStatus.description}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timing Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              Match Timing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Scheduled Time */}
            <div className="space-y-2">
              <Label htmlFor="scheduled_at">Scheduled Time</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => handleDateTimeChange('scheduled_at', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                When the match is scheduled to begin
              </p>
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="start_at">
                Actual Start Time
                {(formData.status === 'ongoing' || formData.status === 'finished') && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              <Input
                id="start_at"
                type="datetime-local"
                value={formData.start_at}
                onChange={(e) => handleDateTimeChange('start_at', e.target.value)}
                className={errors.start_at ? 'border-red-500' : ''}
              />
              {errors.start_at && (
                <p className="text-sm text-red-500">{errors.start_at}</p>
              )}
              <p className="text-xs text-muted-foreground">
                When the match actually started
              </p>
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="end_at">
                End Time
                {formData.status === 'finished' && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              <Input
                id="end_at"
                type="datetime-local"
                value={formData.end_at}
                onChange={(e) => handleDateTimeChange('end_at', e.target.value)}
                className={errors.end_at ? 'border-red-500' : ''}
                disabled={formData.status === 'upcoming'}
              />
              {errors.end_at && (
                <p className="text-sm text-red-500">{errors.end_at}</p>
              )}
              <p className="text-xs text-muted-foreground">
                When the match ended (only for finished matches)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Match Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              Match Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {match.match_participants.map((participant) => (
                <div key={participant.team_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{participant.schools_teams.schools.abbreviation} {participant.schools_teams.name}</div>
                    <div className="text-sm text-muted-foreground">{participant.schools_teams.schools.name}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`score-${participant.team_id}`} className="text-sm font-medium">
                      Score:
                    </Label>
                    <Input
                      id={`score-${participant.team_id}`}
                      type="number"
                      min="0"
                      value={formData.scores[participant.team_id] || ''}
                      onChange={(e) => handleScoreChange(participant.team_id, e.target.value)}
                      className="w-20 text-center"
                      placeholder="0"
                      disabled={formData.status === 'upcoming'}
                    />
                  </div>
                </div>
              ))}
              {match.match_participants.length === 0 && (
                <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                  No participants found for this match.
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {formData.status === 'upcoming' 
                ? 'Scores can be entered once the match starts.'
                : 'Enter the final scores for each team when the match is finished.'
              }
            </p>
            
            {/* Winner Display */}
            {formData.status === 'finished' && Object.values(formData.scores).some(score => score !== null) && (
              <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="text-sm font-medium text-primary mb-2">Match Result:</div>
                {(() => {
                  const scores = Object.entries(formData.scores);
                  const validScores = scores.filter(([_, score]) => score !== null);
                  
                  if (validScores.length < 2) return <span className="text-muted-foreground">Enter scores for both teams to see the result.</span>;
                  
                  const [team1Id, score1] = validScores[0];
                  const [team2Id, score2] = validScores[1];
                  const team1 = match.match_participants.find(p => p.team_id === team1Id);
                  const team2 = match.match_participants.find(p => p.team_id === team2Id);
                  
                  if (!team1 || !team2) return <span className="text-muted-foreground">Team information not found.</span>;
                  
                  const winner = (score1 as number) > (score2 as number) ? team1 : team2;
                  const winnerScore = Math.max(score1 as number, score2 as number);
                  const loserScore = Math.min(score1 as number, score2 as number);
                  
                  return (
                    <div className="space-y-1">
                      <div className="font-semibold text-green-600">
                        🏆 {winner.schools_teams.schools.abbreviation} {winner.schools_teams.name} wins!
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Final Score: {winnerScore} - {loserScore}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Timing Display */}
        {(match.scheduled_at || match.start_at || match.end_at) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                Current Timing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted border rounded-lg p-4">
                <div className="space-y-1 text-sm">
                  {match.scheduled_at && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-foreground">Scheduled: {formatTableDate(match.scheduled_at)}</span>
                    </div>
                  )}
                  {match.start_at && (
                    <div className="flex items-center space-x-2">
                      <Play className="h-4 w-4 text-green-600" />
                      <span className="text-foreground">Started: {formatTableDate(match.start_at)}</span>
                    </div>
                  )}
                  {match.end_at && (
                    <div className="flex items-center space-x-2">
                      <Square className="h-4 w-4 text-red-600" />
                      <span className="text-foreground">Ended: {formatTableDate(match.end_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Note */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-muted border rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Changing the match status will affect how the match appears throughout the system. 
                Make sure to set accurate timing information for proper tracking and reporting.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModalLayout>
  );
}