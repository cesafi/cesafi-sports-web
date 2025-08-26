'use client';

import { useState } from 'react';
import { DataTable } from '@/components/table';
import { useSportsTable } from '@/hooks/use-sports';
import { getSportsTableColumns, getSportsTableActions } from '@/components/admin/sports';
import { Sport, SportInsert, SportUpdate } from '@/lib/types/sports';
import { SportCategoryFormData } from '@/lib/types/sports';
import { SportModal } from '@/components/admin/sports';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { createSportWithCategories, addCategoriesToExistingSport } from '@/actions/sports';
import { toast } from 'sonner';

export default function SportsManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingSport, setEditingSport] = useState<Sport | undefined>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sportToDelete, setSportToDelete] = useState<Sport | undefined>();
  const [pendingCategories, setPendingCategories] = useState<SportCategoryFormData[]>([]);

  const {
    sports,
    totalCount,
    pageCount,
    currentPage,
    pageSize,
    loading,
    tableBodyLoading,
    error,
    createSport,
    updateSport,
    deleteSport,
    isCreating,
    isUpdating,
    isDeleting,
    onPageChange,
    onPageSizeChange,
    onSortChange,
    onSearchChange,
    onFiltersChange
  } = useSportsTable();

  const handleEditSport = (sport: Sport) => {
    setEditingSport(sport);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteSport = (sport: Sport) => {
    setSportToDelete(sport);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteSport = async () => {
    if (!sportToDelete) return;

    try {
      deleteSport(sportToDelete.id);
      setIsDeleteModalOpen(false);
      setSportToDelete(undefined);
    } catch {
      setIsDeleteModalOpen(false);
      setSportToDelete(undefined);
    }
  };

  const handleSubmit = async (data: SportInsert | SportUpdate) => {
    if (modalMode === 'add') {
      try {
        // Create the sport with categories simultaneously
        const result = await createSportWithCategories(data as SportInsert, pendingCategories);

        if (result.success) {
          if (pendingCategories.length > 0) {
            toast.success(`Sport and ${pendingCategories.length} categories created successfully!`);
          } else {
            toast.success('Sport created successfully!');
          }
        } else {
          toast.error(result.error || 'Failed to create sport');
        }

        // Clear pending categories
        setPendingCategories([]);
      } catch (error) {
        console.error('Error creating sport or categories:', error);
        toast.error('Failed to create sport or categories. Please try again.');
      }
    } else {
      try {
        // Update the sport first
        await updateSport(data as SportUpdate);

        // If we have pending categories, add them to the existing sport
        if (pendingCategories.length > 0 && editingSport) {
          const result = await addCategoriesToExistingSport(editingSport.id, pendingCategories);

          if (result.success) {
            toast.success(
              `Sport updated and ${pendingCategories.length} new categories added successfully!`
            );
          } else {
            toast.error(result.error || 'Sport updated but failed to add categories');
          }
        } else {
          toast.success('Sport updated successfully!');
        }

        // Clear pending categories
        setPendingCategories([]);
      } catch (error) {
        console.error('Error updating sport or adding categories:', error);
        toast.error('Failed to update sport or add categories. Please try again.');
      }
    }
  };

  const handleSuccess = () => {
    // This will be called when the modal closes after successful submission
    // The useSportsTable hook will automatically refetch the data
  };

  const handleCategoriesChange = (categories: SportCategoryFormData[]) => {
    setPendingCategories(categories);
  };

  const columns = getSportsTableColumns();
  const actions = getSportsTableActions(handleEditSport, handleDeleteSport);

  return (
    <div className="w-full space-y-6">
      {/* Data Table - Use DataTable props for header and actions */}
      <DataTable
        data={sports}
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
        title="Sports Management"
        subtitle="View and manage sports entries."
        searchPlaceholder="Search sports..."
        showSearch={true}
        showFilters={false}
        addButton={{
          label: 'Add Sport',
          onClick: () => {
            setModalMode('add');
            setEditingSport(undefined);
            setIsModalOpen(true);
          }
        }}
        className=""
        emptyMessage="No sports found"
        initialSortBy="name"
        initialSortOrder="asc"
      />

      {/* Modal */}
      <SportModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        sport={editingSport}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
        onSuccess={handleSuccess}
        onCategoriesChange={handleCategoriesChange}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteSport}
        type="delete"
        title="Delete Sport"
        message={`Are you sure you want to delete this sport? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        destructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
