'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useArticleDetails } from '@/hooks/use-articles';
import { useUpdateArticle } from '@/hooks/use-articles';
import { ArticleInfoCard, ArticleStatusModal, ArticleEditorCard, ArticleEditorLayout } from '@/components/shared/articles';
import { ArticleUpdate } from '@/lib/types/articles';
import { toast } from 'sonner';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Load article details
  const {
    data: article,
    isLoading: articleLoading,
    error: articleError,
    refetch: refetchArticle
  } = useArticleDetails(articleId);

  // Update article mutation
  const updateArticleMutation = useUpdateArticle();

  const handleBack = () => {
    router.back();
  };

  const handleUpdateArticle = async (data: ArticleUpdate) => {
    try {
      const result = await updateArticleMutation.mutateAsync(data);
      if (result.success) {
        toast.success('Article updated successfully');
        setIsStatusModalOpen(false);
        refetchArticle();
      } else {
        toast.error(result.error || 'Failed to update article');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      throw error;
    }
  };

  const handleContentSave = async (content: any) => {
    try {
      await handleUpdateArticle({
        id: articleId,
        content: content
      });
    } catch (error) {
      console.error('Failed to save content:', error);
    }
  };

  if (articleLoading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading article details...</p>
        </div>
      </div>
    );
  }

  if (articleError || !article) {
    return (
      <div className="w-full flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load article details</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ArticleEditorLayout
        title={article.title}
        subtitle="Article Details & Content Management"
        onBack={handleBack}
        editorContent={
          <ArticleEditorCard
            article={article}
            onSave={handleContentSave}
            isSubmitting={updateArticleMutation.isPending}
          />
        }
        sidebarContent={
          <ArticleInfoCard
            article={article}
            onManageStatus={() => setIsStatusModalOpen(true)}
            compact={true}
          />
        }
      />

      {/* Article Status Modal */}
      <ArticleStatusModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        article={article}
        onUpdateArticle={handleUpdateArticle}
        isSubmitting={updateArticleMutation.isPending}
      />
    </>
  );
}