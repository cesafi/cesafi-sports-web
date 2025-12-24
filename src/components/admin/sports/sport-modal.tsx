'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ModalLayout } from '@/components/ui/modal-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Sport,
  SportCategory,
  SportCategoryUpdate,
  SportDivision,
  SportLevel,
  SportCategoryFormData
} from '@/lib/types/sports';
import { createSportSchema, updateSportSchema } from '@/lib/validations/sports';
import { z, ZodError } from 'zod';
import { Plus, Trash2, Edit2, X, Save } from 'lucide-react';
import {
  getSportCategoriesBySportId,
  updateSportCategoryById,
  deleteSportCategoryById
} from '@/actions/sport-categories';
import { formatCategoryName } from '@/lib/utils/sports';

interface SportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  sport?: Sport;
  onSubmit: (data: z.infer<typeof createSportSchema> | z.infer<typeof updateSportSchema>) => Promise<void>;
  isSubmitting: boolean;
  onSuccess?: () => void;
  onCategoriesChange?: (categories: SportCategoryFormData[]) => void;
}

interface CategoryFormData {
  division: SportDivision;
  levels: SportLevel;
}

interface ExistingCategoryData extends SportCategory {
  isEditing?: boolean;
  tempDivision?: string;
  tempLevels?: string;
}

export function SportModal({
  open,
  onOpenChange,
  mode,
  sport,
  onSubmit,
  isSubmitting,
  onSuccess,
  onCategoriesChange
}: SportModalProps) {
  // State management
  const [formData, setFormData] = useState<z.infer<typeof createSportSchema> | z.infer<typeof updateSportSchema>>({
    name: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<CategoryFormData[]>([]);
  const [categoryErrors, setCategoryErrors] = useState<Record<string, string>>({});
  const [existingCategories, setExistingCategories] = useState<ExistingCategoryData[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const hasStartedCreating = useRef(false);
  const hasStartedUpdating = useRef(false);

  // Memoize handleClose to prevent unnecessary re-renders
  const handleClose = useCallback(() => {
    setErrors({});
    setCategoryErrors({});
    setCategories([]);
    setExistingCategories([]);
    onOpenChange(false);
  }, [onOpenChange]);

  // Form reset on modal open/close
  useEffect(() => {
    if (open) {
      // Reset form data based on mode
      if (mode === 'edit' && sport) {
        setFormData({
          id: sport.id,
          name: sport.name
        });
        // Fetch existing categories for this sport
        fetchExistingCategories(sport.id);
      } else {
        setFormData({
          name: ''
        });
        setExistingCategories([]);
      }
      setErrors({});
      setCategoryErrors({});
      setCategories([]);
      hasStartedCreating.current = false;
      hasStartedUpdating.current = false;
    }
  }, [open, mode, sport]);

  // Fetch existing categories when editing
  const fetchExistingCategories = async (sportId: number) => {
    setLoadingCategories(true);
    try {
      const result = await getSportCategoriesBySportId(sportId);
      if (result.success && result.data) {
        setExistingCategories(
          result.data.map((cat) => ({
            ...cat,
            isEditing: false,
            tempDivision: cat.division,
            tempLevels: cat.levels
          }))
        );
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load existing categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Notify parent when categories change (for new categories only)
  useEffect(() => {
    onCategoriesChange?.(categories);
  }, [categories, onCategoriesChange]);

  // Handle mutation completion
  useEffect(() => {
    if (hasStartedCreating.current && !isSubmitting && mode === 'add') {
      hasStartedCreating.current = false;
      onSuccess?.();
      handleClose();
    }
  }, [isSubmitting, mode, handleClose, onSuccess]);

  useEffect(() => {
    if (hasStartedUpdating.current && !isSubmitting && mode === 'edit') {
      hasStartedUpdating.current = false;
      onSuccess?.();
      handleClose();
    }
  }, [isSubmitting, mode, handleClose, onSuccess]);

  // Handle modal open/change
  const handleModalOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        handleClose();
      }
    },
    [handleClose]
  );

  // New category management
  const addCategory = () => {
    setCategories([...categories, { division: 'men', levels: 'elementary' }]);
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateCategory = (index: number, field: keyof CategoryFormData, value: string) => {
    const newCategories = [...categories];
    newCategories[index] = { ...newCategories[index], [field]: value };
    setCategories(newCategories);

    // Clear error for this field
    if (categoryErrors[`${index}-${field}`]) {
      setCategoryErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${index}-${field}`];
        return newErrors;
      });
    }
  };

  // Existing category management
  const startEditingCategory = (categoryId: number) => {
    setExistingCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, isEditing: true } : cat))
    );
  };

  const cancelEditingCategory = (categoryId: number) => {
    setExistingCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              isEditing: false,
              tempDivision: cat.division,
              tempLevels: cat.levels
            }
          : cat
      )
    );
  };

  const updateExistingCategory = (
    categoryId: number,
    field: 'division' | 'levels',
    value: string
  ) => {
    setExistingCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, [`temp${field.charAt(0).toUpperCase() + field.slice(1)}`]: value }
          : cat
      )
    );
  };

  const saveExistingCategory = async (categoryId: number) => {
    const category = existingCategories.find((cat) => cat.id === categoryId);
    if (!category) return;

    try {
      const updateData: SportCategoryUpdate = {
        id: categoryId,
        division: category.tempDivision as 'men' | 'women' | 'mixed',
        levels: category.tempLevels as 'elementary' | 'high_school' | 'college'
      };

      const result = await updateSportCategoryById(updateData);
      if (result.success) {
        setExistingCategories((prev) =>
          prev.map((cat) =>
            cat.id === categoryId
              ? {
                  ...cat,
                  isEditing: false,
                  division: updateData.division!,
                  levels: updateData.levels!,
                  tempDivision: updateData.division,
                  tempLevels: updateData.levels
                }
              : cat
          )
        );
        toast.success('Category updated successfully');
      } else {
        toast.error(result.error || 'Failed to update category');
      }
    } catch (_) {
      toast.error('Failed to update category');
    }
  };

  const deleteExistingCategory = async (categoryId: number) => {
    try {
      const result = await deleteSportCategoryById(categoryId);
      if (result.success) {
        setExistingCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
        toast.success('Category deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete category');
      }
    } catch (_) {
      toast.error('Failed to delete category');
    }
  };

  const validateCategories = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    categories.forEach((category, index) => {
      if (!category.division) {
        newErrors[`${index}-division`] = 'Division is required';
        isValid = false;
      }
      if (!category.levels) {
        newErrors[`${index}-levels`] = 'Level is required';
        isValid = false;
      }
    });

    setCategoryErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate sport data
      const schema = mode === 'add' ? createSportSchema : updateSportSchema;
      const validatedData = schema.parse(formData);

      // Validate categories if any are added
      if (categories.length > 0 && !validateCategories()) {
        return;
      }

      if (mode === 'add') {
        hasStartedCreating.current = true;
      } else {
        hasStartedUpdating.current = true;
      }

      await onSubmit(validatedData);
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation errors
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

  return (
    <ModalLayout
      open={open}
      onOpenChange={handleModalOpenChange}
      title={mode === 'add' ? 'Add New Sport' : 'Edit Sport'}
      maxWidth="max-w-4xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="sport-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'add' ? 'Create Sport' : 'Update Sport'}
          </Button>
        </div>
      }
    >
      <form id="sport-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Sport Information */}
        <Card>
          <CardHeader>
            <CardTitle>Sport Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Sport Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter sport name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Existing Categories Section (Edit Mode Only) */}
        {mode === 'edit' && (
          <Card>
            <CardHeader>
              <CardTitle>Existing Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingCategories ? (
                <p className="text-muted-foreground text-sm">Loading categories...</p>
              ) : existingCategories.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No existing categories found for this sport.
                </p>
              ) : (
                existingCategories.map((category) => (
                  <div key={category.id} className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">
                        Category {category.id} -{' '}
                        {formatCategoryName(category.division, category.levels)}
                      </h4>
                      <div className="flex gap-2">
                        {category.isEditing ? (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => saveExistingCategory(category.id)}
                              className="h-8 text-green-600 hover:text-green-700"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => cancelEditingCategory(category.id)}
                              className="h-8"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => startEditingCategory(category.id)}
                              className="h-8"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => deleteExistingCategory(category.id)}
                              className="h-8 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {category.isEditing ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Division</Label>
                          <Select
                            value={category.tempDivision}
                            onValueChange={(value) =>
                              updateExistingCategory(category.id, 'division', value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="men">Men</SelectItem>
                              <SelectItem value="women">Women</SelectItem>
                              <SelectItem value="mixed">Mixed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Level</Label>
                          <Select
                            value={category.tempLevels}
                            onValueChange={(value) =>
                              updateExistingCategory(category.id, 'levels', value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="elementary">Elementary</SelectItem>
                              <SelectItem value="high_school">High School</SelectItem>
                              <SelectItem value="college">College</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground grid grid-cols-2 gap-4 text-sm">
                        <div>
                          Division: {formatCategoryName(category.division, category.levels)}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* New Categories Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {mode === 'add' ? 'Sport Categories' : 'Add New Categories'}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCategory}
                className="h-8"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {mode === 'add'
                  ? 'No categories added yet. Click "Add Category" to create divisions and levels for this sport.'
                  : 'No new categories added yet. Click "Add Category" to create additional divisions and levels.'}
              </p>
            ) : (
              categories.map((category, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">New Category {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeCategory(index)}
                      className="h-8 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`division-${index}`}>Division *</Label>
                      <Select
                        value={category.division}
                        onValueChange={(value) => updateCategory(index, 'division', value)}
                      >
                        <SelectTrigger
                          className={categoryErrors[`${index}-division`] ? 'border-red-500' : ''}
                        >
                          <SelectValue placeholder="Select division" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="men">Men</SelectItem>
                          <SelectItem value="women">Women</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                      {categoryErrors[`${index}-division`] && (
                        <p className="text-sm text-red-500">
                          {categoryErrors[`${index}-division`]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`levels-${index}`}>Level *</Label>
                      <Select
                        value={category.levels}
                        onValueChange={(value) => updateCategory(index, 'levels', value)}
                      >
                        <SelectTrigger
                          className={categoryErrors[`${index}-levels`] ? 'border-red-500' : ''}
                        >
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="elementary">Elementary</SelectItem>
                          <SelectItem value="high_school">High School</SelectItem>
                          <SelectItem value="college">College</SelectItem>
                        </SelectContent>
                      </Select>
                      {categoryErrors[`${index}-levels`] && (
                        <p className="text-sm text-red-500">{categoryErrors[`${index}-levels`]}</p>
                      )}
                    </div>
                  </div>

                  {/* Show formatted category name */}
                  <div className="text-muted-foreground border-t pt-2 text-sm">
                    <span className="font-medium">Preview:</span>{' '}
                    {formatCategoryName(category.division, category.levels)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </form>
    </ModalLayout>
  );
}
