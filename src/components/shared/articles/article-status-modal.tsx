'use client';

import { useState, useEffect } from 'react';
import { ModalLayout } from '@/components/ui/modal-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, User, CheckCircle, XCircle, Clock, AlertTriangle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Article, ArticleUpdate } from '@/lib/types/articles';
import { formatTableDate } from '@/lib/utils/date';

interface ArticleStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: Article;
  onUpdateArticle: (data: ArticleUpdate) => Promise<void>;
  isSubmitting: boolean;
}

type ArticleStatus = 'review' | 'published' | 'revise' | 'cancelled' | 'approved';

const statusConfig = {
  review: {
    label: 'Under Review',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    description: 'Article is being reviewed by editors'
  },
  approved: {
    label: 'Approved',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
    description: 'Article has been approved for publication'
  },
  published: {
    label: 'Published',
    color: 'bg-green-100 text-green-800',
    icon: Eye,
    description: 'Article is live and visible to readers'
  },
  revise: {
    label: 'Needs Revision',
    color: 'bg-orange-100 text-orange-800',
    icon: AlertTriangle,
    description: 'Article needs changes before publication'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Article has been cancelled'
  }
};

export function ArticleStatusModal({
  open,
  onOpenChange,
  article,
  onUpdateArticle,
  isSubmitting
}: ArticleStatusModalProps) {
  const [formData, setFormData] = useState<{
    status: ArticleStatus;
    title: string;
    published_at: string;
  }>({
    status: 'review',
    title: '',
    published_at: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when modal opens
  useEffect(() => {
    if (open && article) {
      setFormData({
        status: (article.status as ArticleStatus) || 'review',
        title: article.title || '',
        published_at: article.published_at ? new Date(article.published_at).toISOString().slice(0, 16) : ''
      });
      setErrors({});
    }
  }, [open, article]);

  const handleStatusChange = (status: ArticleStatus) => {
    setFormData(prev => ({ ...prev, status }));
    
    // Auto-set published date when status changes to published
    if (status === 'published' && !formData.published_at) {
      const now = new Date().toISOString().slice(0, 16);
      setFormData(prev => ({ ...prev, published_at: now }));
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({ ...prev, title }));
  };

  const handlePublishedDateChange = (value: string) => {
    setFormData(prev => ({ ...prev, published_at: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.status === 'published' && !formData.published_at) {
      newErrors.published_at = 'Published date is required for published articles';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const updateData: ArticleUpdate = {
        id: article.id,
        status: formData.status,
        title: formData.title,
        published_at: formData.published_at ? new Date(formData.published_at).toISOString() : article.published_at
      };

      await onUpdateArticle(updateData);
    } catch (error) {
      console.error('Failed to update article status:', error);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
  };

  const currentStatus = statusConfig[formData.status];
  const StatusIcon = currentStatus.icon;

  return (
    <ModalLayout
      open={open}
      onOpenChange={handleClose}
      title="Manage Article Status & Details"
      maxWidth="max-w-2xl"
      footer={
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(errors).length > 0}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Updating...</span>
              </div>
            ) : (
              'Update Article'
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Current Article Info */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{article.title}</h3>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Author: {article.authored_by}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Created: {formatTableDate(article.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Article Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Article Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className={errors.title ? 'border-red-500' : ''}
            placeholder="Enter article title"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Status Selection */}
        <div className="space-y-3">
          <Label htmlFor="status">Article Status *</Label>
          <Select value={formData.status} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select article status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusConfig).map(([value, config]) => {
                const Icon = config.icon;
                return (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          {/* Status Preview */}
          <div className="flex items-center space-x-2">
            <StatusIcon className="h-4 w-4" />
            <Badge variant="secondary" className={currentStatus.color}>
              {currentStatus.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {currentStatus.description}
            </span>
          </div>
        </div>

        {/* Published Date */}
        <div className="space-y-2">
          <Label htmlFor="published_at">
            Published Date
            {formData.status === 'published' && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </Label>
          <Input
            id="published_at"
            type="datetime-local"
            value={formData.published_at}
            onChange={(e) => handlePublishedDateChange(e.target.value)}
            className={errors.published_at ? 'border-red-500' : ''}
            disabled={formData.status !== 'published'}
          />
          {errors.published_at && (
            <p className="text-sm text-red-500">{errors.published_at}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {formData.status === 'published' 
              ? 'When the article was/will be published'
              : 'Only required for published articles'
            }
          </p>
        </div>

        {/* Current Status Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Current Status</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className={statusConfig[article.status as ArticleStatus]?.color || 'bg-gray-100 text-gray-800'}>
                {statusConfig[article.status as ArticleStatus]?.label || article.status}
              </Badge>
            </div>
            {article.published_at && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700">Published: {formatTableDate(article.published_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Info Note */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Changing the article status will affect its visibility and workflow. 
            Published articles will be visible to readers on the website.
          </p>
        </div>
      </div>
    </ModalLayout>
  );
}