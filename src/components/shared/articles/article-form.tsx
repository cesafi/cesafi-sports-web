'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Article, ArticleInsert, ArticleUpdate, ArticleStatus } from '@/lib/types/articles';
import { createArticleSchema, updateArticleSchema } from '@/lib/validations/articles';
import { ZodError } from 'zod';
import { LexicalEditor } from '@/components/shared/articles/lexical-editor';
import { useCloudinary } from '@/hooks/use-cloudinary';
import slugify from 'slugify';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

interface ArticleFormProps {
  mode: 'create' | 'edit';
  article?: Article;
  onSubmit: (data: ArticleInsert | ArticleUpdate) => Promise<void>;
  isSubmitting: boolean;
  userRole?: 'writer' | 'head-writer' | 'admin';
  backUrl?: string;
}

export function ArticleForm({
  mode,
  article,
  onSubmit,
  isSubmitting,
  userRole = 'admin',
  backUrl
}: ArticleFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ArticleInsert | ArticleUpdate>(() => {
    if (mode === 'edit' && article) {
      return {
        id: article.id,
        title: article.title,
        content: article.content,
        cover_image_url: article.cover_image_url,
        authored_by: article.authored_by,
        slug: article.slug,
        status: article.status,
        published_at: article.published_at
      } as ArticleUpdate;
    } else {
      return {
        title: '',
        content: {},
        cover_image_url: '',
        authored_by: '',
        slug: '',
        status: 'review',
        published_at: null
      } as ArticleInsert;
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editorContent, setEditorContent] = useState<string>('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const { uploadImage, isUploading: isUploadingCover } = useCloudinary();

  // Form initialization
  useEffect(() => {
    if (mode === 'edit' && article) {
      setFormData({
        id: article.id,
        title: article.title,
        content: article.content || {},
        cover_image_url: article.cover_image_url,
        authored_by: article.authored_by,
        status: article.status,
        published_at: article.published_at || null
      });
      setEditorContent(article.content ? JSON.stringify(article.content) : '');
      setCoverImagePreview(article.cover_image_url);
    } else {
      setFormData({
        title: '',
        content: {},
        cover_image_url: '',
        authored_by: '',
        slug: '',
        status: 'review',
        published_at: null
      } as ArticleInsert);
      setEditorContent('');
      setCoverImagePreview('');
    }
    setErrors({});
    setCoverImageFile(null);
  }, [mode, article]);

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }

      setCoverImageFile(file);
      const preview = URL.createObjectURL(file);
      setCoverImagePreview(preview);

      // Upload to Cloudinary immediately
      try {
        const result = await uploadImage(file, {
          folder: 'cesafi-articles/cover-images',
          resource_type: 'image',
          quality: 'auto',
          format: 'auto'
        });

        if (result.success && result.data) {
          setFormData(prev => ({ ...prev, cover_image_url: result.data!.secure_url }));
          toast.success('Cover image uploaded successfully');
        } else {
          toast.error(result.error || 'Failed to upload cover image');
        }
      } catch (error) {
        console.error('Cover image upload error:', error);
        toast.error('Failed to upload cover image');
      }
    }
  };

  const uploadCoverImage = async () => {
    if (coverImageFile) {
      try {
        // Temporary placeholder for cover image URL
        const tempImageUrl = `temp-cover-image-${Date.now()}.jpg`;
        setFormData(prev => ({ ...prev, cover_image_url: tempImageUrl }));
        return tempImageUrl;
      } catch (error) {
        toast.error('Failed to process cover image');
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

      // Generate slug from title
      const title = formData.title?.trim() || 'untitled';
      const slug = slugify(title, { 
        lower: true, 
        strict: true, 
        remove: /[*+~.()'"!:@]/g 
      });

      // Parse editor content as JSON (Lexical JSON format)
      let parsedContent;
      try {
        parsedContent = JSON.parse(editorContent);
      } catch {
        // Fallback to HTML string if JSON parsing fails
        parsedContent = { html: editorContent };
      }

      const submitData = {
        ...formData,
        content: parsedContent, // Use parsed JSON content
        cover_image_url: coverImageUrl,
        slug: slug
      };

      const schema = mode === 'create' ? createArticleSchema : updateArticleSchema;
      const validatedData = schema.parse(submitData);

      await onSubmit(validatedData);

      // Navigate back after successful submission
      if (backUrl) {
        router.push(backUrl);
      } else {
        router.back();
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path) {
            newErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(newErrors);
        toast.error('Please fix the validation errors');
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  const isWriter = userRole === 'writer';
  const canEditStatus = userRole === 'admin' || userRole === 'head-writer';
  const canEditAuthor = userRole === 'admin' || userRole === 'head-writer';

  return (
    <div className="w-full">
      {/* Header */}
      <Button variant="ghost" size="sm" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              {mode === 'create' ? 'Create New Article' : 'Edit Article'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'create'
                ? 'Write and publish a new article'
                : `Editing: ${article?.title || 'Article'}`
              }
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleBack}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="article-form"
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {mode === 'create' ? 'Create' : 'Update'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Writer-specific message */}
      {isWriter && article?.status !== 'revise' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            You can only edit articles with &quot;Revise&quot; status. This article is currently in &quot;{getStatusLabel(article?.status || '')}&quot; status.
          </p>
        </div>
      )}

      <form id="article-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <Card>
              <CardHeader>
                <CardTitle>Article Title</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter article title"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Article Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <LexicalEditor
                    initialContent={editorContent}
                    onChange={(content) => {
                      setEditorContent(typeof content === 'string' ? content : JSON.stringify(content));
                      setFormData(prev => ({ ...prev, content }));
                    }}
                    className="min-h-[500px]"
                    articleId={article?.id}
                    enableAutoSave={mode === 'edit' && !!article?.id}
                    outputFormat="json"
                  />
                  {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Article Details */}
            <Card>
              <CardHeader>
                <CardTitle>Article Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                        published_at: e.target.value ? new Date(e.target.value).toISOString() : null
                      }))}
                      className={errors.published_at ? 'border-red-500' : ''}
                    />
                    {errors.published_at && <p className="text-sm text-red-500">{errors.published_at}</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cover Image */}
            <Card>
              <CardHeader>
                <CardTitle>Cover Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    disabled={isUploadingCover}
                    className="flex-1"
                  />
                  {isUploadingCover && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading cover image...
                    </div>
                  )}
                  {coverImagePreview && (
                    <div className="mt-4">
                      <Image
                        src={coverImagePreview}
                        alt="Cover preview"
                        width={400}
                        height={192}
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
                {errors.cover_image_url && <p className="text-sm text-red-500">{errors.cover_image_url}</p>}
              </CardContent>
            </Card>

            {/* Article Info */}
            {mode === 'edit' && article && (
              <Card>
                <CardHeader>
                  <CardTitle>Article Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(article.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span>{new Date(article.updated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slug:</span>
                    <span className="font-mono text-xs">{article.slug}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
    </div>
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
