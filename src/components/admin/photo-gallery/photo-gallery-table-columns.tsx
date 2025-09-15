import { TableColumn, TableAction } from '@/lib/types/table';
import { PhotoGallery } from '@/lib/types/photo-gallery';
import { Calendar, User, Tag, Eye, Edit, Trash2 } from 'lucide-react';

export const getPhotoGalleryColumns = (): TableColumn<PhotoGallery>[] => [
  {
    key: 'id',
    header: 'ID',
    sortable: true,
    width: '80px',
    render: (photo) => <span className="text-sm">{photo.id}</span>,
  },
  {
    key: 'photo_url',
    header: 'Photo',
    sortable: false,
    width: '120px',
    render: (photo) => (
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.photo_url}
          alt={photo.title}
          className="w-full h-full object-cover"
        />
      </div>
    ),
  },
  {
    key: 'title',
    header: 'Title',
    sortable: true,
    render: (photo) => <span className="font-medium">{photo.title}</span>,
  },
  {
    key: 'category',
    header: 'Category',
    sortable: true,
    render: (photo) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <Tag className="w-3 h-3 mr-1" />
        {photo.category}
      </span>
    ),
  },
  {
    key: 'photo_by',
    header: 'Photographer',
    sortable: true,
    render: (photo) => (
      <span className="inline-flex items-center text-sm text-gray-600">
        <User className="w-4 h-4 mr-1" />
        {photo.photo_by}
      </span>
    ),
  },
  {
    key: 'created_at',
    header: 'Created',
    sortable: true,
    render: (photo) => (
      <span className="inline-flex items-center text-sm text-gray-500">
        <Calendar className="w-4 h-4 mr-1" />
        {new Date(photo.created_at).toLocaleDateString()}
      </span>
    ),
  },
];

export const getPhotoGalleryActions = (): TableAction<PhotoGallery>[] => [
  {
    key: 'view',
    label: 'View',
    icon: <Eye className="w-4 h-4" />,
    variant: 'ghost',
    onClick: (photo) => {
      // This will be handled by the parent component
      console.log('View photo:', photo.id);
    },
  },
  {
    key: 'edit',
    label: 'Edit',
    icon: <Edit className="w-4 h-4" />,
    variant: 'ghost',
    onClick: (photo) => {
      // This will be handled by the parent component
      console.log('Edit photo:', photo.id);
    },
  },
  {
    key: 'delete',
    label: 'Delete',
    icon: <Trash2 className="w-4 h-4" />,
    variant: 'ghost',
    onClick: (photo) => {
      // This will be handled by the parent component
      console.log('Delete photo:', photo.id);
    },
  },
];
