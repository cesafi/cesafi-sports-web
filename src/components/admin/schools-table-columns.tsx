import { Building, Calendar, Eye, Pencil, Trash2 } from 'lucide-react';
import { TableColumn, BaseEntity } from '@/lib/types/table';
import { School } from '@/lib/types/schools';
import { Badge } from '@/components/ui/badge';
import { formatTableDate } from '@/lib/utils/date';

// Ensure School extends BaseEntity for table compatibility
type SchoolEntity = School & BaseEntity;

export const getSchoolsTableColumns = (): TableColumn<SchoolEntity>[] => [
  {
    key: 'schoolInfo',
    header: 'School Information',
    sortable: false,
    width: '50%',
    render: (school: SchoolEntity) => (
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Building className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {school.name}
          </p>
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="h-3 w-3" />
            <span>Created {formatTableDate(String(school.createdAt))}</span>
          </div>
        </div>
      </div>
    )
  },
  {
    key: 'abbreviation',
    header: 'Abbreviation',
    sortable: true,
    width: '25%',
    render: (school: SchoolEntity) => (
      <Badge variant="outline" className="font-mono">
        {school.abbreviation}
      </Badge>
    )
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    width: '25%',
    render: (school: SchoolEntity) => (
      <Badge 
        variant={school.isActive ? 'default' : 'secondary'}
        className="capitalize"
      >
        {school.isActive ? 'Active' : 'Inactive'}
      </Badge>
    )
  }
];

export const getSchoolsTableActions = (
  onView: (school: SchoolEntity) => void,
  onEdit: (school: SchoolEntity) => void,
  onDelete: (school: SchoolEntity) => void
) => [
  {
    key: 'view',
    label: 'View School',
    icon: <Eye className="h-4 w-4" />,
    onClick: onView,
    variant: 'ghost' as const,
    size: 'sm' as const
  },
  {
    key: 'edit',
    label: 'Edit School',
    icon: <Pencil className="h-4 w-4" />,
    onClick: onEdit,
    variant: 'ghost' as const,
    size: 'sm' as const
  },
  {
    key: 'delete',
    label: 'Delete School',
    icon: <Trash2 className="h-4 w-4" />,
    onClick: onDelete,
    variant: 'ghost' as const,
    size: 'sm' as const
  }
];
