import { Calendar, Pencil, Trash2 } from 'lucide-react';
import { TableColumn } from '@/lib/types/table';
import { School } from '@/lib/types/schools';
import { Badge } from '@/components/ui/badge';
import { formatTableDate } from '@/lib/utils/date';
import Image from 'next/image';

export const getSchoolsTableColumns = (): TableColumn<School>[] => [
  {
    key: 'name',
    header: 'School Name',
    sortable: true,
    width: '45%',
    render: (school: School) => (
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            {school.logo_url ? (
              <Image
                src={school.logo_url}
                alt={school.name}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <Image
                src="/img/cesafi-logo.webp"
                alt="CESAFI Logo"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{school.name}</p>
          <p className="text-muted-foreground truncate text-xs">{school.abbreviation}</p>
        </div>
      </div>
    )
  },
  {
    key: 'abbreviation',
    header: 'Abbreviation',
    sortable: true,
    width: '20%',
    render: (school: School) => (
      <Badge variant="secondary" className="font-mono capitalize">
        {school.abbreviation}
      </Badge>
    )
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    width: '20%',
    render: (school: School) => (
      <Badge variant={school.is_active ? 'default' : 'secondary'} className="capitalize">
        {school.is_active ? 'Active' : 'Inactive'}
      </Badge>
    )
  },
  {
    key: 'created_at',
    header: 'Created',
    sortable: true,
    width: '15%',
    render: (school: School) => (
      <div className="text-muted-foreground flex items-center space-x-2 text-xs">
        <Calendar className="h-3 w-3" />
        <span>{formatTableDate(school.created_at)}</span>
      </div>
    )
  }
];

export const getSchoolsTableActions = (
  onEdit: (school: School) => void,
  onDelete: (school: School) => void
) => [
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
