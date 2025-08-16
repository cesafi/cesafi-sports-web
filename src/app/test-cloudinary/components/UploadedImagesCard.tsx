'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Images, Trash2, RefreshCw, Wand2 } from 'lucide-react';
import Image from 'next/image';
import { UploadedImage } from '../page';

interface UploadedImagesCardProps {
  uploadedImages: UploadedImage[];
  handleDelete: (publicId: string) => Promise<void>;
  handleUpdate: (publicId: string) => Promise<void>;
  applyTransformations: (publicId: string) => void;
  resetTransformations: (publicId: string) => void;
  selectedFile: File | null;
  cloudinary: {
    isUpdating: boolean;
    isDeleting: boolean;
  };
}

export function UploadedImagesCard({ 
  uploadedImages, 
  handleDelete, 
  handleUpdate, 
  applyTransformations, 
  resetTransformations,
  selectedFile,
  cloudinary 
}: UploadedImagesCardProps) {
  if (uploadedImages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Images className="h-5 w-5" />
            Uploaded Images
          </CardTitle>
          <CardDescription>
            Manage your uploaded images and test CRUD operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Images className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No images uploaded yet</p>
            <p className="text-sm">Upload an image above to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Images className="h-5 w-5" />
          Uploaded Images ({uploadedImages.length})
        </CardTitle>
        <CardDescription>
          Manage your uploaded images and test CRUD operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uploadedImages.map((image) => (
            <div key={image.publicId} className="space-y-3">
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                <Image
                  src={image.url}
                  alt={`Image ${image.publicId}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {image.publicId}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyTransformations(image.publicId)}
                    className="text-xs"
                  >
                    <Wand2 className="h-3 w-3 mr-1" />
                    Transform
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resetTransformations(image.publicId)}
                    className="text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdate(image.publicId)}
                    disabled={!selectedFile || cloudinary.isUpdating}
                    className="text-xs"
                  >
                    {cloudinary.isUpdating ? 'Updating...' : 'Update'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(image.publicId)}
                    disabled={cloudinary.isDeleting}
                    className="text-xs"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    {cloudinary.isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>

                {image.url !== image.originalUrl && (
                  <Badge variant="secondary" className="text-xs w-full justify-center">
                    Transformed
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}