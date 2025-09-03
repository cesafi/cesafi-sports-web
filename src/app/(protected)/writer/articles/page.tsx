'use client';

import { useRouter } from 'next/navigation';
import { ArticlesTable } from '@/components/shared';
import { Article } from '@/lib/types/articles';

export default function WriterArticlesPage() {
  const router = useRouter();
  
  const config = {
    showAuthorId: false,
    showActions: true,
    showViewAction: true,
    showEditAction: true,
    showDeleteAction: false
  };

  const handleEdit = (article: Article) => {
    // Writers can only edit articles with 'revise' status
    if (article.status !== 'revise') {
      alert('You can only edit articles that need revision');
      return;
    }
    // Navigate to article details page
    router.push(`/writer/articles/${article.id}`);
  };

  const handleView = (article: Article) => {
    // Navigate to article details page
    router.push(`/writer/articles/${article.id}`);
  };

  const handleCreate = () => {
    // Navigate to new article page
    router.push('/writer/articles/new');
  };

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Articles</h1>
        <p className="text-muted-foreground">
          Manage your articles. You can only edit articles that need revision and cannot change article status.
        </p>
      </div>

      {/* Articles Table */}
      <ArticlesTable 
        config={config}
        onEdit={handleEdit}
        onView={handleView}
        onCreate={handleCreate}
        showAddButton={true}
        addButtonLabel="Create Article"
        title="My Articles"
        subtitle="View and manage your articles. Only articles with 'revise' status can be edited."
      />
    </div>
  );
}
