# Admin Entity Management Pages Implementation Guide

This guide documents the pattern for implementing new entity management pages in the admin dashboard, using the **Accounts Management** as the reference implementation.

## 🏗️ **Architecture Pattern**

The admin entity management system follows a consistent pattern with these key components:

### **1. Core Components Structure**
```
src/components/admin/[entity-name]/
├── index.ts                    # Export all components
├── [entity]-table-columns.tsx  # Table column definitions
├── [entity]-modal.tsx          # Add/Edit modal
└── [entity]-table-actions.tsx  # Table action buttons (optional)
```

### **2. Required Files**
- **Table Columns**: Define how data is displayed in the table
- **Modal**: Handle create/edit operations
- **Hook**: Manage data fetching, mutations, and state
- **Actions**: Server-side CRUD operations
- **Validation**: Zod schemas for form validation

## 📋 **Implementation Steps**

### **Step 1: Create Table Columns Component**

**File**: `src/components/admin/[entity]/[entity]-table-columns.tsx`

**Pattern**: Use `TableColumn<T>` from `@/lib/types/table`

```typescript
import { TableColumn } from '@/lib/types/table';
import { EntityType } from '@/lib/types/[entity]';
import { Badge } from '@/components/ui/badge';
import { formatTableDate } from '@/lib/utils/date';

export const get[Entity]TableColumns = (): TableColumn<EntityType>[] => [
  {
    key: 'entityInfo',
    header: 'Entity Information',
    sortable: false,
    width: '50%',
    render: (entity: EntityType) => (
      <div className="flex items-center space-x-3">
        {/* Entity display logic */}
      </div>
    )
  },
  // ... more columns
];

export const get[Entity]TableActions = (
  onEdit: (entity: EntityType) => void,
  onDelete: (entity: EntityType) => void
) => [
  {
    key: 'edit',
    label: 'Edit Entity',
    icon: <Pencil className="h-4 w-4" />,
    onClick: onEdit,
    variant: 'ghost' as const,
    size: 'sm' as const
  },
  // ... more actions
];
```

### **Step 2: Create Modal Component**

**File**: `src/components/admin/[entity]/[entity]-modal.tsx`

**Pattern**: Use `ModalLayout` from `@/components/ui/modal-layout`

```typescript
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ModalLayout } from '@/components/ui/modal-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { EntityType, EntityInsert, EntityUpdate } from '@/lib/types/[entity]';
import { createEntitySchema, updateEntitySchema } from '@/lib/validations/[entity]';
import { ZodError } from 'zod';

interface EntityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  entity?: EntityType;
  onSubmit: (data: EntityInsert | EntityUpdate) => Promise<void>;
  isSubmitting: boolean;
}

export function EntityModal({ ... }: EntityModalProps) {
  // State management
  const [formData, setFormData] = useState<EntityInsert | EntityUpdate>({...});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasStartedCreating = useRef(false);
  const hasStartedUpdating = useRef(false);

  // Form reset on modal open/close
  useEffect(() => {
    if (open) {
      // Reset form data based on mode
      if (mode === 'edit' && entity) {
        setFormData({...}); // Populate with entity data
      } else {
        setFormData({...}); // Reset to defaults
      }
      setErrors({});
      hasStartedCreating.current = false;
      hasStartedUpdating.current = false;
    }
  }, [open, mode, entity]);

  // Handle mutation completion
  useEffect(() => {
    if (hasStartedCreating.current && !isSubmitting && mode === 'add') {
      handleClose();
    }
  }, [isSubmitting, mode]);

  useEffect(() => {
    if (hasStartedUpdating.current && !isSubmitting && mode === 'edit') {
      handleClose();
    }
  }, [isSubmitting, mode]);

  const handleClose = useCallback(() => {
    setErrors({});
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const schema = mode === 'add' ? createEntitySchema : updateEntitySchema;
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
      title={mode === 'add' ? 'Add New Entity' : 'Edit Entity'}
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'add' ? 'Create Entity' : 'Update Entity'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form fields */}
      </form>
    </ModalLayout>
  );
}
```

### **Step 3: Create Hook**

**File**: `src/hooks/use-[entity]-table.ts`

**Pattern**: Use `useTable` from `@/hooks/use-table`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPaginated[Entity], create[Entity], update[Entity], delete[Entity] } from '@/actions/[entity]';
import { useTable } from './use-table';
import { EntityType } from '@/lib/types/[entity]';
import { toast } from 'sonner';
import { TableFilters } from '@/lib/types/table';

export function use[Entity]Table() {
  const {
    tableState,
    setPage,
    setPageSize,
    setSortBy,
    setSearch,
    setFilters,
    resetFilters,
    paginationOptions
  } = useTable<EntityType>({
    initialPage: 1,
    initialPageSize: 10,
    initialSortBy: 'created_at',
    initialSortOrder: 'desc',
    pageSizeOptions: [5, 10, 25, 50, 100]
  });

  // Fetch paginated data
  const {
    data: entityData,
    isLoading,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['[entity]', 'paginated', paginationOptions],
    queryFn: () => getPaginated[Entity](paginationOptions),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch [entity]');
      }
      return data.data;
    }
  });

  const tableBodyLoading = isFetching && !isLoading;
  const queryClient = useQueryClient();

  // Mutations
  const createEntityMutation = useMutation({
    mutationFn: create[Entity],
    onSuccess: (result) => {
      if (result.success) {
        toast.success('[Entity] created successfully');
        queryClient.invalidateQueries({ queryKey: ['[entity]'] });
      } else {
        toast.error(result.error || 'Failed to create [entity]');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });

  // ... similar mutations for update and delete

  // Return hook interface
  return {
    // Data
    [entity]: entityData?.data || [],
    totalCount: entityData?.totalCount || 0,
    pageCount: entityData?.pageCount || 0,
    currentPage: tableState.page,
    pageSize: tableState.pageSize,
    loading: isLoading,
    tableBodyLoading,
    error: error?.message || null,

    // Mutations
    create[Entity]: createEntityMutation.mutate,
    update[Entity]: update[Entity]Mutation.mutate,
    delete[Entity]: delete[Entity]Mutation.mutate,

    // Loading states
    isCreating: createEntityMutation.isPending,
    isUpdating: update[Entity]Mutation.isPending,
    isDeleting: delete[Entity]Mutation.isPending,

    // Actions
    refetch,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
    onSortChange: handleSort,
    onSearchChange: handleSearch,
    onFiltersChange: handleFilters,
    resetFilters
  };
}
```

### **Step 4: Create Actions**

**File**: `src/actions/[entity].ts`

**Pattern**: Use server actions with proper error handling

```typescript
'use server';

import { PaginationOptions } from '@/lib/types/base';
import { EntityInsert, EntityUpdate } from '@/lib/types/[entity]';
import { EntityService } from '@/services/[entity]';
import { revalidatePath } from 'next/cache';
import { TableFilters } from '@/lib/types/table';

export async function getPaginated[Entity](options: PaginationOptions<TableFilters>) {
  try {
    const result = await EntityService.getPaginated(options);
    
    if (!result.success || !result.data) {
      return { success: false, error: result.success === false ? result.error : 'Failed to fetch [entity]' };
    }

    return {
      success: true,
      data: {
        data: result.data.data,
        totalCount: result.data.totalCount,
        pageCount: result.data.pageCount,
        currentPage: result.data.currentPage
      }
    };
  } catch {
    return { success: false, error: 'Failed to fetch [entity]' };
  }
}

export async function create[Entity](data: EntityInsert) {
  const result = await EntityService.insert(data);
  if (result.success) {
    revalidatePath('/admin/[entity]');
  }
  return result;
}

// ... similar functions for update and delete
```

### **Step 5: Create Validation Schemas**

**File**: `src/lib/validations/[entity].ts`

**Pattern**: Use Zod for validation

```typescript
import { z } from 'zod';

export const create[Entity]Schema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  // ... other fields
});

export const update[Entity]Schema = z.object({
  id: z.string().uuid({ message: 'ID is required for updating.' }),
  name: z.string().min(1, { message: 'Name cannot be empty.' }).optional(),
  // ... other fields
});

// Legacy exports for backward compatibility
export const [Entity]InsertSchema = create[Entity]Schema;
export const [Entity]UpdateSchema = update[Entity]Schema;
```

### **Step 6: Create Main Page**

**File**: `src/app/(protected)/admin/[entity]/page.tsx`

**Pattern**: Use the hook and components

```typescript
'use client';

import { useState } from 'react';
import { DataTable } from '@/components/table';
import { use[Entity]Table } from '@/hooks/use-[entity]-table';
import { get[Entity]TableColumns, get[Entity]TableActions } from '@/components/admin/[entity]';
import { EntityType } from '@/lib/types/[entity]';
import { EntityModal } from '@/components/admin/[entity]';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function [Entity]ManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingEntity, setEditingEntity] = useState<EntityType | undefined>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<EntityType | undefined>();

  const {
    [entity],
    totalCount,
    pageCount,
    currentPage,
    pageSize,
    loading,
    tableBodyLoading,
    error,
    create[Entity],
    update[Entity],
    delete[Entity],
    isCreating,
    isUpdating,
    isDeleting,
    onPageChange,
    onPageSizeChange,
    onSortChange,
    onSearchChange,
    onFiltersChange
  } = use[Entity]Table();

  const handleEditEntity = (entity: EntityType) => {
    setEditingEntity(entity);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteEntity = (entity: EntityType) => {
    setEntityToDelete(entity);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (data: EntityInsert | EntityUpdate) => {
    if (modalMode === 'add') {
      create[Entity](data);
    } else {
      update[Entity]({ id: editingEntity!.id, ...data });
    }
  };

  const columns = get[Entity]TableColumns();
  const actions = get[Entity]TableActions(handleEditEntity, handleDeleteEntity);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">[Entity] Management</h1>
        <p className="text-muted-foreground">
          View and manage [entity] entries.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-4">
        <Button onClick={() => {
          setModalMode('add');
          setEditingEntity(undefined);
          setIsModalOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add [Entity]
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        data={[entity]}
        totalCount={totalCount}
        loading={loading}
        tableBodyLoading={tableBodyLoading}
        error={error}
        columns={columns}
        actions={actions}
        currentPage={currentPage}
        pageCount={pageCount}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onSortChange={onSortChange}
        onSearchChange={onSearchChange}
        onFiltersChange={onFiltersChange}
        title="[Entity] Management"
        subtitle="View and manage [entity] entries."
        searchPlaceholder="Search [entity] by name..."
        showSearch={true}
        showFilters={false}
      />

      {/* Modal */}
      <EntityModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        entity={editingEntity}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        type="delete"
        title="Delete [Entity]"
        message={`Are you sure you want to delete "${entityToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => {
          if (entityToDelete) {
            delete[Entity](entityToDelete.id);
            setIsDeleteModalOpen(false);
            setEntityToDelete(undefined);
          }
        }}
        isLoading={isDeleting}
      />
    </div>
  );
}
```

## 🔧 **Key Implementation Details**

### **Modal State Management**
- Use `useRef` to track mutation progress
- Use `useEffect` to detect when mutations complete
- Automatically close modal on successful operations

### **Error Handling**
- Use Zod for validation
- Display field-specific errors below inputs
- Use toast notifications for success/error feedback

### **Data Flow**
1. **Hook** manages table state and data fetching
2. **Actions** handle server-side operations
3. **Components** use the hook for data and operations
4. **Modal** handles form state and submission

### **Type Safety**
- All components use proper TypeScript types
- Validation schemas ensure data integrity
- Consistent error handling patterns

## 📚 **Available UI Components**

Use `npx shadcn@latest add [component-name]` to add missing components:

- `textarea` - For multi-line text input
- `switch` - For boolean toggles
- `select` - For dropdown selections
- `checkbox` - For boolean inputs
- `radio-group` - For single-choice selections

## 🚨 **Common Pitfalls**

1. **Type Mismatches**: Ensure action function signatures match hook expectations
2. **Modal Props**: Use `open`/`onOpenChange` not `isOpen`/`onClose`
3. **Error Handling**: Always handle both Zod validation and general errors
4. **State Management**: Use refs to track mutation progress for modal closing
5. **Dependencies**: Include all dependencies in useEffect dependency arrays

## ✅ **Testing Checklist**

- [ ] Table displays data correctly
- [ ] Search functionality works
- [ ] Pagination works
- [ ] Add modal opens and submits
- [ ] Edit modal populates and updates
- [ ] Delete confirmation works
- [ ] Error states display properly
- [ ] Loading states show correctly
- [ ] Form validation works
- [ ] Success/error toasts display

## 🔗 **Reference Implementation**

See `src/components/admin/accounts/` for the complete working implementation that follows this pattern.

