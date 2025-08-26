'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ModalLayout } from '@/components/ui/modal-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Volunteer, VolunteerInsert, VolunteerUpdate } from '@/lib/types/volunteers';
import { createVolunteerSchema, updateVolunteerSchema } from '@/lib/validations/volunteers';
import { ZodError } from 'zod';
import { useSeason } from '@/components/contexts/season-provider';
import { useAllDepartments } from '@/hooks/use-departments';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface VolunteersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  volunteer?: Volunteer;
  onSubmit: (data: VolunteerInsert | VolunteerUpdate) => Promise<void>;
  isSubmitting: boolean;
}

export function VolunteersModal({
  open,
  onOpenChange,
  mode,
  volunteer,
  onSubmit,
  isSubmitting
}: VolunteersModalProps) {
  const { currentSeason } = useSeason();
  const { data: departments } = useAllDepartments();

  // State management
  const [formData, setFormData] = useState<VolunteerInsert | VolunteerUpdate>({
    full_name: '',
    image_url: '',
    is_active: true,
    department_id: null,
    season_id: currentSeason?.id || null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasStartedCreating = useRef(false);
  const hasStartedUpdating = useRef(false);

  // Form reset on modal open/close
  useEffect(() => {
    if (open) {
      // Reset form data based on mode
      if (mode === 'edit' && volunteer) {
        setFormData({
          id: volunteer.id,
          full_name: volunteer.full_name,
          image_url: volunteer.image_url || '',
          is_active: volunteer.is_active || true,
          department_id: volunteer.department_id,
          season_id: volunteer.season_id || currentSeason?.id || null
        });
      } else {
        setFormData({
          full_name: '',
          image_url: '',
          is_active: true,
          department_id: null,
          season_id: currentSeason?.id || null
        });
      }
      setErrors({});
      hasStartedCreating.current = false;
      hasStartedUpdating.current = false;
    }
  }, [open, mode, volunteer, currentSeason]);

  const handleClose = useCallback(() => {
    setErrors({});
    onOpenChange(false);
  }, [onOpenChange]);

  // Update season_id when currentSeason changes
  useEffect(() => {
    if (currentSeason?.id && mode === 'add') {
      setFormData((prev) => ({ ...prev, season_id: currentSeason.id }));
    }
  }, [currentSeason, mode]);

  // Handle mutation completion
  useEffect(() => {
    if (hasStartedCreating.current && !isSubmitting && mode === 'add') {
      handleClose();
    }
  }, [handleClose, isSubmitting, mode]);

  useEffect(() => {
    if (hasStartedUpdating.current && !isSubmitting && mode === 'edit') {
      handleClose();
    }
  }, [handleClose, isSubmitting, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const schema = mode === 'add' ? createVolunteerSchema : updateVolunteerSchema;
      const validatedData = schema.parse(formData);

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
      onOpenChange={onOpenChange}
      title={mode === 'add' ? 'Add New Volunteer' : 'Edit Volunteer'}
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="volunteer-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'add' ? 'Create Volunteer' : 'Update Volunteer'}
          </Button>
        </div>
      }
    >
      <form id="volunteer-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
            placeholder="Enter volunteer's full name"
            className={errors.full_name ? 'border-red-500' : ''}
          />
          {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <Label htmlFor="image_url">Image URL</Label>
          <Input
            id="image_url"
            type="url"
            value={formData.image_url || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value || '' }))}
            placeholder="https://example.com/image.jpg (optional)"
            className={errors.image_url ? 'border-red-500' : ''}
          />
          {errors.image_url && <p className="text-sm text-red-500">{errors.image_url}</p>}
        </div>

        {/* Department */}
        <div className="space-y-2">
          <Label htmlFor="department_id">Department</Label>
          <Select
            value={formData.department_id?.toString() || 'none'}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                department_id: value === 'none' ? null : parseInt(value)
              }))
            }
          >
            <SelectTrigger
              id="department_id"
              className={errors.department_id ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Select a department (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Department</SelectItem>
              {departments?.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.department_id && <p className="text-sm text-red-500">{errors.department_id}</p>}
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active || false}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>

        {/* Season ID (hidden, auto-filled) */}
        <input type="hidden" value={formData.season_id || ''} />

        {currentSeason && (
          <div className="text-muted-foreground text-sm">
            This volunteer will be assigned to Season {currentSeason.id}
          </div>
        )}
      </form>
    </ModalLayout>
  );
}
