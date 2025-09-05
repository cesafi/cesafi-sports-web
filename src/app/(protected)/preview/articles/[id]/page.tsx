'use client';

import { useParams, useRouter } from 'next/navigation';
import Head from 'next/head';
import { useArticleById } from '@/hooks/use-articles';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Eye, Calendar, User, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ArticlePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;

  const { data: article, isLoading, error } = useArticleById(articleId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-muted text-muted-foreground';
      case 'review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'revise':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'published':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'review':
        return 'Under Review';
      case 'approved':
        return 'Approved';
      case 'revise':
        return 'Needs Revision';
      case 'cancelled':
        return 'Cancelled';
      case 'published':
        return 'Published';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-8 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="w-full space-y-8 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-6">
              The article you're looking for doesn't exist or you don't have permission to preview it.
            </p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <meta name="googlebot" content="noindex, nofollow" />
        <title>Preview: {article.title}</title>
      </Head>
      <div className="w-full space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Preview Mode</span>
            </div>
          </div>
          <Badge className={`${getStatusColor(article.status)} border`}>
            {getStatusLabel(article.status)}
          </Badge>
        </div>

        {/* Article Preview */}
        <Card>
          <CardHeader className="space-y-6">
            <div className="space-y-4">
              <div>
                <CardTitle className="text-3xl font-bold">{article.title}</CardTitle>
                <p className="text-muted-foreground mt-2">{article.excerpt}</p>
              </div>
              
              {/* Article Meta */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{article.authored_by}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created {new Date(article.created_at).toLocaleDateString()}</span>
                </div>
                {article.updated_at !== article.created_at && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Updated {new Date(article.updated_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-gray max-w-none">
              {/* This would render the article content */}
              <div 
                className="article-content"
                dangerouslySetInnerHTML={{ __html: article.content || '<p>No content available</p>' }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview Notice */}
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="text-center py-8">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-3">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">Preview Mode</span>
            </div>
            <p className="text-sm text-muted-foreground">
              This is a private preview. This article is not visible to the public and will not be indexed by search engines.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
