'use client';

import { useState } from 'react';
import { useCloudinary } from '@/hooks/use-cloudinary';
import { CloudinaryUploadOptions } from '@/lib/types/cloudinary';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// Components
import { ServiceStatusCard } from './components/ServiceStatusCard';
import { FileUploadCard } from './components/FileUploadCard';
import { TransformationsCard } from './components/TransformationsCard';
import { UploadedImagesCard } from './components/UploadedImagesCard';
import { FunctionTestingCard } from './components/FunctionTestingCard';

// Types
export interface UploadedImage {
    publicId: string;
    url: string;
    originalUrl: string;
}

export interface TestResult {
    success: boolean;
    message: string;
    duration?: number;
}

// Temporarily disabled for testing
export default function TestCloudinaryPage() {
    // State
    const cloudinary = useCloudinary();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [transformWidth, setTransformWidth] = useState(300);
    const [transformHeight, setTransformHeight] = useState(300);
    const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
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
            // Test with proper resource type syntax and CDN invalidation
            const result = await cloudinary.deleteImage(testPublicId, {
                resourceType: 'image',
                invalidate: true // Invalidate CDN cache
            });

            const duration = Date.now() - startTime;

            if (result.success) {
                setTestResults(prev => ({
                    ...prev,
                    deleteImage: {
                        success: true,
                        message: `Delete test completed!\nPublic ID: ${testPublicId}\nStatus: ${result.data?.info || 'Mock delete simulation'}\nNote: This is a client-side simulation. For production, implement server-side delete API.`,
                        duration
                    }
                }));
                setTestPublicId(''); // Clear the test public ID
                toast.success('Delete test passed (simulated)!');
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

    // Shared props for components
    const sharedProps = {
        cloudinary,
        selectedFile,
        setSelectedFile,
        uploadedImages,
        setUploadedImages,
        transformWidth,
        setTransformWidth,
        transformHeight,
        setTransformHeight,
        testResults,
        setTestResults,
        testPublicId,
        setTestPublicId,
        isTesting,
        setIsTesting,
        handleFileSelect,
        handleUpload,
        handleDelete,
        handleUpdate,
        applyTransformations,
        resetTransformations,
        testUploadImage,
        testGetImageUrl,
        testUpdateImage,
        testDeleteImage,
        runAllTests
    };

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Cloudinary Test Suite</h1>
                <p className="text-muted-foreground">
                    Comprehensive testing for Cloudinary CRUD operations, transformations, and API functions
                </p>
            </div>

            {/* Service Status */}
            <ServiceStatusCard cloudinary={cloudinary} />

            {/* Upload and Transformations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <FileUploadCard {...sharedProps} />
                <TransformationsCard {...sharedProps} />
            </div>

            <Separator className="my-8" />

            {/* Uploaded Images Management */}
            <UploadedImagesCard {...sharedProps} />

            <Separator className="my-8" />

            {/* Function Testing Suite */}
            <FunctionTestingCard {...sharedProps} />

            <Separator className="my-6" />

            {/* Global Reset */}
            <div className="flex justify-center">
                <Card className="p-6">
                    <div className="text-center space-y-4">
                        <h3 className="font-medium">Reset All States</h3>
                        <p className="text-sm text-muted-foreground">
                            Clear all hook states and testing results
                        </p>
                        <Button
                            onClick={() => {
                                cloudinary.resetState();
                                setTestResults({});
                                setTestPublicId('');
                                setUploadedImages([]);
                                toast.success('All states and data cleared');
                            }}
                            variant="outline"
                        >
                            Reset Everything
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
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
            message: `Upload successful! Public ID: ${result.data?.public_id || 'Unknown'}`,
            duration
          }
        }));
        setTestPublicId(result.data?.public_id);
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
            message: `Update successful! New URL: ${result.data?.secure_url?.substring(0, 50) || 'Unknown'}...`,
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
      // Test with proper resource type syntax and CDN invalidation
      const result = await cloudinary.deleteImage(testPublicId, {
        resourceType: 'image',
        invalidate: true // Invalidate CDN cache
      });

      const duration = Date.now() - startTime;
      
      if (result.success) {
        setTestResults(prev => ({
          ...prev,
          deleteImage: {
            success: true,
            message: `Delete test completed!\nPublic ID: ${testPublicId}\nStatus: ${result.data?.info || 'Mock delete simulation'}\nNote: This is a client-side simulation. For production, implement server-side delete API.`,
            duration
          }
        }));
        setTestPublicId(''); // Clear the test public ID
        toast.success('Delete test passed (simulated)!');
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

  // Shared props for components
  const sharedProps = {
    cloudinary,
    selectedFile,
    setSelectedFile,
    uploadedImages,
    setUploadedImages,
    transformWidth,
    setTransformWidth,
    transformHeight,
    setTransformHeight,
    testResults,
    setTestResults,
    testPublicId,
    setTestPublicId,
    isTesting,
    setIsTesting,
    handleFileSelect,
    handleUpload,
    handleDelete,
    handleUpdate,
    applyTransformations,
    resetTransformations,
    testUploadImage,
    testGetImageUrl,
    testUpdateImage,
    testDeleteImage,
    runAllTests
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cloudinary Test Suite</h1>
        <p className="text-muted-foreground">
          Comprehensive testing for Cloudinary CRUD operations, transformations, and API functions
        </p>
      </div>

      {/* Service Status */}
      <ServiceStatusCard cloudinary={cloudinary} />

      {/* Upload and Transformations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <FileUploadCard {...sharedProps} />
        <TransformationsCard {...sharedProps} />
      </div>

      <Separator className="my-8" />

      {/* Uploaded Images Management */}
      <UploadedImagesCard {...sharedProps} />

      <Separator className="my-8" />

      {/* Function Testing Suite */}
      <FunctionTestingCard {...sharedProps} />

      <Separator className="my-6" />

      {/* Global Reset */}
      <div className="flex justify-center">
        <Card className="p-6">
          <div className="text-center space-y-4">
            <h3 className="font-medium">Reset All States</h3>
            <p className="text-sm text-muted-foreground">
              Clear all hook states and testing results
            </p>
            <Button
              onClick={() => {
                cloudinary.resetState();
                setTestResults({});
                setTestPublicId('');
                setUploadedImages([]);
                toast.success('All states and data cleared');
              }}
              variant="outline"
            >
              Reset Everything
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
