'use client';

import { ArticlesTable } from '@/components/shared/articles-table';
import { Article } from '@/lib/types/articles';

export default function HeadWriterArticlesPage() {
  const handleEditArticle = (article: Article) => {
    // Head writers can edit articles but will navigate to a different page
    console.log('Edit article as head writer:', article);
    // TODO: Navigate to head writer article edit page
    // router.push(`/head-writer/articles/${article.id}/edit`);
  };

  const handleViewArticle = (article: Article) => {
    // Head writers can view articles
    console.log('View article:', article);
    // TODO: Navigate to article view page
    // router.push(`/head-writer/articles/${article.id}`);
  };

  const handleCreateArticle = () => {
    // Head writers can create articles
    console.log('Create new article as head writer');
    // TODO: Navigate to article creation page
    // router.push('/head-writer/articles/create');
  };

  return (
    <ArticlesTable
      title="My Articles"
      subtitle="View and manage your article entries."
      config={{
        showAuthorId: false, // Head writers don't need to see author ID since they're viewing their own articles
        showActions: true,
        showViewAction: true, // Head writers can view articles
        showEditAction: true, // Head writers can edit articles
        showDeleteAction: false // Head writers cannot delete articles
      }}
      onEdit={handleEditArticle}
      onView={handleViewArticle}
      onCreate={handleCreateArticle}
      showAddButton={true}
      addButtonLabel="Create Article"
    />
  );
}
