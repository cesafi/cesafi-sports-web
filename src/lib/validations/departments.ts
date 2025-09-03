import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z
    .string({ message: 'Department name is required.' })
    .min(1, { message: 'Department name cannot be empty.' })
    .max(100, { message: 'Department name cannot exceed 100 characters.' })
    .trim()
});

export const updateDepartmentSchema = z.object({
  id: z.number({ message: 'ID is required for updating a department.' }),
  name: z
    .string({ message: 'Department name must be a string.' })
    .min(1, { message: 'Department name cannot be empty.' })
    .max(100, { message: 'Department name must be 100 characters or less.' })
    .trim()
    .optional()
});

// Legacy exports for backward compatibility
export const DepartmentInsertSchema = createDepartmentSchema;
export const DepartmentUpdateSchema = updateDepartmentSchema;
