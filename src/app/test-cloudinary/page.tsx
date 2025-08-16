'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCloudinary } from '@/hooks/use-cloudinary';
import { CloudinaryUploadOptions } from '@/lib/types/cloudinary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface UploadedImage {
  publicId: string;
  url: string;
  originalUrl: string;
}

export default function TestCloudinaryPage() {
  const cloudinary = useCloudinary();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [transformWidth, setTransformWidth] = useState(300);
  const [transformHeight, setTransformHeight] = useState(300);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; duration?: number }>>({});
  const [testPublicId, setTestPublicId] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    try {
      const uploadOptions: CloudinaryUploadOptions = {
        folder: 'cesafi-test',
        resource_type: 'auto'
      };

      const result = await cloudinary.uploadImage(selectedFile, uploadOptions);
      
      if (result.success && result.data) {
        const newImage: UploadedImage = {
          publicId: result.data.public_id,
          url: result.data.secure_url,
          originalUrl: result.data.secure_url
        };
        
        setUploadedImages(prev => [...prev, newImage]);
        setSelectedFile(null);
        toast.success('Image uploaded successfully!');
        
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        toast.error(result.error || 'Upload failed');
      }
    } catch (error) {
      toast.error('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDelete = async (publicId: string) => {
    try {
      const result = await cloudinary.deleteImage(publicId);
      
      if (result.success) {
        setUploadedImages(prev => prev.filter(img => img.publicId !== publicId));
        toast.success('Image deleted successfully!');
      } else {
        toast.error(result.error || 'Delete failed');
      }
    } catch (error) {
      toast.error('Delete failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleUpdate = async (publicId: string) => {
    if (!selectedFile) {
      toast.error('Please select a new file first');
      return;
    }

    try {
      const result = await cloudinary.updateImage(publicId, selectedFile);
      
      if (result.success && result.data) {
        setUploadedImages(prev => 
          prev.map(img => 
            img.publicId === publicId 
              ? { ...img, url: result.data!.secure_url, originalUrl: result.data!.secure_url }
              : img
          )
        );
        setSelectedFile(null);
        toast.success('Image updated successfully!');
        
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        toast.error(result.error || 'Update failed');
      }
    } catch (error) {
      toast.error('Update failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const applyTransformations = (publicId: string) => {
    const transformedUrl = cloudinary.getImageUrl(publicId, {
      width: transformWidth,
      height: transformHeight,
      crop: 'fill',
      quality: 'auto'
    });
    
    setUploadedImages(prev => 
      prev.map(img => 
        img.publicId === publicId 
          ? { ...img, url: transformedUrl }
          : img
      )
    );
    toast.success('Transformations applied!');
  };

  const resetTransformations = (publicId: string) => {
    setUploadedImages(prev => 
      prev.map(img => 
        img.publicId === publicId 
          ? { ...img, url: img.originalUrl }
          : img
      )
    );
    toast.success('Transformations reset!');
  };

  // Testing Functions
  const testUploadImage = async () => {
    if (!selectedFile) {
      toast.error('Please select a file for upload test');
      return;
    }

    const startTime = Date.now();
    try {
      setIsTesting(true);
      const result = await cloudinary.uploadImage(selectedFile, {
        folder: 'cesafi-test-upload',
        resource_type: 'auto'
      });

      const duration = Date.now() - startTime;
      
      if (result.success && result.data) {
        setTestResults(prev => ({
          ...prev,
          uploadImage: {
            success: true,
            message: `Upload successful! Public ID: ${result.data.public_id}`,
            duration
          }
        }));
        setTestPublicId(result.data.public_id);
        toast.success('Upload test passed!');
      } else {
        setTestResults(prev => ({
          ...prev,
          uploadImage: {
            success: false,
            message: result.error || 'Upload failed',
            duration
          }
        }));
        toast.error('Upload test failed!');
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      setTestResults(prev => ({
        ...prev,
        uploadImage: {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          duration
        }
      }));
      toast.error('Upload test threw error!');
    } finally {
      setIsTesting(false);
    }
  };

  const testGetImageUrl = () => {
    if (!testPublicId) {
      toast.error('Please run upload test first to get a public ID');
      return;
    }

    const startTime = Date.now();
    try {
      setIsTesting(true);
      
      // Test basic URL generation
      const basicUrl = cloudinary.getImageUrl(testPublicId);
      
      // Test URL with transformations
      const transformedUrl = cloudinary.getImageUrl(testPublicId, {
        width: 200,
        height: 200,
        crop: 'fill',
        quality: 'auto',
        format: 'webp'
      });

      const duration = Date.now() - startTime;
      
      if (basicUrl && transformedUrl) {
        setTestResults(prev => ({
          ...prev,
          getImageUrl: {
            success: true,
            message: `URLs generated successfully!\nBasic: ${basicUrl.substring(0, 50)}...\nTransformed: ${transformedUrl.substring(0, 50)}...`,
            duration
          }
        }));
        toast.success('URL generation test passed!');
      } else {
        setTestResults(prev => ({
          ...prev,
          getImageUrl: {
            success: false,
            message: 'Failed to generate URLs',
            duration
          }
        }));
        toast.error('URL generation test failed!');
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      setTestResults(prev => ({
        ...prev,
        getImageUrl: {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          duration
        }
      }));
      toast.error('URL generation test threw error!');
    } finally {
      setIsTesting(false);
    }
  };

  const testUpdateImage = async () => {
    if (!testPublicId) {
      toast.error('Please run upload test first to get a public ID');
      return;
    }
    if (!selectedFile) {
      toast.error('Please select a file for update test');
      return;
    }

    const startTime = Date.now();
    try {
      setIsTesting(true);
      const result = await cloudinary.updateImage(testPublicId, selectedFile, {
        overwrite: true
      });

      const duration = Date.now() - startTime;
      
      if (result.success && result.data) {
        setTestResults(prev => ({
          ...prev,
          updateImage: {
            success: true,
            message: `Update successful! New URL: ${result.data.secure_url.substring(0, 50)}...`,
            duration
          }
        }));
        toast.success('Update test passed!');
      } else {
        setTestResults(prev => ({
          ...prev,
          updateImage: {
            success: false,
            message: result.error || 'Update failed',
            duration
          }
        }));
        toast.error('Update test failed!');
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      setTestResults(prev => ({
        ...prev,
        updateImage: {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          duration
        }
      }));
      toast.error('Update test threw error!');
    } finally {
      setIsTesting(false);
    }
  };

  const testDeleteImage = async () => {
    if (!testPublicId) {
      toast.error('Please run upload test first to get a public ID');
      return;
    }

    const startTime = Date.now();
    try {
      setIsTesting(true);
      const result = await cloudinary.deleteImage(testPublicId);

      const duration = Date.now() - startTime;
      
      if (result.success) {
        setTestResults(prev => ({
          ...prev,
          deleteImage: {
            success: true,
            message: 'Delete successful!',
            duration
          }
        }));
        setTestPublicId(''); // Clear the test public ID
        toast.success('Delete test passed!');
      } else {
        setTestResults(prev => ({
          ...prev,
          deleteImage: {
            success: false,
            message: result.error || 'Delete failed',
            duration
          }
        }));
        toast.error('Delete test failed!');
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      setTestResults(prev => ({
        ...prev,
        deleteImage: {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          duration
        }
      }));
      toast.error('Delete test threw error!');
    } finally {
      setIsTesting(false);
    }
  };

  const runAllTests = async () => {
    if (!selectedFile) {
      toast.error('Please select a file before running all tests');
      return;
    }

    toast.info('Running all tests...');
    await testUploadImage();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    testGetImageUrl();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await testUpdateImage();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await testDeleteImage();
    toast.success('All tests completed!');
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cloudinary Test Page</h1>
        <p className="text-muted-foreground">
          Test all Cloudinary CRUD operations and image transformations
        </p>
      </div>

      {/* Status Display */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>Monitor all hook states and operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant={cloudinary.isLoading ? 'destructive' : 'secondary'}>
              Loading: {cloudinary.isLoading ? 'Yes' : 'No'}
            </Badge>
            <Badge variant={cloudinary.hasError ? 'destructive' : 'secondary'}>
              Error: {cloudinary.hasError ? 'Yes' : 'No'}
            </Badge>
            <Badge variant={cloudinary.hasSuccess ? 'default' : 'secondary'}>
              Success: {cloudinary.hasSuccess ? 'Yes' : 'No'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium">Upload</p>
              <p>Loading: {cloudinary.isUploading ? '🔄' : '✅'}</p>
              <p>Success: {cloudinary.uploadSuccess ? '✅' : '❌'}</p>
              <p>Error: {cloudinary.uploadError || 'None'}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Update</p>
              <p>Loading: {cloudinary.isUpdating ? '🔄' : '✅'}</p>
              <p>Success: {cloudinary.updateSuccess ? '✅' : '❌'}</p>
              <p>Error: {cloudinary.updateError || 'None'}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Delete</p>
              <p>Loading: {cloudinary.isDeleting ? '🔄' : '✅'}</p>
              <p>Success: {cloudinary.deleteSuccess ? '✅' : '❌'}</p>
              <p>Error: {cloudinary.deleteError || 'None'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload & Update</CardTitle>
            <CardDescription>
              Select a file to upload or update existing images
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file-input">Select File</Label>
              <Input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={cloudinary.isLoading}
              />
            </div>
            
            {selectedFile && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}

            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || cloudinary.isUploading}
              className="w-full"
            >
              {cloudinary.isUploading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </CardContent>
        </Card>

        {/* Transformations Section */}
        <Card>
          <CardHeader>
            <CardTitle>Image Transformations</CardTitle>
            <CardDescription>
              Configure transformations to apply to images
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  value={transformWidth}
                  onChange={(e) => setTransformWidth(parseInt(e.target.value) || 300)}
                />
              </div>
              <div>
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  value={transformHeight}
                  onChange={(e) => setTransformHeight(parseInt(e.target.value) || 300)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* Uploaded Images Section */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Images ({uploadedImages.length})</CardTitle>
          <CardDescription>
            Manage your uploaded images with CRUD operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadedImages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No images uploaded yet. Upload an image to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploadedImages.map((image) => (
                <Card key={image.publicId}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <Image
                        src={image.url}
                        alt={image.publicId}
                        width={300}
                        height={192}
                        className="w-full h-48 object-cover rounded-md"
                        unoptimized
                      />
                      
                      <div className="text-xs text-muted-foreground break-all">
                        ID: {image.publicId}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => applyTransformations(image.publicId)}
                          className="w-full"
                        >
                          Apply Transformations
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resetTransformations(image.publicId)}
                          className="w-full"
                        >
                          Reset
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleUpdate(image.publicId)}
                          disabled={!selectedFile || cloudinary.isUpdating}
                          className="w-full"
                        >
                          {cloudinary.isUpdating ? 'Updating...' : 'Update'}
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(image.publicId)}
                          disabled={cloudinary.isDeleting}
                          className="w-full"
                        >
                          {cloudinary.isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Function Testing Section */}
      <Card>
        <CardHeader>
          <CardTitle>Function Testing Suite</CardTitle>
          <CardDescription>
            Test individual Cloudinary service functions with detailed results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Public ID Display */}
          {testPublicId && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">Current Test Public ID:</p>
              <p className="text-xs text-muted-foreground break-all">{testPublicId}</p>
            </div>
          )}

          {/* Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Button 
              onClick={testUploadImage}
              disabled={!selectedFile || isTesting}
              variant="outline"
            >
              {isTesting ? 'Testing...' : 'Test Upload'}
            </Button>
            
            <Button 
              onClick={testGetImageUrl}
              disabled={!testPublicId || isTesting}
              variant="outline"
            >
              {isTesting ? 'Testing...' : 'Test Get URL'}
            </Button>
            
            <Button 
              onClick={testUpdateImage}
              disabled={!testPublicId || !selectedFile || isTesting}
              variant="outline"
            >
              {isTesting ? 'Testing...' : 'Test Update'}
            </Button>
            
            <Button 
              onClick={testDeleteImage}
              disabled={!testPublicId || isTesting}
              variant="outline"
            >
              {isTesting ? 'Testing...' : 'Test Delete'}
            </Button>
            
            <Button 
              onClick={runAllTests}
              disabled={!selectedFile || isTesting}
              variant="default"
            >
              {isTesting ? 'Running...' : 'Run All Tests'}
            </Button>
          </div>

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Test Results:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(testResults).map(([functionName, result]) => (
                  <Card key={functionName}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{functionName}</h5>
                          <Badge variant={result.success ? 'default' : 'destructive'}>
                            {result.success ? 'PASS' : 'FAIL'}
                          </Badge>
                        </div>
                        
                        {result.duration && (
                          <p className="text-xs text-muted-foreground">
                            Duration: {result.duration}ms
                          </p>
                        )}
                        
                        <div className="text-xs">
                          <pre className="whitespace-pre-wrap break-words">
                            {result.message}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Clear Test Results */}
          {Object.keys(testResults).length > 0 && (
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setTestResults({});
                  setTestPublicId('');
                  toast.success('Test results cleared');
                }}
                variant="outline"
                size="sm"
              >
                Clear Test Results
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Reset Button */}
      <div className="flex justify-center">
        <Button
          onClick={() => {
            cloudinary.resetState();
            toast.success('All states reset');
          }}
          variant="outline"
        >
          Reset All States
        </Button>
      </div>
    </div>
  );
}