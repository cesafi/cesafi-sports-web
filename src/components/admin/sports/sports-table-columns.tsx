import { TableColumn } from '@/lib/types/table';
import { Sport } from '@/lib/types/sports';
import { formatTableDate } from '@/lib/utils/date';
import { Pencil, Trash2 } from 'lucide-react';
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

  return <div className="text-muted-foreground text-sm">Categories: {count ?? '...'}</div>;
};

export const getSportsTableColumns = (): TableColumn<Sport>[] => [
  {
    key: 'name',
    header: 'Sport Name',
    sortable: true,
    width: '40%',
    render: (sport: Sport) => (
      <div className="flex flex-col space-y-1">
        <div className="text-foreground font-medium">{sport.name}</div>
        <CategoryCount sportId={sport.id} />
      </div>
    )
  },
  {
    key: 'created_at',
    header: 'Created',
    sortable: true,
    width: '30%',
    render: (sport: Sport) => (
      <div className="text-muted-foreground text-sm">{formatTableDate(sport.created_at)}</div>
    )
  },
  {
    key: 'updated_at',
    header: 'Last Updated',
    sortable: true,
    width: '30%',
    render: (sport: Sport) => (
      <div className="text-muted-foreground text-sm">{formatTableDate(sport.updated_at)}</div>
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
