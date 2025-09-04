import { TableColumn } from '@/lib/types/table';
import { Article } from '@/lib/types/articles';
import { Badge } from '@/components/ui/badge';
import { formatTableDate } from '@/lib/utils/date';
import { Pencil, Trash2, Eye } from 'lucide-react';

// Configuration interface for different user roles
export interface ArticleTableConfig {
  showAuthorId?: boolean;
  showActions?: boolean;
  showViewAction?: boolean;
  showEditAction?: boolean;
  showDeleteAction?: boolean;
  customActions?: Array<{
    key: string;
    label: string;
    icon: React.ReactNode;
    onClick: (article: Article) => void;
    variant?: 'ghost' | 'default' | 'destructive' | 'outline' | 'secondary' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
  }>;
}

// Default configuration for admin users
const defaultAdminConfig: ArticleTableConfig = {
  showAuthorId: true,
  showActions: true,
  showViewAction: false,
  showEditAction: true,
  showDeleteAction: true
};

export const getArticlesTableColumns = (config: ArticleTableConfig = defaultAdminConfig): TableColumn<Article>[] => [
  {
    key: 'articleInfo',
    header: 'Article Information',
    sortable: false,
    width: '40%',
    render: (article: Article) => (
      <div className="flex flex-col space-y-1">
        <div className="font-medium text-sm">{article.title}</div>
        {config.showAuthorId && (
          <div className="text-xs text-muted-foreground">
            Author ID: {article.authored_by}
          </div>
        )}
      </div>
    )
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    width: '15%',
    render: (article: Article) => {
      const statusColors = {
        review: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        revise: 'bg-orange-100 text-orange-800',
        cancelled: 'bg-red-100 text-red-800',
        published: 'bg-blue-100 text-blue-800'
      };
      
      return (
        <Badge className={statusColors[article.status] || 'bg-gray-100 text-gray-800'}>
          {article.status}
        </Badge>
      );
    }
  },
  {
    key: 'published',
    header: 'Published',
    sortable: true,
    width: '15%',
    render: (article: Article) => (
      <Badge variant={article.published_at ? 'default' : 'secondary'}>
        {article.published_at ? 'Yes' : 'No'}
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
    header: 'Published At',
    sortable: true,
    width: '15%',
    render: (article: Article) => (
      <div className="text-sm text-muted-foreground">
        {article.published_at ? formatTableDate(article.published_at) : 'Not published'}
      </div>
    )
  }
];

export const getArticlesTableActions = (
  onEdit: (article: Article) => void,
  onDelete: (article: Article) => void,
  onView?: (article: Article) => void,
  config: ArticleTableConfig = defaultAdminConfig
) => {
  const actions = [];

  // Add custom actions first if provided
  if (config.customActions) {
    actions.push(...config.customActions);
  }

  // Add view action if enabled
  if (config.showViewAction && onView) {
    actions.push({
      key: 'view',
      label: 'View Article',
      icon: <Eye className="h-4 w-4" />,
      onClick: onView,
      variant: 'ghost' as const,
      size: 'sm' as const
    });
  }

  // Add edit action if enabled
  if (config.showEditAction) {
    actions.push({
      key: 'edit',
      label: 'Edit Article',
      icon: <Pencil className="h-4 w-4" />,
      onClick: onEdit,
      variant: 'ghost' as const,
      size: 'sm' as const
    });
  }

  // Add delete action if enabled
  if (config.showDeleteAction) {
    actions.push({
      key: 'delete',
      label: 'Delete Article',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onDelete,
      variant: 'ghost' as const,
      size: 'sm' as const
    });
  }

  return actions;
};

// Convenience functions for different user roles
export const getAdminArticlesTableColumns = () => getArticlesTableColumns(defaultAdminConfig);

export const getAdminArticlesTableActions = (
  onEdit: (article: Article) => void,
  onDelete: (article: Article) => void
) => getArticlesTableActions(onEdit, onDelete, undefined, defaultAdminConfig);
