import { Calendar, Hash, Pencil, Trash2 } from 'lucide-react';
import { TableColumn } from '@/lib/types/table';
import { Season } from '@/lib/types/seasons';
import { Badge } from '@/components/ui/badge';
import { formatTableDate } from '@/lib/utils/date';

export const getSeasonsTableColumns = (): TableColumn<Season>[] => [
  {
    key: 'id',
    header: 'Season ID',
    sortable: true,
    width: '20%',
    render: (season: Season) => (
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Hash className="text-blue-600 dark:text-blue-400 h-5 w-5" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            Season {season.id}
          </p>
        </div>
      </div>
    )
  },
  {
    key: 'seasonInfo',
    header: 'Season Information',
    sortable: false,
    width: '35%',
    render: (season: Season) => (
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-muted-foreground">
          {formatTableDate(season.start_at)} - {formatTableDate(season.end_at)}
        </p>
        <div className="text-muted-foreground flex items-center space-x-2 text-xs">
          <Calendar className="h-3 w-3" />
          <span>Duration: {Math.ceil((new Date(season.end_at).getTime() - new Date(season.start_at).getTime()) / (1000 * 60 * 60 * 24))} days</span>
        </div>
      </div>
    )
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    width: '25%',
    render: (season: Season) => {
      const now = new Date();
      const startDate = new Date(season.start_at);
      const endDate = new Date(season.end_at);
      
      let status = 'upcoming';
      let variant: 'default' | 'secondary' | 'outline' | 'destructive' = 'outline';
      
      if (now >= startDate && now <= endDate) {
        status = 'active';
        variant = 'default';
      } else if (now > endDate) {
        status = 'completed';
        variant = 'secondary';
      } else if (now < startDate) {
        status = 'upcoming';
        variant = 'outline';
      }
      
      return (
        <Badge variant={variant} className="capitalize">
          {status}
        </Badge>
      );
    }
  },
  {
    key: 'created_at',
    header: 'Created',
    sortable: true,
    width: '20%',
    render: (season: Season) => (
      <div className="text-muted-foreground text-sm">
        {formatTableDate(season.created_at)}
      </div>
    )
  }
];

export const getSeasonsTableActions = (
  onEdit: (season: Season) => void,
  onDelete: (season: Season) => void
) => [
  {
    key: 'edit',
    label: 'Edit Season',
    icon: <Pencil className="h-4 w-4" />,
    onClick: onEdit,
    variant: 'ghost' as const,
    size: 'sm' as const
  },
  {
    key: 'delete',
    label: 'Delete Season',
    icon: <Trash2 className="h-4 w-4" />,
    onClick: onDelete,
    variant: 'ghost' as const,
    size: 'sm' as const,
    disabled: () => {
      // Allow deletion of all seasons but show enhanced confirmation for active ones
      return false;
    }
  }
];
