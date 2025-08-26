'use client';

import { useState } from 'react';
import { DataTable } from '@/components/table';
import { useArticlesTable } from '@/hooks/use-articles';
import { 
  getArticlesTableColumns, 
  getArticlesTableActions,
  ArticleTableConfig 
} from '@/components/admin/articles';
import { Article } from '@/lib/types/articles';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

interface ArticlesTableProps {
  title?: string;
  subtitle?: string;
  config?: ArticleTableConfig;
  onEdit?: (article: Article) => void;
  onDelete?: (article: Article) => void;
  onView?: (article: Article) => void;
  onCreate?: () => void;
  showAddButton?: boolean;
  addButtonLabel?: string;
  className?: string;
}

export function ArticlesTable({
  title = "Articles",
  subtitle = "View and manage article entries.",
  config,
  onEdit,
  onDelete,
  onView,
  onCreate,
  showAddButton = false,
  addButtonLabel = "Add Article",
  className = ""
}: ArticlesTableProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | undefined>();

  const {
    articles,
    totalCount,
    pageCount,
    currentPage,
    pageSize,
    loading,
    tableBodyLoading,
    error,
    deleteArticle,
    isDeleting,
    onPageChange,
    onPageSizeChange,
    onSortChange,
    onSearchChange,
    onFiltersChange
  } = useArticlesTable();

  const handleEditArticle = (article: Article) => {
    if (onEdit) {
      onEdit(article);
    } else {
      // Default behavior - log for now
      console.log('Edit article:', article);
    }
  };

  const handleDeleteArticle = (article: Article) => {
    if (onDelete) {
      onDelete(article);
    } else {
      setArticleToDelete(article);
      setIsDeleteModalOpen(true);
    }
  };

  const handleViewArticle = (article: Article) => {
    if (onView) {
      onView(article);
    } else {
      // Default behavior - log for now
      console.log('View article:', article);
    }
  };

  const confirmDeleteArticle = async () => {
    if (!articleToDelete) return;

    try {
      deleteArticle(articleToDelete.id);
      setIsDeleteModalOpen(false);
      setArticleToDelete(undefined);
    } catch {
      setIsDeleteModalOpen(false);
      setArticleToDelete(undefined);
    }
  };

  const columns = getArticlesTableColumns(config);
  const actions = getArticlesTableActions(
    handleEditArticle, 
    handleDeleteArticle, 
    handleViewArticle, 
    config
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Data Table */}
      <DataTable
        data={articles}
        totalCount={totalCount}
        loading={loading}
        tableBodyLoading={tableBodyLoading}
        error={error}
        columns={columns}
        actions={actions}
        currentPage={currentPage}
        pageCount={pageCount}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onSortChange={onSortChange}
        onSearchChange={onSearchChange}
        onFiltersChange={onFiltersChange}
        title={title}
        subtitle={subtitle}
        searchPlaceholder="Search articles..."
        showSearch={true}
        showFilters={false}
        addButton={showAddButton ? {
          label: addButtonLabel,
          onClick: onCreate || (() => console.log('Create article'))
        } : undefined}
        className=""
        emptyMessage="No articles found"
      />

      {/* Confirmation Modal - Only show if we're handling delete internally */}
      {!onDelete && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDeleteArticle}
          type="delete"
          title="Delete Article"
          message={`Are you sure you want to delete the article "${articleToDelete?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          destructive={true}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
