import { Faq } from '@/lib/types/faq';
import { TableColumn, TableAction } from '@/lib/types/table';
import { Eye, Edit, Trash2, Star } from 'lucide-react';

export const getFaqColumns = (): TableColumn<Faq>[] => [
  {
    key: 'display_order',
    header: 'Order',
    width: '80px',
    render: (faq) => (
      <div className="text-center font-medium">
        {faq.display_order}
      </div>
    ),
  },
  {
    key: 'question',
    header: 'Question',
    render: (faq) => (
      <div className="max-w-xs truncate font-medium" title={faq.question}>
        {faq.question}
      </div>
    ),
  },
  {
    key: 'answer',
    header: 'Answer',
    render: (faq) => (
      <div className="max-w-xs truncate text-muted-foreground" title={faq.answer}>
        {faq.answer}
      </div>
    ),
  },
  {
    key: 'is_open',
    header: 'Default Open',
    width: '120px',
    render: (faq) => (
      <div className="text-center">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          faq.is_open 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }`}>
          {faq.is_open ? 'Yes' : 'No'}
        </span>
      </div>
    ),
  },
  {
    key: 'is_active',
    header: 'Status',
    width: '100px',
    render: (faq) => (
      <div className="text-center">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          faq.is_active 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {faq.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
    ),
  },
  {
    key: 'created_at',
    header: 'Created',
    width: '120px',
    render: (faq) => (
      <div className="text-sm text-muted-foreground">
        {new Date(faq.created_at).toLocaleDateString()}
      </div>
    ),
  },
];

export const getFaqActions = (onView: (faq: Faq) => void, onEdit: (faq: Faq) => void, onDelete: (faq: Faq) => void, onToggleHighlight: (faq: Faq) => void): TableAction<Faq>[] => [
  {
    key: 'view',
    label: 'View',
    icon: <Eye className="h-4 w-4" />,
    onClick: onView,
    variant: 'ghost',
    size: 'sm',
  },
  {
    key: 'edit',
    label: 'Edit',
    icon: <Edit className="h-4 w-4" />,
    onClick: onEdit,
    variant: 'ghost',
    size: 'sm',
  },
  {
    key: 'toggle-highlight',
    label: 'Toggle Default Open',
    icon: <Star className="h-4 w-4" />,
    onClick: onToggleHighlight,
    variant: 'ghost',
    size: 'sm',
  },
  {
    key: 'delete',
    label: 'Delete',
    icon: <Trash2 className="h-4 w-4" />,
    onClick: onDelete,
    variant: 'destructive',
    size: 'sm',
  },
];
