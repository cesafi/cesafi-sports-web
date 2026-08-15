'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { DataTable } from '@/components/table';
import { TableColumn, TableAction } from '@/lib/types/table';

import { SportCategory } from '@/lib/types/sports';
import { 
  useSportCategoriesBySportId, 
  useCreateSportCategory, 
  useUpdateSportCategory, 
  useDeleteSportCategory 
} from '@/hooks/use-sports';

import { CategoryModal } from './category-modal';

interface CategoriesTableProps {
  sportId: number;
}

export function CategoriesTable({ sportId }: CategoriesTableProps) {
  const { data: categories, isLoading } = useSportCategoriesBySportId(sportId);
  const { mutateAsync: createCategory, isPending: isCreating } = useCreateSportCategory();
  const { mutateAsync: updateCategory, isPending: isUpdating } = useUpdateSportCategory();
  const { mutateAsync: deleteCategory, isPending: isDeleting } = useDeleteSportCategory();

  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'add' | 'edit';
    category?: SportCategory;
  }>({
    open: false,
    mode: 'add'
  });

  const [deleteModalState, setDeleteModalState] = useState<{
    open: boolean;
    categoryId?: number;
  }>({
    open: false
  });

  const handleSubmit = async (formData: any) => {
    try {
      if (modalState.mode === 'add') {
        const result = await createCategory(formData);
        if (result.success) {
          toast.success('Category created successfully');
          setModalState({ open: false, mode: 'add' });
        } else {
          toast.error(result.error || 'Failed to create category');
        }
      } else {
        const result = await updateCategory(formData);
        if (result.success) {
          toast.success('Category updated successfully');
          setModalState({ open: false, mode: 'add' });
        } else {
          toast.error(result.error || 'Failed to update category');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  const handleDelete = async () => {
    if (!deleteModalState.categoryId) return;
    
    try {
      const result = await deleteCategory(deleteModalState.categoryId);
      if (result.success) {
        toast.success('Category deleted successfully');
        setDeleteModalState({ open: false });
      } else {
        toast.error(result.error || 'Failed to delete category');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  const formatEnum = (value: string) => {
    return value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const columns: TableColumn<SportCategory>[] = [
    {
      key: 'division',
      header: 'Division',
      render: (item) => <span className="font-medium">{formatEnum(item.division)}</span>
    },
    {
      key: 'levels',
      header: 'Level',
      render: (item) => formatEnum(item.levels)
    }
  ];

  const actions: TableAction<SportCategory>[] = [
    {
      key: 'edit',
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (item) => setModalState({ open: true, mode: 'edit', category: item })
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (item) => setDeleteModalState({ open: true, categoryId: item.id }),
      variant: 'destructive'
    }
  ];

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold tracking-tight">Categories</h2>
        <Button onClick={() => setModalState({ open: true, mode: 'add' })}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <DataTable
        columns={columns}
        actions={actions}
        data={categories || []}
        totalCount={categories?.length || 0}
        loading={isLoading}
        currentPage={1}
        pageCount={1}
        pageSize={categories?.length || 10}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        onSortChange={() => {}}
        onSearchChange={() => {}}
        onFiltersChange={() => {}}
        showSearch={false}
        showFilters={false}
        emptyMessage="No categories found for this sport."
      />

      <CategoryModal
        open={modalState.open}
        onOpenChange={(open) => setModalState(prev => ({ ...prev, open }))}
        mode={modalState.mode}
        category={modalState.category}
        sportId={sportId}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      <ConfirmationModal
        isOpen={deleteModalState.open}
        onClose={() => setDeleteModalState({ open: false })}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        onConfirm={handleDelete}
        isLoading={isDeleting}
        type="delete"
      />
    </div>
  );
}
