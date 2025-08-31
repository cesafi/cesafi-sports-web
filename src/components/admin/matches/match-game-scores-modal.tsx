'use client';

import { useState, useEffect } from 'react';
import { ModalLayout } from '@/components/ui/modal-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Clock, Play } from 'lucide-react';
import { toast } from 'sonner';
import { GameWithDetails } from '@/lib/types/games';
import { MatchParticipantWithFullDetails } from '@/lib/types/match-participants';
import { GameScore, GameScoreInsert, GameScoreUpdate } from '@/lib/types/game-scores';
import { formatTableDate } from '@/lib/utils/date';

interface MatchGameScoresModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  game: GameWithDetails;
  participants: MatchParticipantWithFullDetails[];
  gameScores: GameScore[];
  onSaveScores: (scores: (GameScoreInsert | GameScoreUpdate)[]) => Promise<void>;
  isSubmitting: boolean;
}

export function MatchGameScoresModal({
  open,
  onOpenChange,
  game,
  participants,
  gameScores,
  onSaveScores,
  isSubmitting
}: MatchGameScoresModalProps) {
  const [scores, setScores] = useState<Record<number, number>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});

  // Initialize scores when modal opens or data changes
  useEffect(() => {
    if (open) {
      const initialScores: Record<number, number> = {};
      
      // Set existing scores
      gameScores.forEach(score => {
        if (score.match_participant_id) {
          initialScores[score.match_participant_id] = score.score;
        }
      });
      
      // Set default scores for participants without scores
      participants.forEach(participant => {
        if (!(participant.id in initialScores)) {
          initialScores[participant.id] = 0;
        }
      });
      
      setScores(initialScores);
      setErrors({});
    }
  }, [open, gameScores, participants]);

  const getGameStatusBadge = () => {
    if (game.start_at && game.end_at) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
    } else if (game.start_at) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Progress</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Scheduled</Badge>;
    }
  };

  const handleScoreChange = (participantId: number, value: string) => {
    const numValue = parseInt(value) || 0;
    
    // Validation
    if (numValue < 0) {
      setErrors(prev => ({ ...prev, [participantId]: 'Score cannot be negative' }));
      return;
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[participantId];
        return newErrors;
      });
    }
    
    setScores(prev => ({ ...prev, [participantId]: numValue }));
  };

  const handleSubmit = async () => {
    // Clear any existing errors
    setErrors({});
    
    // Validate all scores
    const newErrors: Record<number, string> = {};
    Object.entries(scores).forEach(([participantId, score]) => {
      if (score < 0) {
        newErrors[parseInt(participantId)] = 'Score cannot be negative';
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Prepare score data for submission
      const scoreUpdates: (GameScoreInsert | GameScoreUpdate)[] = [];
      
      Object.entries(scores).forEach(([participantId, score]) => {
        const participantIdNum = parseInt(participantId);
        const existingScore = gameScores.find(s => s.match_participant_id === participantIdNum);
        
        if (existingScore) {
          // Update existing score
          scoreUpdates.push({
            id: existingScore.id,
            match_participant_id: participantIdNum,
            game_id: game.id,
            score: score
          });
        } else {
          // Create new score
          scoreUpdates.push({
            match_participant_id: participantIdNum,
            game_id: game.id,
            score: score
          });
        }
      });
      
      await onSaveScores(scoreUpdates);
    } catch (error) {
      console.error('Failed to save scores:', error);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
  };

  return (
    <ModalLayout
      open={open}
      onOpenChange={handleClose}
      title={`Manage Scores - Game ${game.game_number}`}
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
                <span>Saving...</span>
              </div>
            ) : (
              'Save Scores'
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Game Information */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Game {game.game_number}</h3>
            </div>
            {getGameStatusBadge()}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {game.start_at && (
              <div className="flex items-center space-x-2">
                <Play className="h-4 w-4 text-green-600" />
                <span className="text-muted-foreground">Started:</span>
                <span className="font-medium">{formatTableDate(game.start_at)}</span>
              </div>
            )}
            {game.end_at && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-red-600" />
                <span className="text-muted-foreground">Ended:</span>
                <span className="font-medium">{formatTableDate(game.end_at)}</span>
              </div>
            )}
            {game.duration && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{game.duration}</span>
              </div>
            )}
          </div>
        </div>

        {/* Team Scores */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Team Scores</h3>
            <span className="text-sm text-muted-foreground">({participants.length} teams)</span>
          </div>
          
          {participants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No participating teams found for this game</p>
            </div>
          ) : (
            <div className="space-y-3">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium">
                      {participant.schools_teams.schools.abbreviation} {participant.schools_teams.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {participant.schools_teams.schools.name}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`score-${participant.id}`} className="text-sm font-medium">
                      Score:
                    </Label>
                    <div className="relative">
                      <Input
                        id={`score-${participant.id}`}
                        type="number"
                        min="0"
                        value={scores[participant.id] || 0}
                        onChange={(e) => handleScoreChange(participant.id, e.target.value)}
                        className={`w-20 text-center ${errors[participant.id] ? 'border-red-500' : ''}`}
                        disabled={isSubmitting}
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                        pts
                      </span>
                    </div>
                  </div>
                  
                  {errors[participant.id] && (
                    <div className="text-xs text-red-500 mt-1">
                      {errors[participant.id]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Note */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Scores will be saved for all participating teams. 
            You can update scores multiple times as the game progresses.
          </p>
        </div>
      </div>
    </ModalLayout>
  );
}