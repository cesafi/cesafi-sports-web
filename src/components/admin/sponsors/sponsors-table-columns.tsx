import { Calendar, Pencil, Trash2 } from 'lucide-react';
import { TableColumn } from '@/lib/types/table';
import { Sponsor } from '@/lib/types/sponsors';
import { Badge } from '@/components/ui/badge';
import { formatTableDate } from '@/lib/utils/date';
import Image from 'next/image';

export const getSponsorsTableColumns = (): TableColumn<Sponsor>[] => [
  {
    key: 'sponsorInfo',
    header: 'Sponsor Information',
    sortable: false,
    width: '50%',
    render: (sponsor: Sponsor) => (
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted">
            {sponsor.logo_url ? (
              <Image
                src={sponsor.logo_url}
                alt={sponsor.title}
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
          <p className="truncate text-sm font-medium">{sponsor.title}</p>
          <p className="text-muted-foreground truncate text-xs">{sponsor.tagline}</p>
        </div>
      </div>
    )
  },
  {
    key: 'title',
    header: 'Title',
    sortable: true,
    width: '25%',
    render: (sponsor: Sponsor) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{sponsor.title}</p>
      </div>
    )
  },
  {
    key: 'is_active',
    header: 'Status',
    sortable: true,
    width: '15%',
    render: (sponsor: Sponsor) => (
      <Badge variant={sponsor.is_active ? 'default' : 'secondary'}>
        {sponsor.is_active ? 'Active' : 'Inactive'}
      </Badge>
    )
  },
  {
    key: 'created_at',
    header: 'Created',
    sortable: true,
    width: '10%',
    render: (sponsor: Sponsor) => (
      <div className="flex items-center text-muted-foreground">
        <Calendar className="mr-1 h-3 w-3" />
        <span className="text-xs">{formatTableDate(sponsor.created_at)}</span>
      </div>
    )
  }
];

export const getSponsorsTableActions = (
  onEdit: (sponsor: Sponsor) => void,
  onDelete: (sponsor: Sponsor) => void
) => [
  {
    key: 'edit',
    label: 'Edit Sponsor',
    icon: <Pencil className="h-4 w-4" />,
    onClick: onEdit,
    variant: 'ghost' as const,
    size: 'sm' as const
  },
  {
    key: 'delete',
    label: 'Delete Sponsor',
    icon: <Trash2 className="h-4 w-4" />,
    onClick: onDelete,
    variant: 'ghost' as const,
    size: 'sm' as const
  }
];
