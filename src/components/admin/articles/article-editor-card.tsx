'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Edit3, Save, Loader2, AlertCircle } from 'lucide-react';
import { Article } from '@/lib/types/articles';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

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

  // Initialize EditorJS
  useEffect(() => {
    const initEditor = async () => {
      console.log('Initializing EditorJS for article:', article.id);
      try {
        // Check if EditorJS packages are installed
        let EditorJS, Header, List, Paragraph, Quote, Delimiter, Table, Warning, Code, LinkTool, Embed, SimpleImage;
        
        try {
          EditorJS = (await import('@editorjs/editorjs')).default;
          console.log('EditorJS imported successfully');
          
          // Try to import basic tools first
          try {
            Header = (await import('@editorjs/header')).default;
            List = (await import('@editorjs/list')).default;
            Paragraph = (await import('@editorjs/paragraph')).default;
            console.log('Basic tools imported successfully');
          } catch (basicToolsError) {
            console.log('Basic tools not available, using minimal setup');
          }
          
          // Try to import advanced tools
          try {
            Quote = (await import('@editorjs/quote')).default;
            Delimiter = (await import('@editorjs/delimiter')).default;
            Table = (await import('@editorjs/table')).default;
            Warning = (await import('@editorjs/warning')).default;
            Code = (await import('@editorjs/code')).default;
            LinkTool = (await import('@editorjs/link')).default;
            Embed = (await import('@editorjs/embed')).default;
            SimpleImage = (await import('@editorjs/simple-image')).default;
            console.log('Advanced tools imported successfully');
          } catch (advancedToolsError) {
            console.log('Advanced tools not available, using basic setup');
          }
        } catch (importError) {
          console.error('EditorJS packages not installed:', importError);
          setEditorError('EditorJS packages are not installed. Please run: npm install @editorjs/editorjs @editorjs/header @editorjs/list @editorjs/paragraph @editorjs/quote @editorjs/delimiter @editorjs/table @editorjs/warning @editorjs/code @editorjs/link @editorjs/embed @editorjs/simple-image');
          return;
        }

        // Custom Image Tool with Cloudinary integration
        const ImageTool = {
          class: class ImageTool {
            static get toolbox() {
              return {
                title: 'Image',
                icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-67 49v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>'
              };
            }

            constructor({ data }: { data: any }) {
              this.data = data;
              this.wrapper = undefined;
            }

            render() {
              const wrapper = document.createElement('div');
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.addEventListener('change', this.uploadImage.bind(this));

              if (this.data && this.data.url) {
                const img = document.createElement('img');
                img.src = this.data.url;
                img.style.maxWidth = '100%';
                wrapper.appendChild(img);
              } else {
                const placeholder = document.createElement('div');
                placeholder.innerHTML = 'Click to upload image';
                placeholder.style.padding = '20px';
                placeholder.style.border = '2px dashed #ccc';
                placeholder.style.textAlign = 'center';
                placeholder.style.cursor = 'pointer';
                placeholder.addEventListener('click', () => input.click());
                wrapper.appendChild(placeholder);
              }

              wrapper.appendChild(input);
              input.style.display = 'none';
              this.wrapper = wrapper;
              return wrapper;
            }

            async uploadImage(event: Event) {
              const file = (event.target as HTMLInputElement).files?.[0];
              if (!file) return;

              try {
                // Use Cloudinary service for upload
                const CloudinaryService = (await import('@/services/cloudinary')).default;
                const result = await CloudinaryService.uploadImage(file, {
                  folder: 'articles',
                  transformation: {
                    width: 800,
                    height: 600,
                    crop: 'limit',
                    quality: 'auto',
                    format: 'auto'
                  }
                });

                if (result.success && result.data) {
                  this.data = {
                    url: result.data.secure_url,
                    caption: ''
                  };

                  // Update the display
                  if (this.wrapper) {
                    this.wrapper.innerHTML = '';
                    const img = document.createElement('img');
                    img.src = this.data.url;
                    img.style.maxWidth = '100%';
                    this.wrapper.appendChild(img);
                  }
                } else {
                  toast.error('Failed to upload image');
                }
              } catch (error) {
                console.error('Image upload error:', error);
                toast.error('Failed to upload image');
              }
            }

            save() {
              return this.data;
            }
          }
        };

        if (editorRef.current) {
          editorRef.current.destroy();
        }

        // Build tools configuration based on what's available
        const tools: any = {};
        
        if (Header) {
          tools.header = {
            class: Header,
            config: {
              placeholder: 'Enter a header',
              levels: [1, 2, 3, 4, 5, 6],
              defaultLevel: 2
            }
          };
        }
        
        if (Paragraph) {
          tools.paragraph = {
            class: Paragraph,
            inlineToolbar: true
          };
        }
        
        if (List) {
          tools.list = {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: 'unordered'
            }
          };
        }
        
        if (Quote) {
          tools.quote = {
            class: Quote,
            inlineToolbar: true,
            config: {
              quotePlaceholder: 'Enter a quote',
              captionPlaceholder: 'Quote\'s author'
            }
          };
        }
        
        if (Delimiter) {
          tools.delimiter = Delimiter;
        }
        
        if (Table) {
          tools.table = {
            class: Table,
            inlineToolbar: true,
            config: {
              rows: 2,
              cols: 3
            }
          };
        }
        
        if (Warning) {
          tools.warning = {
            class: Warning,
            inlineToolbar: true,
            config: {
              titlePlaceholder: 'Title',
              messagePlaceholder: 'Message'
            }
          };
        }
        
        if (Code) {
          tools.code = {
            class: Code,
            config: {
              placeholder: 'Enter code'
            }
          };
        }
        
        if (SimpleImage) {
          tools.simpleImage = SimpleImage;
        }

        console.log('Available tools:', Object.keys(tools));

        // Wait a bit to ensure DOM is ready
        setTimeout(() => {
          const editorElement = document.getElementById('editorjs');
          if (!editorElement) {
            console.error('Editor element not found');
            setEditorError('Editor container not found');
            return;
          }

          editorRef.current = new EditorJS({
            holder: 'editorjs',
            placeholder: 'Start writing your article...',
            data: article.content || { blocks: [] },
            minHeight: 300,
            tools,
            onChange: () => {
              setHasUnsavedChanges(true);
            },
            onReady: () => {
              console.log('EditorJS is ready');
              setIsEditorReady(true);
              setEditorError(null);
              
              // Add some custom styling to ensure visibility
              const editorElement = document.getElementById('editorjs');
              if (editorElement) {
                const editorContent = editorElement.querySelector('.codex-editor');
                if (editorContent) {
                  (editorContent as HTMLElement).style.minHeight = '300px';
                  (editorContent as HTMLElement).style.padding = '20px';
                  (editorContent as HTMLElement).style.border = '1px solid #e5e7eb';
                  (editorContent as HTMLElement).style.borderRadius = '8px';
                  (editorContent as HTMLElement).style.backgroundColor = '#ffffff';
                }
              }
            }
          });
        }, 100);

      } catch (error) {
        console.error('Failed to initialize editor:', error);
        setEditorError('Failed to initialize editor. Using fallback editor.');
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

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges || !isEditorReady) return;

    const autoSaveTimer = setTimeout(() => {
      handleSave();
    }, 30000); // Auto-save after 30 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [hasUnsavedChanges, handleSave, isEditorReady]);

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Edit3 className="h-5 w-5" />
            <span className="font-semibold">Article Content</span>
          </div>
          <div className="flex items-center space-x-2">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Unsaved Changes
              </Badge>
            )}
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
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 p-4 overflow-hidden">
        {/* Debug info */}
        <div className="text-xs text-gray-500 mb-2">
          Editor Status: {isEditorReady ? 'Ready' : 'Loading'} | Error: {editorError ? 'Yes' : 'No'}
        </div>
        
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
                className="flex-1 w-full p-4 border rounded-lg resize-none"
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
                className={`min-h-[400px] flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 bg-background/80 ${!isEditorReady ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                style={{ 
                  minHeight: '400px',
                  position: 'relative'
                }}
              >
                {/* Placeholder when editor is ready but empty */}
                {isEditorReady && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-sm">
                    <span>Click here to start writing...</span>
                  </div>
                )}
              </div>
              
              {/* Editor Info - Fixed at bottom */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Editor Features:</strong> Rich text formatting, headers, lists, quotes, tables, 
                  code blocks, images (with Cloudinary), embeds, and more. Content is auto-saved every 30 seconds.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}