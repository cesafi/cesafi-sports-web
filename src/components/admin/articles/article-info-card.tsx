'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  User,
  FileText,
  Image,
  Settings,
  Eye
} from 'lucide-react';
import { Article } from '@/lib/types/articles';
import { formatTableDate } from '@/lib/utils/date';

interface ArticleInfoCardProps {
  article: Article;
  onManageStatus?: () => void;
  compact?: boolean;
}

export function ArticleInfoCard({ article, onManageStatus, compact = false }: ArticleInfoCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Published</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Approved</Badge>;
      case 'review':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
      case 'revise':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Needs Revision</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Draft</Badge>;
    }
  };

  if (compact) {
    return (
      <div className="h-full flex flex-col">
        {/* Compact Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Article Details</h3>
            {getStatusBadge(article.status)}
          </div>
          {onManageStatus && (
            <Button
              variant="outline"
              size="sm"
              onClick={onManageStatus}
              className="w-full flex items-center justify-center space-x-1"
            >
              <Settings className="h-4 w-4" />
              <span>Manage Status</span>
            </Button>
          )}
        </div>

        {/* Compact Content */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Author */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>Author</span>
            </div>
            <p className="text-sm font-medium">{article.authored_by}</p>
          </div>

          {/* Dates */}
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Created</span>
              </div>
              <p className="text-sm">{formatTableDate(article.created_at)}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Published</span>
              </div>
              <p className="text-sm">
                {article.published_at ? formatTableDate(article.published_at) : 'Not published'}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Updated</span>
              </div>
              <p className="text-sm">{formatTableDate(article.updated_at)}</p>
            </div>
          </div>

          {/* Cover Image */}
          {article.cover_image_url && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Image className="h-3 w-3" />
                <span>Cover Image</span>
              </div>
              <div className="relative w-full">
                <img
                  src={article.cover_image_url}
                  alt="Article cover"
                  className="w-full h-24 object-cover rounded border"
                />
              </div>
            </div>
          )}

          {/* Status Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="h-3 w-3 text-blue-600" />
              <h4 className="text-xs font-semibold text-blue-800">Status Info</h4>
            </div>
            <div className="text-xs text-blue-700">
              <p><strong>Status:</strong> {article.status.charAt(0).toUpperCase() + article.status.slice(1)}</p>
              {article.status === 'published' && (
                <p className="mt-1">Article is live and visible to readers.</p>
              )}
              {article.status === 'review' && (
                <p className="mt-1">Article is pending review by editors.</p>
              )}
              {article.status === 'revise' && (
                <p className="mt-1">Article needs revisions before publication.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Article Information</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {getStatusBadge(article.status)}
            {onManageStatus && (
              <Button
                variant="outline"
                size="sm"
                onClick={onManageStatus}
                className="flex items-center space-x-1"
              >
                <Settings className="h-4 w-4" />
                <span>Manage Status</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Author</span>
            </div>
            <p className="font-medium">{article.authored_by}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Created</span>
            </div>
            <p className="font-medium">{formatTableDate(article.created_at)}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Published</span>
            </div>
            <p className="font-medium">
              {article.published_at ? formatTableDate(article.published_at) : 'Not published'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Last Updated</span>
            </div>
            <p className="font-medium">{formatTableDate(article.updated_at)}</p>
          </div>
        </div>

        <Separator />

        {/* Cover Image */}
        {article.cover_image_url && (
          <>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Image className="h-4 w-4" />
                <h4 className="font-semibold">Cover Image</h4>
              </div>
              <div className="relative w-full max-w-md">
                <img
                  src={article.cover_image_url}
                  alt="Article cover"
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Article Title */}
        <div className="space-y-2">
          <h4 className="font-semibold">Title</h4>
          <p className="text-lg font-medium">{article.title}</p>
        </div>

        {/* Content Preview */}
        <div className="space-y-2">
          <h4 className="font-semibold">Content Preview</h4>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Content is managed in the editor below. The article contains structured content 
              including text, images, and other media elements.
            </p>
          </div>
        </div>

        {/* Status Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="h-4 w-4 text-blue-600" />
            <h4 className="font-semibold text-blue-800">Status Information</h4>
          </div>
          <div className="text-sm text-blue-700">
            <p><strong>Current Status:</strong> {article.status.charAt(0).toUpperCase() + article.status.slice(1)}</p>
            {article.status === 'published' && (
              <p className="mt-1">This article is live and visible to readers.</p>
            )}
            {article.status === 'review' && (
              <p className="mt-1">This article is pending review by editors.</p>
            )}
            {article.status === 'revise' && (
              <p className="mt-1">This article needs revisions before it can be published.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}