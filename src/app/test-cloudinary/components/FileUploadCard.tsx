'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, File } from 'lucide-react';

interface FileUploadCardProps {
  selectedFile: File | null;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: () => Promise<void>;
  cloudinary: {
    isUploading: boolean;
    uploadError: string | null;
    uploadSuccess: boolean;
  };
}

export function FileUploadCard({ 
  selectedFile, 
  handleFileSelect, 
  handleUpload, 
  cloudinary 
}: FileUploadCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          File Upload
        </CardTitle>
        <CardDescription>
          Select and upload images to Cloudinary
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-input">Select Image File</Label>
          <Input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="cursor-pointer"
          />
        </div>

        {selectedFile && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <File className="h-4 w-4" />
            <div className="flex-1">
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile || cloudinary.isUploading}
          className="w-full"
        >
          {cloudinary.isUploading ? 'Uploading...' : 'Upload Image'}
        </Button>

        {cloudinary.uploadError && (
          <div className="text-sm text-red-600 p-2 bg-red-50 rounded">
            Error: {cloudinary.uploadError}
          </div>
        )}

        {cloudinary.uploadSuccess && (
          <div className="text-sm text-green-600 p-2 bg-green-50 rounded">
            Upload successful!
          </div>
        )}
      </CardContent>
    </Card>
  );
}