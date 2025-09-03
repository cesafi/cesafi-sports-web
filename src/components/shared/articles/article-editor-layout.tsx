'use client';

import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Edit, Settings, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ArticleEditorLayoutProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  editorContent: ReactNode;
  sidebarContent: ReactNode;
  status?: string;
  onSave?: () => void;
  onPreview?: () => void;
  isSubmitting?: boolean;
  hasUnsavedChanges?: boolean;
}

export function ArticleEditorLayout({
  title,
  subtitle,
  onBack,
  editorContent,
  sidebarContent,
  status = 'draft',
  onSave,
  onPreview,
  isSubmitting = false,
  hasUnsavedChanges = false
}: ArticleEditorLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const getStatusBadge = () => {
    const statusConfig = {
      draft: { label: 'Draft', variant: 'secondary' as const, color: 'text-gray-600' },
      review: { label: 'Review', variant: 'outline' as const, color: 'text-amber-600' },
      published: { label: 'Published', variant: 'default' as const, color: 'text-green-600' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <Badge variant={config.variant} className={cn("flex items-center gap-2", config.color)}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="w-full space-y-8">
      {/* Navigation & Header - Matching match view page style */}
      <div className="space-y-6">
        {/* Back Button */}
        <Button onClick={onBack} variant="ghost" size="sm" className="p-0 h-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Articles
        </Button>

        {/* Article Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-lg text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            {onPreview && (
              <Button
                onClick={onPreview}
                variant="outline"
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            )}
            {onSave && (
              <Button
                onClick={onSave}
                disabled={isSubmitting || !hasUnsavedChanges}
                size="sm"
                className="min-w-[100px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Improved Layout for EditorJS */}
      <div className="flex gap-6">
        {/* Left Column - Editor (takes most space) */}
        <div className={cn(
          "flex-1 min-w-0 transition-all duration-300",
          isSidebarCollapsed ? "w-full" : "w-0"
        )}>
          {editorContent}
        </div>

        {/* Right Column - Collapsible Sidebar */}
        <div className={cn(
          "transition-all duration-300 flex-shrink-0",
          isSidebarCollapsed ? "w-0 overflow-hidden" : "w-80"
        )}>
          <div className="sticky top-6">
            {sidebarContent}
          </div>
        </div>

        {/* Sidebar Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="fixed right-6 bottom-6 z-50 shadow-lg"
        >
          {isSidebarCollapsed ? <Settings className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}