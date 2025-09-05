import { TableColumn } from '@/lib/types/table';
import { Article } from '@/lib/types/articles';
import { Badge } from '@/components/ui/badge';
import { formatTableDate } from '@/lib/utils/date';
import { Pencil, Trash2, Eye, User, FileText } from 'lucide-react';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-muted text-muted-foreground';
    case 'review':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'revise':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'published':
      return 'bg-primary/10 text-primary';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'review':
      return 'Review';
    case 'approved':
      return 'Approved';
    case 'revise':
      return 'Revise';
    case 'cancelled':
      return 'Cancelled';
    case 'published':
      return 'Published';
    default:
      return status;
  }
};

export const getArticlesTableColumns = (): TableColumn<Article>[] => [
  {
    key: 'articleInfo',
    header: 'Article Information',
    sortable: false,
    width: '35%',
    render: (article: Article) => (
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <FileText className="text-primary h-5 w-5" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-foreground truncate">
            {article.title}
          </div>
          <div className="text-xs text-muted-foreground">
            {article.slug}
          </div>
        </div>
      </div>
    )
  },
  {
    key: 'author',
    header: 'Author',
    sortable: true,
    width: '20%',
    render: (article: Article) => (
      <div className="flex items-center space-x-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-foreground">{article.authored_by}</span>
      </div>
    )
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    width: '15%',
    render: (article: Article) => (
      <Badge className={`${getStatusColor(article.status)} border`}>
        {getStatusLabel(article.status)}
      </Badge>
    )
  },
  {
    key: 'created_at',
    header: 'Created',
    sortable: true,
    width: '15%',
    render: (article: Article) => (
      <div className="text-sm text-muted-foreground">
        {formatTableDate(article.created_at)}
      </div>
    )
  },
  {
    key: 'published_at',
    header: 'Published',
    sortable: true,
    width: '15%',
    render: (article: Article) => (
      <div className="space-y-1">
        {article.published_at ? (
          <>
            <div className="text-sm font-medium">
              {formatTableDate(article.published_at)}
            </div>
            {article.status === 'published' && (
              <div className="text-xs text-green-600">Live</div>
            )}
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            Not scheduled
          </div>
        )}
      </div>
    )
  }
];

export const getArticlesTableActions = (
  onDelete: (article: Article) => void,
  userRole: 'admin' | 'head-writer' | 'writer' = 'admin',
  onView?: (article: Article) => void
) => {
  const baseUrl = userRole === 'admin' ? '/admin' : userRole === 'head-writer' ? '/head-writer' : '/writer';
  
  return [
    ...(onView ? [{
      key: 'view',
      label: 'View Article',
      icon: <Eye className="h-4 w-4" />,
      onClick: onView,
      variant: 'ghost' as const,
      size: 'sm' as const
    }] : []),
    {
      key: 'edit',
      label: 'Edit Article',
      icon: <Pencil className="h-4 w-4" />,
      onClick: (article: Article) => {
        // For writers, only allow editing articles with 'revise' status
        if (userRole === 'writer' && article.status !== 'revise') {
          return;
        }
        window.location.href = `${baseUrl}/articles/${article.id}`;
      },
      variant: 'ghost' as const,
      size: 'sm' as const,
      disabled: (article: Article) => userRole === 'writer' && article.status !== 'revise'
    },
    ...(userRole !== 'writer' ? [{
      key: 'delete',
      label: 'Delete Article',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onDelete,
      variant: 'ghost' as const,
      size: 'sm' as const
    }] : [])
  ];
};
