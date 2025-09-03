'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  FileText, 
  User,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Article } from '@/lib/types/articles';
import { useArticleById, useUpdateArticle } from '@/hooks/use-articles';
import { formatSmartDate } from '@/lib/utils/date';
import { WriterArticleForm } from '@/components/shared/articles';
import { toast } from 'sonner';
import { useState } from 'react';

export default function WriterArticleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const { data: article, isLoading, error } = useArticleById(articleId);
  const updateArticleMutation = useUpdateArticle();

  const handleEditSubmit = async (data: any) => {
    try {
      // Writers cannot change article status
      if (data.status && data.status !== article?.status) {
        toast.error('Writers cannot change article status');
        return;
      }

      await updateArticleMutation.mutateAsync({ id: articleId, ...data });
      setIsEditFormOpen(false);
      toast.success('Article updated successfully');
    } catch (err) {
      toast.error('Failed to update article');
    }
  };

  const canEdit = article?.status === 'revise';

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading article details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Error Loading Article</h2>
            <p className="text-muted-foreground">{error?.message || 'Article not found'}</p>
            <Button 
              onClick={() => router.back()} 
              variant="outline" 
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'revise':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'published':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusDisplayName = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{article.title}</h1>
            <p className="text-muted-foreground">Article Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(article.status)}>
            {getStatusDisplayName(article.status)}
          </Badge>
          {canEdit ? (
            <Button
              onClick={() => setIsEditFormOpen(!isEditFormOpen)}
              size="sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditFormOpen ? 'Cancel Edit' : 'Edit Article'}
            </Button>
          ) : (
            <div className="text-sm text-muted-foreground px-3 py-2">
              {article.status === 'published' && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Published - Cannot edit</span>
                </div>
              )}
              {article.status === 'review' && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span>Under Review - Cannot edit</span>
                </div>
              )}
              {article.status === 'approved' && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Approved - Cannot edit</span>
                </div>
              )}
              {article.status === 'cancelled' && (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span>Cancelled - Cannot edit</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Form - Only show if article can be edited and edit mode is open */}
      {canEdit && isEditFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Article</CardTitle>
          </CardHeader>
          <CardContent>
            <WriterArticleForm
              onSubmit={handleEditSubmit}
              isSubmitting={updateArticleMutation.isPending}
              initialData={article}
              compact={false}
            />
          </CardContent>
        </Card>
      )}

      {/* Article Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Article Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Title</p>
              <p className="text-sm">{article.title}</p>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Author</p>
              <p className="text-sm">{article.authored_by || 'Unknown'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Article Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge className={getStatusColor(article.status)}>
                {getStatusDisplayName(article.status)}
              </Badge>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-sm">{formatSmartDate(article.created_at)}</p>
            </div>
            
            {article.published_at && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-sm">{formatSmartDate(article.published_at)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Article Content */}
      <Card>
        <CardHeader>
          <CardTitle>Article Content</CardTitle>
        </CardHeader>
        <CardContent>
          {article.content ? (
            <div className="prose prose-lg max-w-none dark:prose-invert">
              {typeof article.content === 'string' ? (
                <p>{article.content}</p>
              ) : (
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(article.content, null, 2)}
                </pre>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No content available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cover Image */}
      {article.cover_image_url && (
        <Card>
          <CardHeader>
            <CardTitle>Cover Image</CardTitle>
          </CardHeader>
          <CardContent>
            <img 
              src={article.cover_image_url} 
              alt="Article cover" 
              className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
