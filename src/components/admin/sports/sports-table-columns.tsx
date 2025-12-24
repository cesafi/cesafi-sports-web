import { TableColumn } from '@/lib/types/table';
import { Sport } from '@/lib/types/sports';
import { formatTableDate } from '@/lib/utils/date';
import { Pencil, Trash2, Trophy } from 'lucide-react';
import { getCategoryCountBySportId } from '@/actions/sport-categories';
import { useEffect, useState } from 'react';

const CategoryCount = ({ sportId }: { sportId: number }) => {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const result = await getCategoryCountBySportId(sportId);
        if (result.success) {
          setCount(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch category count:', error);
      }
    };

    fetchCount();
  }, [sportId]);

  return <div className="text-xs text-muted-foreground">Categories: {count ?? '...'}</div>;
};

export const getSportsTableColumns = (): TableColumn<Sport>[] => [
  {
    key: 'sportInfo',
    header: 'Sport Information',
    sortable: false,
    width: '40%',
    render: (sport: Sport) => (
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="text-primary h-5 w-5" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-foreground truncate">{sport.name}</div>
          <CategoryCount sportId={sport.id} />
        </div>
      </div>
    )
  },
  {
    key: 'created_at',
    header: 'Created',
    sortable: true,
    width: '30%',
    render: (sport: Sport) => (
      <div className="text-sm text-muted-foreground">
        {formatTableDate(sport.created_at)}
      </div>
    )
  },
  {
    key: 'updated_at',
    header: 'Last Updated',
    sortable: true,
    width: '30%',
    render: (sport: Sport) => (
      <div className="text-sm text-muted-foreground">
        {formatTableDate(sport.updated_at)}
      </div>
    )
  }
];

export const getSportsTableActions = (
  onEdit: (sport: Sport) => void,
  onDelete: (sport: Sport) => void
) => [
  {
    key: 'edit',
    label: 'Edit Sport',
    icon: <Pencil className="h-4 w-4" />,
    onClick: onEdit,
    variant: 'ghost' as const,
    size: 'sm' as const
  },
  {
    key: 'delete',
    label: 'Delete Sport',
    icon: <Trash2 className="h-4 w-4" />,
    onClick: onDelete,
    variant: 'ghost' as const,
    size: 'sm' as const
  }
];