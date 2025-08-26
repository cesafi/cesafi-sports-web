'use client';

import { ArticlesTable } from '@/components/shared/articles-table';
import {
  getAdminArticlesTableColumns,
  getAdminArticlesTableActions
} from '@/components/admin/articles';
import { Article } from '@/lib/types/articles';

export default function ArticlesManagementPage() {
  const handleEditArticle = (article: Article) => {
    // For now, we'll just log the edit action since we don't have the modal
    // In the future, this will navigate to the article edit page
    console.log('Edit article:', article);
    // TODO: Navigate to article edit page
    // router.push(`/admin/articles/${article.id}/edit`);
  };

  const handleDeleteArticle = (article: Article) => {
    // For now, we'll just log the delete action
    // In the future, this will handle deletion through the shared component
    console.log('Delete article:', article);
  };

  const handleCreateArticle = () => {
    // For now, we'll just log the create action
    // In the future, this will navigate to the article creation page
    console.log('Create new article');
    // TODO: Navigate to article creation page
    // router.push('/admin/articles/create');
  };

  return (
    <div className="w-full space-y-6">
      <ArticlesTable
        title="Articles Management"
        subtitle="View and manage article entries."
        config={{
          showAuthorId: true,
          showActions: true,
          showViewAction: false,
          showEditAction: true,
          showDeleteAction: true
        }}
        onEdit={handleEditArticle}
        onDelete={handleDeleteArticle}
        onCreate={handleCreateArticle}
        showAddButton={true}
        addButtonLabel="Add Article"
      />
    </div>
  );
}
