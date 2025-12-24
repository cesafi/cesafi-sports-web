'use client';

import { useState } from 'react';
import { DataTable } from '@/components/table';
import { useDepartmentsTable } from '@/hooks/use-departments';
import {
  getDepartmentsTableColumns,
  getDepartmentsTableActions,
  DepartmentModal
} from '@/components/admin/departments';
import { Department } from '@/lib/types/departments';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { DepartmentInsert, DepartmentUpdate } from '@/lib/validations/departments';

export default function DepartmentsManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingDepartment, setEditingDepartment] = useState<Department | undefined>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | undefined>();

  const {
    departments,
    totalCount,
    pageCount,
    currentPage,
    pageSize,
    loading,
    tableBodyLoading,
    error,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    isCreating,
    isUpdating,
    isDeleting,
    onPageChange,
    onPageSizeChange,
    onSortChange,
    onSearchChange,
    onFiltersChange,
    refetch
  } = useDepartmentsTable();

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteDepartment = (department: Department) => {
    setDepartmentToDelete(department);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteDepartment = async () => {
    if (!departmentToDelete) return;

    try {
      deleteDepartment(departmentToDelete.id);
      setIsDeleteModalOpen(false);
      setDepartmentToDelete(undefined);
    } catch {
      setIsDeleteModalOpen(false);
      setDepartmentToDelete(undefined);
    }
  };

  const handleSubmit = async (data: DepartmentInsert | DepartmentUpdate) => {
    if (modalMode === 'add') {
      createDepartment(data as DepartmentInsert);
    } else {
      updateDepartment(data as DepartmentUpdate);
    }
  };

  const columns = getDepartmentsTableColumns();
  const actions = getDepartmentsTableActions(handleEditDepartment, handleDeleteDepartment);

  return (
    <div className="w-full space-y-6">
      <DataTable
        data={departments}
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
        title="Departments Management"
        subtitle="View and manage department entries."
        searchPlaceholder="Search departments..."
        showSearch={true}
        showFilters={false}
        addButton={{
          label: 'Add Department',
          onClick: () => {
            setModalMode('add');
            setEditingDepartment(undefined);
            setIsModalOpen(true);
          }
        }}
        className=""
        emptyMessage="No departments found"
        refetch={refetch}
      />

      {/* Modal */}
      <DepartmentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        department={editingDepartment}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteDepartment}
        type="delete"
        title="Delete Department"
        message={`Are you sure you want to delete the department "${departmentToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        destructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
