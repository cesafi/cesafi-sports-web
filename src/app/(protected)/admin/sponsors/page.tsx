'use client';

import { useState } from 'react';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useSponsorsTable } from '@/hooks/use-sponsors';
import { getSponsorsTableColumns, getSponsorsTableActions, SponsorModal } from '@/components/admin/sponsors';
import { Sponsor } from '@/lib/types/sponsors';
import { SponsorInsert, SponsorUpdate } from '@/lib/validations/sponsors';

export default function SponsorsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);

  const {
    sponsors,
    totalCount,
    pageCount,
    currentPage,
    pageSize,
    loading,
    tableBodyLoading,
    error,
    createSponsor,
    updateSponsor,
    deleteSponsor,
    isCreating,
    isUpdating,
    refetch,
    onPageChange,
    onPageSizeChange,
    onSortChange,
    onSearchChange,
    onFiltersChange
  } = useSponsorsTable();

  const handleAddSponsor = () => {
    setModalMode('add');
    setSelectedSponsor(null);
    setIsModalOpen(true);
  };

  const handleEditSponsor = (sponsor: Sponsor) => {
    setModalMode('edit');
    setSelectedSponsor(sponsor);
    setIsModalOpen(true);
  };

  const handleDeleteSponsor = (sponsor: Sponsor) => {
    if (window.confirm(`Are you sure you want to delete "${sponsor.title}"?`)) {
      deleteSponsor(sponsor.id);
    }
  };

  const handleModalSubmit = (data: SponsorInsert | SponsorUpdate) => {
    if (modalMode === 'add') {
      createSponsor(data as SponsorInsert, {
        onSuccess: () => {
          setIsModalOpen(false);
        }
      });
    } else {
      updateSponsor(data as SponsorUpdate, {
        onSuccess: () => {
          setIsModalOpen(false);
        }
      });
    }
  };

  const columns = getSponsorsTableColumns();
  const actions = getSponsorsTableActions(handleEditSponsor, handleDeleteSponsor);

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sponsors</h1>
          <p className="text-muted-foreground">
            Manage sponsors and their information
          </p>
        </div>
        <Button onClick={handleAddSponsor} disabled={isCreating}>
          <Plus className="mr-2 h-4 w-4" />
          Add Sponsor
        </Button>
      </div>

      <DataTable
        data={sponsors}
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
        title="Sponsors"
        subtitle="Manage sponsor information and visibility"
        searchPlaceholder="Search sponsors..."
        showSearch={true}
        showFilters={true}
        emptyMessage="No sponsors found"
        refetch={refetch}
      />

      <SponsorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        sponsor={selectedSponsor}
        onSubmit={handleModalSubmit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}
