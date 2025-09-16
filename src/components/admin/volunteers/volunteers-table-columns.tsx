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
    width: '40%',
    render: (volunteer: Volunteer) => (
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted overflow-hidden">
            {volunteer.image_url ? (
              <Image
                src={volunteer.image_url}
                alt={volunteer.full_name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <User className="text-muted-foreground h-5 w-5" />
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-foreground truncate">{volunteer.full_name}</div>
          <div className="text-xs text-muted-foreground">Volunteer</div>
        </div>
      </div>
    )
  },
  {
    key: 'department_id',
    header: 'Department',
    sortable: true,
    width: '25%',
    render: (volunteer: Volunteer) => {
      if (!volunteer.department_id) {
        return <Badge className="bg-muted text-muted-foreground border-muted border">No Department</Badge>;
      }

      const department = departments?.find((dept) => dept.id === volunteer.department_id);
      return (
        <Badge className="bg-purple-100 text-purple-800 border-purple-200 border">
          {department ? department.name : `Dept ${volunteer.department_id}`}
        </Badge>
      );
    }
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    width: '20%',
    render: (volunteer: Volunteer) => (
      <Badge 
        className={`${volunteer.is_active 
          ? 'bg-green-100 text-green-800 border-green-200' 
          : 'bg-muted text-muted-foreground border-muted'
        } border`}
      >
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
      <div className="text-sm text-muted-foreground">
        {formatTableDate(volunteer.created_at)}
      </div>
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