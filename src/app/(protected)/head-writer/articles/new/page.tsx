'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useCreateArticle } from '@/hooks/use-articles';
import { HeadWriterArticleForm, ArticleEditorCard, ArticleEditorLayout } from '@/components/shared/articles';
import { ArticleInsert } from '@/lib/types/articles';
import { toast } from 'sonner';

export default function HeadWriterNewArticlePage() {
  const router = useRouter();
  const [articleData, setArticleData] = useState<Partial<ArticleInsert>>({
    title: '',
    authored_by: '',
    cover_image_url: '',
    content: { blocks: [] },
    status: 'review'
  });

  // Create article mutation
  const createArticleMutation = useCreateArticle();

  const handleBack = () => {
    router.back();
  };

  const handleCreateArticle = async (data: ArticleInsert) => {
    try {
      const result = await createArticleMutation.mutateAsync(data);
      if (result.success) {
        toast.success('Article created successfully');
        // Redirect to the edit page of the newly created article
        router.push(`/head-writer/articles/${data.id}`);
      } else {
        toast.error(result.error || 'Failed to create article');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      throw error;
    }
  };

  const handleFormSubmit = async (formData: Partial<ArticleInsert>) => {
    if (!formData.title || !formData.authored_by) {
      toast.error('Title and author are required');
      return;
    }

    const articleInsert: ArticleInsert = {
      id: crypto.randomUUID(), // Generate a UUID for the article
      title: formData.title,
      authored_by: formData.authored_by,
      cover_image_url: formData.cover_image_url || '',
      content: articleData.content || { blocks: [] },
      status: formData.status || 'review',
      published_at: new Date().toISOString() // Will be updated based on status
    };

    await handleCreateArticle(articleInsert);
  };

  const handleContentSave = async (content: any) => {
    setArticleData(prev => ({ ...prev, content }));
    toast.success('Content saved locally. Submit the form to create the article.');
  };

  return (
    <ArticleEditorLayout
      title="Create New Article"
      subtitle="Create and edit your article content"
      onBack={handleBack}
      editorContent={
        <ArticleEditorCard
          article={{
            id: 'new',
            title: articleData.title || 'New Article',
            content: articleData.content || { blocks: [] },
            authored_by: articleData.authored_by || '',
            cover_image_url: articleData.cover_image_url || '',
            status: 'review',
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }}
          onSave={handleContentSave}
          isSubmitting={false}
        />
      }
      sidebarContent={
        <HeadWriterArticleForm
          onSubmit={handleFormSubmit}
          isSubmitting={createArticleMutation.isPending}
          initialData={articleData}
          compact={true}
        />
      }
    />
  );
}