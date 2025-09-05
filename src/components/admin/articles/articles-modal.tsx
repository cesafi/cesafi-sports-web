'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ModalLayout } from '@/components/ui/modal-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Article, ArticleInsert, ArticleUpdate, ArticleStatus } from '@/lib/types/articles';
import { createArticleSchema, updateArticleSchema } from '@/lib/validations/articles';
import { ZodError } from 'zod';
import { LexicalEditor } from '@/components/shared/articles/lexical-editor';
import { useCloudinary } from '@/hooks/use-cloudinary';
import slugify from 'slugify';

interface ArticleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  article?: Article;
  onSubmit: (data: ArticleInsert | ArticleUpdate) => Promise<void>;
  isSubmitting: boolean;
  userRole?: 'writer' | 'head-writer' | 'admin';
}

export function ArticleModal({ 
  open, 
  onOpenChange, 
  mode, 
  article, 
  onSubmit, 
  isSubmitting,
  userRole = 'admin'
}: ArticleModalProps) {
  const [formData, setFormData] = useState<ArticleInsert | ArticleUpdate>({
    title: '',
    content: {},
    cover_image_url: '',
    authored_by: '',
    status: 'review',
    published_at: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editorContent, setEditorContent] = useState<string>('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const hasStartedCreating = useRef(false);
  const hasStartedUpdating = useRef(false);
  const { uploadImage } = useCloudinary();

  // Form reset on modal open/close
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && article) {
        setFormData({
          id: article.id,
          title: article.title,
          content: article.content,
          cover_image_url: article.cover_image_url,
          authored_by: article.authored_by,
          status: article.status,
          published_at: article.published_at
        });
        setEditorContent(article.content ? JSON.stringify(article.content) : '');
        setCoverImagePreview(article.cover_image_url);
      } else {
        setFormData({
          title: '',
          content: {},
          cover_image_url: '',
          authored_by: '',
          status: 'review',
          published_at: ''
        });
        setEditorContent('');
        setCoverImagePreview('');
      }
      setErrors({});
      setCoverImageFile(null);
      hasStartedCreating.current = false;
      hasStartedUpdating.current = false;
    }
  }, [open, mode, article]);

  const handleClose = useCallback(() => {
    setErrors({});
    onOpenChange(false);
  }, [onOpenChange]);

  // Handle mutation completion
  useEffect(() => {
    if (hasStartedCreating.current && !isSubmitting && mode === 'add') {
      handleClose();
    }
  }, [isSubmitting, mode, handleClose]);

  useEffect(() => {
    if (hasStartedUpdating.current && !isSubmitting && mode === 'edit') {
      handleClose();
    }
  }, [isSubmitting, mode, handleClose]);

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const preview = URL.createObjectURL(file);
      setCoverImagePreview(preview);
    }
  };

  const uploadCoverImage = async () => {
    if (coverImageFile) {
      try {
        const imageUrl = await uploadImage(coverImageFile);
        if (imageUrl) {
          setFormData(prev => ({ ...prev, cover_image_url: imageUrl }));
          return imageUrl;
        }
      } catch (error) {
        toast.error('Failed to upload cover image');
        throw error;
      }
    }
    return formData.cover_image_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Upload cover image if needed
      const coverImageUrl = await uploadCoverImage();
      
      // Parse editor content
      let parsedContent = {};
      try {
        parsedContent = JSON.parse(editorContent);
      } catch {
        // If not valid JSON, treat as HTML string
        parsedContent = { html: editorContent };
      }

      const submitData = {
        ...formData,
        content: parsedContent,
        cover_image_url: coverImageUrl,
        slug: slugify(formData.title || '')
      };

      const schema = mode === 'add' ? createArticleSchema : updateArticleSchema;
      const validatedData = schema.parse(submitData);

      if (mode === 'add') {
        hasStartedCreating.current = true;
      } else {
        hasStartedUpdating.current = true;
      }

      await onSubmit(validatedData);
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path) {
            newErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(newErrors);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const isWriter = userRole === 'writer';
  const canEditStatus = userRole === 'admin' || userRole === 'head-writer';
  const canEditAuthor = userRole === 'admin' || userRole === 'head-writer';

  return (
    <ModalLayout
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'add' ? 'Create New Article' : 'Edit Article'}
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'add' ? 'Create Article' : 'Update Article'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter article title"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
        </div>

        {/* Author */}
        <div className="space-y-2">
          <Label htmlFor="authored_by">Author *</Label>
          <Input
            id="authored_by"
            value={formData.authored_by}
            onChange={(e) => setFormData(prev => ({ ...prev, authored_by: e.target.value }))}
            placeholder="Enter author name"
            disabled={!canEditAuthor}
            className={errors.authored_by ? 'border-red-500' : ''}
          />
          {errors.authored_by && <p className="text-sm text-red-500">{errors.authored_by}</p>}
        </div>

        {/* Cover Image */}
        <div className="space-y-2">
          <Label htmlFor="cover_image">Cover Image *</Label>
          <div className="flex items-center space-x-4">
            <Input
              id="cover_image"
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="flex-1"
            />
            {coverImagePreview && (
              <Image
                src={coverImagePreview}
                alt="Cover preview"
                width={80}
                height={80}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
          </div>
          {errors.cover_image_url && <p className="text-sm text-red-500">{errors.cover_image_url}</p>}
        </div>

        {/* Status */}
        {canEditStatus && (
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as ArticleStatus }))}
            >
              <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="revise">Revise</SelectItem>
                <SelectItem value="approved">Approve</SelectItem>
                <SelectItem value="cancelled">Cancel</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
          </div>
        )}

        {/* Published Date */}
        {canEditStatus && formData.status === 'approved' && (
          <div className="space-y-2">
            <Label htmlFor="published_at">Publish Date & Time</Label>
            <Input
              id="published_at"
              type="datetime-local"
              value={formData.published_at ? new Date(formData.published_at).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                published_at: e.target.value ? new Date(e.target.value).toISOString() : ''
              }))}
              className={errors.published_at ? 'border-red-500' : ''}
            />
            {errors.published_at && <p className="text-sm text-red-500">{errors.published_at}</p>}
          </div>
        )}

        {/* Content Editor */}
        <div className="space-y-2">
          <Label>Content *</Label>
          <LexicalEditor
            initialContent={editorContent}
            onChange={setEditorContent}
            className="min-h-[400px]"
          />
          {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
        </div>

        {/* Writer-specific message */}
        {isWriter && article?.status !== 'revise' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              You can only edit articles with &quot;Revise&quot; status. This article is currently in &quot;{getStatusLabel(article?.status || '')}&quot; status.
            </p>
          </div>
        )}
      </form>
    </ModalLayout>
  );
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'review': return 'Review';
    case 'approved': return 'Approved';
    case 'revise': return 'Revise';
    case 'cancelled': return 'Cancelled';
    case 'published': return 'Published';
    default: return status;
  }
}
