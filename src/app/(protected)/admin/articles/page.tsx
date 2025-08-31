'use client';

import { useRouter } from 'next/navigation';
import { ArticlesTable } from '@/components/shared/articles-table';
import {
  getAdminArticlesTableColumns,
  getAdminArticlesTableActions
} from '@/components/admin/articles';
import { Article } from '@/lib/types/articles';

export default function ArticlesManagementPage() {
  const router = useRouter();
  const handleEditArticle = (article: Article) => {
    router.push(`/admin/articles/${article.id}`);
  };

  const handleDeleteArticle = (article: Article) => {
    // For now, we'll just log the delete action
    // In the future, this will handle deletion through the shared component
    console.log('Delete article:', article);
  };

  const handleCreateArticle = () => {
    router.push('/admin/articles/new');
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
