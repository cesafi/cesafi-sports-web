'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MatchStatusModal } from './match-status-modal';
import { MatchWithFullDetails, MatchUpdate } from '@/lib/types/matches';
import { updateMatch } from '@/actions/matches';

// Example usage of the MatchStatusModal with scores
export function MatchStatusModalExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Example match data - in real usage this would come from your database
  const exampleMatch: MatchWithFullDetails = {
    id: 1,
    name: 'USC vs UC',
    description: 'Basketball match between USC and UC',
    venue: 'USC Gymnasium',
    scheduled_at: '2024-01-15T14:00:00Z',
    start_at: null,
    end_at: null,
    best_of: 1,
    stage_id: 1,
    status: 'upcoming',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    sports_seasons_stages: {
      id: 1,
      competition_stage: 'elimination',
      season_id: 1,
      sport_category_id: 1,
      sports_categories: {
        id: 1,
        division: 'college',
        levels: 'college',
        sports: {
          id: 1,
          name: 'Basketball'
        }
      },
      seasons: {
        id: 1,
        start_at: '2024-01-01T00:00:00Z',
        end_at: '2024-12-31T23:59:59Z'
      }
    },
    match_participants: [
      {
        id: 1,
        match_id: 1,
        team_id: 'team-1',
        match_score: null,
        schools_teams: {
          id: 'team-1',
          name: 'Trojans',
          schools: {
            name: 'University of San Carlos',
            abbreviation: 'USC',
            logo_url: null
          }
        }
      },
      {
        id: 2,
        match_id: 1,
        team_id: 'team-2',
        match_score: null,
        schools_teams: {
          id: 'team-2',
          name: 'Warriors',
          schools: {
            name: 'University of Cebu',
            abbreviation: 'UC',
            logo_url: null
          }
        }
      }
    ]
  };

  const handleUpdateMatch = async (data: MatchUpdate) => {
    setIsSubmitting(true);
    try {
      await updateMatch(data);
      // Handle success
    } catch (error) {
      console.error('Failed to update match:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Match Status Modal Example</h2>
      <p className="text-muted-foreground mb-4">
        This example shows how to use the MatchStatusModal with integrated score management.
      </p>
      
      <Button onClick={() => setIsModalOpen(true)}>
        Open Match Status Modal
      </Button>

      <MatchStatusModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        match={exampleMatch}
        onUpdateMatch={handleUpdateMatch}
        isSubmitting={isSubmitting}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Features:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>✅ Match status management (upcoming, ongoing, finished, cancelled)</li>
          <li>✅ Timing controls (scheduled, start, end times)</li>
          <li>✅ Score input for each team</li>
          <li>✅ Automatic winner calculation</li>
          <li>✅ Real-time score validation</li>
          <li>✅ Database integration for score updates</li>
        </ul>
      </div>
    </div>
  );
}
