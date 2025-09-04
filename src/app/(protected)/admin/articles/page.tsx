'use client';

import { useRouter } from 'next/navigation';
import { ArticlesTable } from '@/components/shared';
import { Article } from '@/lib/types/articles';

export default function AdminArticlesPage() {
  const router = useRouter();
  
  const config = {
    showAuthorId: true,
    showActions: true,
    showViewAction: false,
    showEditAction: true,
    showDeleteAction: true
  };

  const handleEdit = (article: Article) => {
    // Navigate to article details page
    router.push(`/admin/articles/${article.id}`);
  };

  const handleDelete = (article: Article) => {
    // Navigate to article details page for deletion
    router.push(`/admin/articles/${article.id}`);
  };

  const handleCreate = () => {
    // Navigate to new article page
    router.push('/admin/articles/new');
  };

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Articles Management</h1>
        <p className="text-muted-foreground">
          Create, edit, and manage articles for the league.
        </p>
      </div>

      {/* Articles Table */}
      <ArticlesTable 
        config={config}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        showAddButton={true}
        addButtonLabel="Create Article"
        title="Articles Management"
        subtitle="Manage all articles in the system."
      />
    </div>
  );
}
