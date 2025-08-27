import { TableColumn } from '@/lib/types/table';
import { SportsSeasonsStage } from '@/lib/types/sports-seasons-stages';
import { formatTableDate } from '@/lib/utils/date';
import { Pencil, Trash2, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSportById } from '@/actions/sports';
import { getSportCategoryById } from '@/actions/sport-categories';
import { formatCategoryName } from '@/lib/utils/sports';

const SportInfo = ({ sportCategoryId }: { sportCategoryId: number | null }) => {
  const [sportName, setSportName] = useState<string>('');
  const [categoryInfo, setCategoryInfo] = useState<string>('');

  useEffect(() => {
    const fetchSportInfo = async () => {
      if (!sportCategoryId) return;
      
      try {
        const categoryResult = await getSportCategoryById(sportCategoryId);
        if (categoryResult.success && categoryResult.data) {
          const category = categoryResult.data;
          setCategoryInfo(formatCategoryName(category.division, category.levels));
          
          const sportResult = await getSportById(category.sport_id);
          if (sportResult.success && sportResult.data) {
            setSportName(sportResult.data.name);
          }
        }
      } catch (error) {
        console.error('Failed to fetch sport info:', error);
      }
    };

    fetchSportInfo();
  }, [sportCategoryId]);

  if (!sportCategoryId) return <span className="text-muted-foreground">N/A</span>;

  return (
    <div className="space-y-1">
      <div className="text-sm font-medium">{sportName || 'Loading...'}</div>
      <div className="text-xs text-muted-foreground">{categoryInfo || 'Loading...'}</div>
    </div>
  );
};

export const getLeagueStageTableColumns = (): TableColumn<SportsSeasonsStage>[] => [
  {
    key: 'stageInfo',
    header: 'Stage Information',
    sortable: false,
    width: '35%',
    render: (stage: SportsSeasonsStage) => (
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Trophy className="text-blue-600 dark:text-blue-400 h-5 w-5" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-foreground capitalize">
            {stage.competition_stage.replace('_', ' ')}
          </div>
          <div className="text-xs text-muted-foreground">
            Stage ID: {stage.id}
          </div>
        </div>
      </div>
    )
  },
  {
    key: 'sportInfo',
    header: 'Sport & Category',
    sortable: false,
    width: '35%',
    render: (stage: SportsSeasonsStage) => (
      <SportInfo sportCategoryId={stage.sport_category_id} />
    )
  },
  {
    key: 'seasonInfo',
    header: 'Season',
    sortable: false,
    width: '15%',
    render: (stage: SportsSeasonsStage) => (
      <div className="text-sm">
        Season {stage.season_id || 'N/A'}
      </div>
    )
  },
  {
    key: 'created_at',
    header: 'Created',
    sortable: true,
    width: '15%',
    render: (stage: SportsSeasonsStage) => (
      <div className="text-muted-foreground text-sm">
        {formatTableDate(stage.created_at)}
      </div>
    )
  }
];

export const getLeagueStageTableActions = (
  onEdit: (stage: SportsSeasonsStage) => void,
  onDelete: (stage: SportsSeasonsStage) => void
) => [
  {
    key: 'edit',
    label: 'Edit Stage',
    icon: <Pencil className="h-4 w-4" />,
    onClick: onEdit,
    variant: 'ghost' as const,
    size: 'sm' as const
  },
  {
    key: 'delete',
    label: 'Delete Stage',
    icon: <Trash2 className="h-4 w-4" />,
    onClick: onDelete,
    variant: 'ghost' as const,
    size: 'sm' as const
  }
];
