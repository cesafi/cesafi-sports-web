'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ArticleEditorLayoutProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  editorContent: ReactNode;
  sidebarContent: ReactNode;
}

export function ArticleEditorLayout({
  title,
  subtitle,
  onBack,
  editorContent,
  sidebarContent
}: ArticleEditorLayoutProps) {
  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-background">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Editor (takes most space) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {editorContent}
        </div>

        {/* Right Column - Sidebar */}
        <div className="w-80 border-l bg-muted/30 flex flex-col overflow-hidden">
          {sidebarContent}
        </div>
      </div>
    </div>
  );
}