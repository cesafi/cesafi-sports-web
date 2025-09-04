'use client';

import { useRouter } from 'next/navigation';
import { ArticlesTable } from '@/components/shared/articles/articles-table';
import { Article } from '@/lib/types/articles';

export default function HeadWriterArticlesPage() {
  const router = useRouter();

  const handleEditArticle = (article: Article) => {
    router.push(`/head-writer/articles/${article.id}`);
  };

  const handleViewArticle = (article: Article) => {
    router.push(`/head-writer/articles/${article.id}`);
  };

  const handleCreateArticle = () => {
    router.push('/head-writer/articles/new');
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
