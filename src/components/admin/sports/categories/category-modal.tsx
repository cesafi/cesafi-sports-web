'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModalLayout } from '@/components/ui/modal-layout';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

import { createSportCategorySchema, updateSportCategorySchema } from '@/lib/validations/sport-categories';
import { SportCategory } from '@/lib/types/sports';

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  category?: SportCategory;
  sportId: number;
  onSubmit: (data: unknown) => Promise<void>;
  isSubmitting: boolean;
}

export function CategoryModal({
  open,
  onOpenChange,
  mode,
  category,
  sportId,
  onSubmit,
  isSubmitting
}: CategoryModalProps) {
  const [formData, setFormData] = useState<{
    id?: number;
    sport_id: number;
    division: 'men' | 'women' | 'mixed';
    levels: 'elementary' | 'high_school' | 'college' | '12_under' | '15_under';
  }>(() => ({
    id: category?.id,
    sport_id: sportId,
    division: category?.division || 'men',
    levels: category?.levels || 'college',
  }));
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleClose = useCallback(() => {
    setErrors({});
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSubmit = async () => {
    setErrors({});
    
    // Validate
    const schema = mode === 'add' ? createSportCategorySchema : updateSportCategorySchema;
    const result = schema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('Please check the form for errors.');
      return;
    }
    
    await onSubmit(formData);
  };

  const title = mode === 'add' ? 'Add Category' : 'Edit Category';
  const description = mode === 'add' ? 'Create a new category for this sport.' : 'Update the category details.';

  return (
    <ModalLayout
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      maxWidth="max-w-md"
      height="h-auto"
    >
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground -mt-2">{description}</p>
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="px-0 pt-0 pb-4">
            <CardTitle className="text-lg">Category Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-0 pb-0">
            {/* Division Select */}
            <div className="space-y-2">
              <Label htmlFor="division">Division</Label>
              <Select 
                value={formData.division} 
                onValueChange={(value: 'men' | 'women' | 'mixed') => {
                  setFormData(prev => ({ ...prev, division: value }));
                  if (errors.division) setErrors(prev => ({ ...prev, division: '' }));
                }}
              >
                <SelectTrigger id="division" className={errors.division ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="men">Men's</SelectItem>
                  <SelectItem value="women">Women's</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
              {errors.division && <p className="text-xs text-red-500">{errors.division}</p>}
            </div>

            {/* Level Select */}
            <div className="space-y-2">
              <Label htmlFor="levels">Level</Label>
              <Select 
                value={formData.levels} 
                onValueChange={(value: 'elementary' | 'high_school' | 'college' | '12_under' | '15_under') => {
                  setFormData(prev => ({ ...prev, levels: value }));
                  if (errors.levels) setErrors(prev => ({ ...prev, levels: '' }));
                }}
              >
                <SelectTrigger id="levels" className={errors.levels ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elementary">Elementary</SelectItem>
                  <SelectItem value="high_school">High School</SelectItem>
                  <SelectItem value="college">College</SelectItem>
                  <SelectItem value="12_under">12 Under</SelectItem>
                  <SelectItem value="15_under">15 Under</SelectItem>
                </SelectContent>
              </Select>
              {errors.levels && <p className="text-xs text-red-500">{errors.levels}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t mt-6">
        <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-[100px]">
          {isSubmitting ? 'Saving...' : mode === 'add' ? 'Create' : 'Save Changes'}
        </Button>
      </div>
    </ModalLayout>
  );
}
