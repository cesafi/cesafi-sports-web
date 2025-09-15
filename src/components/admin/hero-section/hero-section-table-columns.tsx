import { TableColumn, TableAction } from '@/lib/types/table';
import { HeroSectionLive } from '@/lib/types/hero-section';
import { Calendar, Clock, Eye, Edit, Trash2, Play } from 'lucide-react';

export const getHeroSectionColumns = (): TableColumn<HeroSectionLive>[] => [
  {
    key: 'id',
    header: 'ID',
    sortable: true,
    width: '80px',
    render: (hero) => <span className="text-sm">{hero.id}</span>,
  },
  {
    key: 'video_link',
    header: 'Video',
    sortable: false,
    width: '200px',
    render: (hero) => (
      <div className="flex items-center space-x-2">
        <div className="w-12 h-8 bg-red-100 rounded flex items-center justify-center">
          <Play className="w-4 h-4 text-red-600" />
        </div>
        <span className="text-sm text-gray-600 truncate max-w-32">
          {hero.video_link.split('/').pop()?.split('?')[0] || 'Video'}
        </span>
      </div>
    ),
  },
  {
    key: 'end_at',
    header: 'Expires',
    sortable: true,
    render: (hero) => {
      const endDate = new Date(hero.end_at);
      const now = new Date();
      const isExpired = endDate < now;
      const timeRemaining = endDate.getTime() - now.getTime();
      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      return (
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <div>
            <p className={`text-sm ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
              {endDate.toLocaleDateString()}
            </p>
            <p className={`text-xs ${isExpired ? 'text-red-500' : 'text-gray-500'}`}>
              {isExpired ? 'Expired' : `${days}d ${hours}h left`}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    key: 'created_at',
    header: 'Created',
    sortable: true,
    render: (hero) => (
      <span className="inline-flex items-center text-sm text-gray-500">
        <Clock className="w-4 h-4 mr-1" />
        {new Date(hero.created_at).toLocaleDateString()}
      </span>
    ),
  },
];

export const getHeroSectionActions = (): TableAction<HeroSectionLive>[] => [
  {
    key: 'view',
    label: 'View',
    icon: <Eye className="w-4 h-4" />,
    variant: 'ghost',
    onClick: (hero) => {
      // This will be handled by the parent component
      console.log('View hero section:', hero.id);
    },
  },
  {
    key: 'edit',
    label: 'Edit',
    icon: <Edit className="w-4 h-4" />,
    variant: 'ghost',
    onClick: (hero) => {
      // This will be handled by the parent component
      console.log('Edit hero section:', hero.id);
    },
  },
  {
    key: 'delete',
    label: 'Delete',
    icon: <Trash2 className="w-4 h-4" />,
    variant: 'ghost',
    onClick: (hero) => {
      // This will be handled by the parent component
      console.log('Delete hero section:', hero.id);
    },
  },
];
