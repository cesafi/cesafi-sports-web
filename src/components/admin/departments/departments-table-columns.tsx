import { TableColumn } from '@/lib/types/table';
import { Department } from '@/lib/types/departments';
import { formatTableDate } from '@/lib/utils/date';
import { Pencil, Trash2 } from 'lucide-react';

export const getDepartmentsTableColumns = (): TableColumn<Department>[] => [
  {
    key: 'departmentInfo',
    header: 'Department Information',
    sortable: false,
    width: '60%',
    render: (department: Department) => (
      <div className="flex flex-col space-y-1">
        <div className="font-medium text-sm">{department.name}</div>
      </div>
    )
  },
  {
    key: 'created_at',
    header: 'Created',
    sortable: true,
    width: '40%',
    render: (department: Department) => (
      <div className="text-sm text-muted-foreground">
        {formatTableDate(department.created_at)}
      </div>
    )
  }
];

export const getDepartmentsTableActions = (
  onEdit: (department: Department) => void,
  onDelete: (department: Department) => void
) => [
  {
    key: 'edit',
    label: 'Edit Department',
    icon: <Pencil className="h-4 w-4" />,
    onClick: onEdit,
    variant: 'ghost' as const,
    size: 'sm' as const
  },
  {
    key: 'delete',
    label: 'Delete Department',
    icon: <Trash2 className="h-4 w-4" />,
    onClick: onDelete,
    variant: 'ghost' as const,
    size: 'sm' as const
  }
];
