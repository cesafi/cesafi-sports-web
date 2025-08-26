'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ModalLayout } from '@/components/ui/modal-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Department, DepartmentInsert, DepartmentUpdate } from '@/lib/types/departments';
import { createDepartmentSchema, updateDepartmentSchema } from '@/lib/validations/departments';
import { ZodError } from 'zod';

interface DepartmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  department?: Department;
  onSubmit: (data: DepartmentInsert | DepartmentUpdate) => Promise<void>;
  isSubmitting: boolean;
}

export function DepartmentModal({
  open,
  onOpenChange,
  mode,
  department,
  onSubmit,
  isSubmitting
}: DepartmentModalProps) {
  // State management
  const [formData, setFormData] = useState<DepartmentInsert | DepartmentUpdate>({
    name: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasStartedCreating = useRef(false);
  const hasStartedUpdating = useRef(false);

  // Form reset on modal open/close
  useEffect(() => {
    if (open) {
      // Reset form data based on mode
      if (mode === 'edit' && department) {
        setFormData({
          id: department.id,
          name: department.name
        });
      } else {
        setFormData({
          name: ''
        });
      }
      setErrors({});
      hasStartedCreating.current = false;
      hasStartedUpdating.current = false;
    }
  }, [open, mode, department]);

  const handleClose = useCallback(() => {
    setErrors({});
    onOpenChange(false);
  }, [onOpenChange]);

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
      const schema = mode === 'add' ? createDepartmentSchema : updateDepartmentSchema;
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
      title={mode === 'add' ? 'Add New Department' : 'Edit Department'}
      maxWidth="max-w-2xl"
      height="h-[300px]"
      footer={
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="department-form" disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : mode === 'add'
                ? 'Create Department'
                : 'Update Department'}
          </Button>
        </div>
      }
    >
      <form id="department-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Department Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Enter department name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>
      </form>
    </ModalLayout>
  );
}
