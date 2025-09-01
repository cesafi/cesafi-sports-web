'use client';

import { useState } from 'react';
import { DataTable } from '@/components/table';
import { MatchGameModal, MatchGameScoresModal, getMatchGamesTableColumns, getMatchGamesTableActions } from '@/components/admin/matches';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { GameWithDetails, GameInsert, GameUpdate } from '@/lib/types/games';
import { GameScoreInsert, GameScoreUpdate } from '@/lib/types/game-scores';
import { useGamesTable } from '@/hooks/use-games';
import { useGameScoresByGameId, useCreateGameScore, useUpdateGameScore } from '@/hooks/use-game-scores';
import { useMatchParticipantsDetails } from '@/hooks/use-match-participants-details';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Target, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MatchGamesTableProps {
  matchId: number;
  isLoading?: boolean;
}

export function MatchGamesTable({ matchId, isLoading: externalLoading }: MatchGamesTableProps) {
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [gameModalMode, setGameModalMode] = useState<'add' | 'edit'>('add');
  const [editingGame, setEditingGame] = useState<GameWithDetails | undefined>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<GameWithDetails | undefined>();
  const [isScoresModalOpen, setIsScoresModalOpen] = useState(false);
  const [scoresGame, setScoresGame] = useState<GameWithDetails | undefined>();

  // Fetch games for this match
  const {
    games,
    totalCount,
    pageCount,
    currentPage,
    pageSize,
    loading: gamesLoading,
    tableBodyLoading,
    error: gamesError,
    createGame,
    updateGame,
    deleteGame,
    isCreating,
    isUpdating,
    isDeleting,
    onPageChange,
    onPageSizeChange,
    onSortChange,
    onSearchChange,
    onFiltersChange
  } = useGamesTable(matchId, {
    onGameCreated: () => {
      setIsGameModalOpen(false);
      setEditingGame(undefined);
    },
    onGameUpdated: () => {
      setIsGameModalOpen(false);
      setEditingGame(undefined);
    },
    onGameDeleted: () => {
      setIsDeleteModalOpen(false);
      setGameToDelete(undefined);
    }
  });

  // Fetch match participants for scores modal
  const { data: participants = [] } = useMatchParticipantsDetails(matchId);

  // Fetch game scores for the selected game
  const { data: gameScores = [] } = useGameScoresByGameId(scoresGame?.id || 0);

  // Game score mutations
  const createGameScoreMutation = useCreateGameScore();
  const updateGameScoreMutation = useUpdateGameScore();

  const handleEditGame = (game: GameWithDetails) => {
    setEditingGame(game);
    setGameModalMode('edit');
    setIsGameModalOpen(true);
  };

  const handleDeleteGame = (game: GameWithDetails) => {
    setGameToDelete(game);
    setIsDeleteModalOpen(true);
  };

  const handleManageScores = (game: GameWithDetails) => {
    setScoresGame(game);
    setIsScoresModalOpen(true);
  };

  const handleUpdateGame = async (gameUpdate: GameUpdate) => {
    try {
      await updateGame(gameUpdate);
      toast.success('Game updated successfully');
    } catch (error) {
      toast.error('Failed to update game');
      throw error;
    }
  };

  const confirmDeleteGame = async () => {
    if (!gameToDelete) return;
    deleteGame(gameToDelete.id);
  };

  const handleGameSubmit = async (data: GameInsert | GameUpdate) => {
    if (gameModalMode === 'add') {
      createGame(data as GameInsert);
    } else {
      updateGame(data as GameUpdate);
    }
  };

  const handleSaveScores = async (scores: (GameScoreInsert | GameScoreUpdate)[]) => {
    try {
      // Process each score
      for (const score of scores) {
        if ('id' in score && score.id) {
          // Update existing score
          await updateGameScoreMutation.mutateAsync(score);
        } else {
          // Create new score
          await createGameScoreMutation.mutateAsync(score as GameScoreInsert);
        }
      }
      
      toast.success('Game scores saved successfully');
      setIsScoresModalOpen(false);
      setScoresGame(undefined);
    } catch (error) {
      toast.error('Failed to save game scores');
      throw error;
    }
  };

  // Use the match games table columns and actions
  const columns = getMatchGamesTableColumns();
  const actions = getMatchGamesTableActions(handleEditGame, handleDeleteGame, handleManageScores);

  const loading = externalLoading || gamesLoading;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Games</h3>
            <p className="text-sm text-muted-foreground">Loading games for this match...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64 border rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading games...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="h-6 w-6 text-primary" />
              Games
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Managing games for this match • {games.length} game{games.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Button
            onClick={() => {
              setGameModalMode('add');
              setEditingGame(undefined);
              setIsGameModalOpen(true);
            }}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Game
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          data={games}
          totalCount={totalCount}
          loading={false}
          tableBodyLoading={tableBodyLoading}
          error={gamesError}
          columns={columns}
          actions={actions}
          currentPage={currentPage}
          pageCount={pageCount}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onSortChange={onSortChange}
          onSearchChange={onSearchChange}
          onFiltersChange={onFiltersChange}
          title=""
          subtitle=""
          searchPlaceholder="Search games..."
          showSearch={true}
          showFilters={false}
          addButton={undefined}
          className=""
          emptyMessage="No games found for this match"
        />
      </CardContent>

      {/* Game Modal */}
      <MatchGameModal
        open={isGameModalOpen}
        onOpenChange={setIsGameModalOpen}
        mode={gameModalMode}
        game={editingGame}
        matchId={matchId}
        onSubmit={handleGameSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Game Scores Modal */}
      {scoresGame && (
        <MatchGameScoresModal
          open={isScoresModalOpen}
          onOpenChange={setIsScoresModalOpen}
          game={scoresGame}
          participants={participants}
          gameScores={gameScores}
          onSaveScores={handleSaveScores}
          onUpdateGame={handleUpdateGame}
          isSubmitting={createGameScoreMutation.isPending || updateGameScoreMutation.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteGame}
        type="delete"
        title="Delete Game"
        message={`Are you sure you want to delete game ${gameToDelete?.game_number}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        destructive={true}
        isLoading={isDeleting}
      />
    </Card>
  );
}