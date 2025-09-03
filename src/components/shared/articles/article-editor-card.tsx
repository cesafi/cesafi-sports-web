'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Edit3, Save, Loader2, AlertCircle, Eye, Edit } from 'lucide-react';
import { Article } from '@/lib/types/articles';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import Table from '@editorjs/table';
import Warning from '@editorjs/warning';
import Code from '@editorjs/code';
import { JSX } from 'react';

interface ArticleEditorCardProps {
  article: Article;
  onSave: (content: any) => Promise<void>;
  isSubmitting: boolean;
}

export function ArticleEditorCard({ article, onSave, isSubmitting }: ArticleEditorCardProps) {
  const editorRef = useRef<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewContent, setPreviewContent] = useState<any>(null);

  // EditorJS tools configuration
  const editorTools: any = {
    header: {
      class: Header,
      config: {
        placeholder: 'Enter a header',
        levels: [1, 2, 3, 4, 5, 6],
        defaultLevel: 2
      }
    },
    paragraph: {
      class: Paragraph,
      inlineToolbar: true
    },
    list: {
      class: List,
      inlineToolbar: true,
      config: {
        defaultStyle: 'unordered'
      }
    },
    quote: {
      class: Quote,
      inlineToolbar: true,
      config: {
        quotePlaceholder: 'Enter a quote',
        captionPlaceholder: 'Quote\'s author'
      }
    },
    delimiter: Delimiter,
    table: {
      class: Table,
      inlineToolbar: true,
      config: {
        rows: 2,
        cols: 3
      }
    },
    warning: {
      class: Warning,
      inlineToolbar: true,
      config: {
        titlePlaceholder: 'Title',
        messagePlaceholder: 'Message'
      }
    },
    code: {
      class: Code,
      config: {
        placeholder: 'Enter code'
      }
    }
  };

  // Initialize EditorJS
  useEffect(() => {
    const initEditor = () => {
      try {
        const editorElement = document.getElementById('editorjs');
        if (!editorElement) {
          setEditorError('Editor container not found');
          return;
        }

        // Clean up existing editor if it exists
        if (editorRef.current) {
          editorRef.current.destroy();
        }

        // Initialize new editor
        editorRef.current = new EditorJS({
          holder: 'editorjs',
          tools: editorTools,
          data: article.content as any || { blocks: [] },
          placeholder: 'Start writing your article...',
          onChange: () => {
            setHasUnsavedChanges(true);
          },
          onReady: () => {
            setIsEditorReady(true);
            setEditorError(null);
          }
        });

      } catch (error) {
        console.error('Failed to initialize EditorJS:', error);
        setEditorError('Failed to initialize editor. Please refresh the page.');
      }
    };

    initEditor();

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
      }
    };
  }, [article.id]);

  const handleSave = useCallback(async () => {
    if (!editorRef.current || !isEditorReady) {
      toast.error('Editor is not ready');
      return;
    }

    setIsSaving(true);
    try {
      const outputData = await editorRef.current.save();
      await onSave(outputData);
      setHasUnsavedChanges(false);
      toast.success('Article content saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save article content');
    } finally {
      setIsSaving(false);
    }
  }, [onSave, isEditorReady]);

  const handlePreview = useCallback(async () => {
    if (!editorRef.current || !isEditorReady) {
      toast.error('Editor is not ready');
      return;
    }

    try {
      const outputData = await editorRef.current.save();
      setPreviewContent(outputData);
      setIsPreviewMode(true);
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to generate preview');
    }
  }, [isEditorReady]);

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges || !isEditorReady) return;

    const autoSaveTimer = setTimeout(() => {
      handleSave();
    }, 30000); // Auto-save after 30 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [hasUnsavedChanges, handleSave, isEditorReady]);

  // Render preview content
  const renderPreviewContent = () => {
    if (!previewContent || !previewContent.blocks) {
      return <div className="text-center text-muted-foreground py-8">No content to preview</div>;
    }

    return (
      <div className="prose prose-lg max-w-none dark:prose-invert">
        {previewContent.blocks.map((block: any, index: number) => {
          switch (block.type) {
            case 'header':
              const HeaderTag = `h${block.data.level}` as keyof JSX.IntrinsicElements;
              return <HeaderTag key={index}>{block.data.text}</HeaderTag>;
            
            case 'paragraph':
              return <p key={index}>{block.data.text}</p>;
            
            case 'list':
              const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
              return (
                <ListTag key={index}>
                  {block.data.items.map((item: string, itemIndex: number) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ListTag>
              );
            
            case 'quote':
              return (
                <blockquote key={index}>
                  <p>{block.data.text}</p>
                  {block.data.caption && <cite>{block.data.caption}</cite>}
                </blockquote>
              );
            
            case 'code':
              return (
                <pre key={index}>
                  <code>{block.data.code}</code>
                </pre>
              );
            
            case 'table':
              return (
                <table key={index}>
                  <tbody>
                    {block.data.content.map((row: string[], rowIndex: number) => (
                      <tr key={rowIndex}>
                        {row.map((cell: string, cellIndex: number) => (
                          <td key={cellIndex}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            
            case 'warning':
              return (
                <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 dark:bg-yellow-900/20 dark:border-yellow-600">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        {block.data.title}
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                        {block.data.message}
                      </div>
                    </div>
                  </div>
                </div>
              );
            
            case 'simpleImage':
              return (
                <figure key={index} className="my-4">
                  <img 
                    src={block.data.url} 
                    alt={block.data.caption || 'Article image'} 
                    className="max-w-full h-auto rounded-lg"
                  />
                  {block.data.caption && (
                    <figcaption className="text-center text-sm text-muted-foreground mt-2">
                      {block.data.caption}
                    </figcaption>
                  )}
                </figure>
              );
            
            case 'embed':
              return (
                <div key={index} className="my-4">
                  <iframe
                    src={block.data.embed}
                    width="100%"
                    height="400"
                    frameBorder="0"
                    allowFullScreen
                    className="rounded-lg"
                  />
                </div>
              );
            
            default:
              return <div key={index} className="text-muted-foreground">Unsupported block type: {block.type}</div>;
          }
        })}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isPreviewMode ? (
              <>
                <Eye className="h-5 w-5" />
                <span className="font-semibold">Article Preview</span>
              </>
            ) : (
              <>
                <Edit3 className="h-5 w-5" />
                <span className="font-semibold">Article Content</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isPreviewMode ? (
              <Button
                onClick={() => setIsPreviewMode(false)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <Edit className="h-4 w-4" />
                <span>Continue Editing</span>
              </Button>
            ) : (
              <>
                <Button
                  onClick={handlePreview}
                  variant="outline"
                  size="sm"
                  disabled={!isEditorReady || isSaving || isSubmitting}
                  className="flex items-center space-x-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>Preview</span>
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!isEditorReady || isSaving || isSubmitting}
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  {isSaving || isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save Content'}</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Editor/Preview Content */}
      <div className="flex-1 p-4 overflow-hidden">
        {isPreviewMode ? (
          // Preview Mode
          <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {/* Article Header */}
              <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold mb-4">{article.title || 'Untitled Article'}</h1>
                {article.authored_by && (
                  <p className="text-lg text-muted-foreground">By {article.authored_by}</p>
                )}
                {article.cover_image_url && (
                  <img 
                    src={article.cover_image_url} 
                    alt="Article cover" 
                    className="w-full max-w-2xl mx-auto rounded-lg shadow-lg my-6"
                  />
                )}
              </div>
              
              {/* Article Content */}
              <div className="prose prose-lg max-w-none dark:prose-invert">
                {renderPreviewContent()}
              </div>
            </div>
          </div>
        ) : (
          // Editor Mode
          <>
            {editorError ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center h-32 border-2 border-red-300 rounded-lg bg-red-50">
                  <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-700 font-medium text-sm">EditorJS Error</p>
                    <p className="text-red-600 text-xs">{editorError}</p>
                  </div>
                </div>
                
                {/* Fallback Simple Editor */}
                <div className="h-full flex flex-col space-y-2">
                  <Label htmlFor="fallback-editor">Article Content (Fallback Editor)</Label>
                  <textarea
                    id="fallback-editor"
                    className="flex-1 w-full p-4 border rounded-lg resize-none bg-background"
                    placeholder="Enter your article content here... (Install EditorJS for rich text editing)"
                    defaultValue={typeof article.content === 'string' ? article.content : JSON.stringify(article.content, null, 2)}
                    onChange={(e) => setHasUnsavedChanges(true)}
                  />
                  <p className="text-xs text-muted-foreground">
                    To enable rich text editing, install EditorJS packages: 
                    <code className="bg-gray-100 px-1 rounded text-xs ml-1">
                      npm install @editorjs/editorjs @editorjs/header @editorjs/list @editorjs/paragraph @editorjs/quote @editorjs/delimiter @editorjs/table @editorjs/warning @editorjs/code @editorjs/link @editorjs/embed @editorjs/simple-image
                    </code>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {!isEditorReady && (
                  <div className="flex items-center justify-center h-32 border-2 border-blue-300 rounded-lg bg-blue-50">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                      <p className="text-blue-700">Loading editor...</p>
                    </div>
                  </div>
                )}
                <div className="h-full flex flex-col">
                  <div 
                    id="editorjs" 
                    className={`min-h-[400px] flex-1 border-2 border-dashed border-border rounded-lg p-4 bg-background ${!isEditorReady ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                    style={{ 
                      minHeight: '400px',
                      position: 'relative'
                    }}
                  >
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}