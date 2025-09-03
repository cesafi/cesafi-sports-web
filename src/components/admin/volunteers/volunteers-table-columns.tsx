import { TableColumn } from '@/lib/types/table';
import { Volunteer } from '@/lib/types/volunteers';
import { Department } from '@/lib/types/departments';
import { Badge } from '@/components/ui/badge';
import { formatTableDate } from '@/lib/utils/date';
import { Pencil, Trash2, User } from 'lucide-react';
import Image from 'next/image';

export const getVolunteersTableColumns = (departments?: Department[]): TableColumn<Volunteer>[] => [
  {
    key: 'volunteerInfo',
    header: 'Volunteer Information',
    sortable: false,
    width: '50%',
    render: (volunteer: Volunteer) => (
      <div className="flex items-center space-x-3">
        <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
          {volunteer.image_url ? (
            <Image
              src={volunteer.image_url}
              alt={volunteer.full_name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <User className="text-muted-foreground h-5 w-5" />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm leading-none font-medium">{volunteer.full_name}</p>
        </div>
      </div>
    )
  },
  {
    key: 'department_id',
    header: 'Department',
    sortable: true,
    width: '20%',
    render: (volunteer: Volunteer) => {
      if (!volunteer.department_id) {
        return <span className="text-muted-foreground text-sm">No Department</span>;
      }

      const department = departments?.find((dept) => dept.id === volunteer.department_id);
      return (
        <span className="text-sm font-medium">
          {department ? department.name : `Dept ${volunteer.department_id}`}
        </span>
      );
    }
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    width: '20%',
    render: (volunteer: Volunteer) => (
      <Badge variant={volunteer.is_active ? 'default' : 'secondary'} className="capitalize">
        {volunteer.is_active ? 'Active' : 'Inactive'}
      </Badge>
    )
  },
  {
    key: 'created_at',
    header: 'Created',
    sortable: true,
    width: '15%',
    render: (volunteer: Volunteer) => (
      <span className="text-muted-foreground text-sm">{formatTableDate(volunteer.created_at)}</span>
    )
  }
];

export const getVolunteersTableActions = (
  onEdit: (volunteer: Volunteer) => void,
  onDelete: (volunteer: Volunteer) => void
) => [
  {
    key: 'edit',
    label: 'Edit Volunteer',
    icon: <Pencil className="h-4 w-4" />,
    onClick: onEdit,
    variant: 'ghost' as const,
    size: 'sm' as const
  },
  {
    key: 'delete',
    label: 'Delete Volunteer',
    icon: <Trash2 className="h-4 w-4" />,
    onClick: onDelete,
    variant: 'ghost' as const,
    size: 'sm' as const
  }
];
