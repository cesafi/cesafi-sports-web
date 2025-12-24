import { TableColumn } from '@/lib/types/table';
import { Timeline } from '@/lib/types/timeline';
import { Badge } from '@/components/ui/badge';
import { formatTableDate } from '@/lib/utils/date';
import { Eye, Edit, Trash2, Star, StarOff } from 'lucide-react';
import Image from 'next/image';

export const timelineTableColumns: TableColumn<Timeline>[] = [
  {
    key: 'image',
    header: 'Image',
    width: '80px',
    render: (timeline) => (
      <div className="relative h-12 w-12 rounded-lg overflow-hidden">
        <Image
          src={timeline.image_url}
          alt={timeline.title}
          fill
          className="object-cover"
          sizes="48px"
        />
      </div>
    )
  },
  {
    key: 'year',
    header: 'Year',
    sortable: true,
    width: '100px',
    render: (timeline) => (
      <div className="font-mono text-sm font-medium">
        {timeline.year}
      </div>
    )
  },
  {
    key: 'title',
    header: 'Title',
    sortable: true,
    render: (timeline) => (
      <div className="space-y-1">
        <div className="font-semibold text-sm line-clamp-2">
          {timeline.title}
        </div>
        <div className="text-xs text-muted-foreground line-clamp-2">
          {timeline.description}
        </div>
      </div>
    )
  },
  {
    key: 'category',
    header: 'Category',
    sortable: true,
    width: '120px',
    render: (timeline) => (
      <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
        {timeline.category.charAt(0).toUpperCase() + timeline.category.slice(1)}
      </Badge>
    )
  },
  {
    key: 'is_highlight',
    header: 'Highlight',
    sortable: true,
    width: '100px',
    render: (timeline) => (
      <div className="flex items-center justify-center">
        {timeline.is_highlight ? (
          <Star className="h-4 w-4 text-yellow-500 fill-current" />
        ) : (
          <StarOff className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    )
  },
  {
    key: 'created_at',
    header: 'Created',
    sortable: true,
    width: '120px',
    render: (timeline) => (
      <div className="text-sm text-muted-foreground">
        {formatTableDate(timeline.created_at)}
      </div>
    )
  }
];

export const getTimelineActions = (
  onView: (timeline: Timeline) => void,
  onEdit: (timeline: Timeline) => void,
  onDelete: (timeline: Timeline) => void,
  onToggleHighlight: (timeline: Timeline) => void
) => [
  {
    key: 'view',
    label: 'View',
    icon: <Eye className="h-4 w-4" />,
    onClick: onView,
    variant: 'ghost' as const,
    size: 'sm' as const
  },
  {
    key: 'edit',
    label: 'Edit',
    icon: <Edit className="h-4 w-4" />,
    onClick: onEdit,
    variant: 'ghost' as const,
    size: 'sm' as const
  },
  {
    key: 'toggle-highlight',
    label: 'Toggle Highlight',
    icon: <Star className="h-4 w-4" />,
    onClick: onToggleHighlight,
    variant: 'accent' as const,
    size: 'sm' as const
  },
  {
    key: 'delete',
    label: 'Delete',
    icon: <Trash2 className="h-4 w-4" />,
    onClick: onDelete,
    variant: 'ghost' as const,
    size: 'sm' as const
  }
];
