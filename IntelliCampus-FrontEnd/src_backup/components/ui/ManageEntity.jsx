import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import UserHeader from "./UserHeader";
import PageHeader from "./PageHeader";
import Section from "./Section";
import SearchBar from "./SearchBar";
import Button from "./Button";
import Dialog from "./Dialog";
import Table from "./Table";
import { TrashIcon, PlusIcon } from "./icons";
import useDeviceType from "../../hooks/useDeviceType";
import { useError } from '../../contexts/ErrorContext.jsx';
import { useTranslation } from 'react-i18next';

export default function ManageEntity({
  entityName,
  entityNamePlural,
  entityIdField = "id",
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
  headerType = "page",
  headerRole,
  onImportComplete,
  headerTitle,
  headerSubtitle,
  headerAddLabel,
  searchPlaceholder,
  searchFilter,
  tableRole,
  tableRoleLabel,
  tableHeaders,
  columnAlignments,
  buildRow,
  rowActions,
  showSelectionColumn = true,
  onPreview,
  renderForm,
  renderHeaderActions,
  getDeleteMessage,
  getDeleteSelectedTitle,
  getDeleteSelectedMessage,
  renderFilters,
  renderExtraDialogs,
  renderBeforeTable,
  extraDeps = [],
  serverSidePagination = false,
  defaultPageSize = 10,
}) {
  const { isDesktop, isTablet, isPhone } = useDeviceType();
  const { t } = useTranslation('admin');
  const { showError } = useError();
  const isSm = !isPhone;
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [isDeleteSelectedOpen, setIsDeleteSelectedOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formIsLoading, setFormIsLoading] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(defaultPageSize);
  const tableContainerRef = useRef(null);

  useEffect(() => {
    if (!serverSidePagination) return;
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, serverSidePagination]);

  const getId = useMemo(
    () => (typeof entityIdField === "function" ? entityIdField : (item) => item?.[entityIdField]),
    [entityIdField]
  );
  const pluralLower = entityNamePlural.toLowerCase();
  const queryKey = useMemo(() => {
    if (serverSidePagination) {
      return [pluralLower, currentPage, itemsPerPage, debouncedSearch, ...extraDeps];
    }
    return [pluralLower];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverSidePagination, pluralLower, currentPage, itemsPerPage, debouncedSearch, ...extraDeps]);

  const queryFn = useCallback(async () => {
    if (serverSidePagination) {
      return fetchItems({ pageIndex: currentPage, pageSize: itemsPerPage, searchQuery: debouncedSearch });
    }
    return fetchItems();
  }, [serverSidePagination, fetchItems, currentPage, itemsPerPage, debouncedSearch]);

  const { data: fetchResult, isLoading, isFetching, error, refetch } = useQuery({
    queryKey,
    queryFn,
  });

  const rawItems = fetchResult?.data ?? fetchResult ?? [];
  const serverTotalCount = fetchResult?.totalCount ?? null;

  useEffect(() => {
    if (error) showError(error.message);
  }, [error, showError]);

  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setIsFormOpen(false);
      setEditingItem(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setIsFormOpen(false);
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setDeleteTarget(null);
    },
  });

  const deleteSelectedMutation = useMutation({
    mutationFn: async (ids) => {
      for (const id of ids) {
        await deleteItem(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setSelectedRowIds([]);
      setIsDeleteSelectedOpen(false);
    },
  });

  useEffect(() => {
    if (serverSidePagination) return;
    const calculateItemsPerPage = () => {
      if (!tableContainerRef.current) return;
      const rect = tableContainerRef.current.getBoundingClientRect();
      const bottomPaddingOffset = isPhone ? 60 : isTablet ? 30 : 0;
      const availableHeight = window.innerHeight - rect.top - bottomPaddingOffset;
      setItemsPerPage(Math.max(3, Math.floor(availableHeight / 65)));
    };
    const timer = setTimeout(calculateItemsPerPage, 50);
    window.addEventListener("resize", calculateItemsPerPage);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculateItemsPerPage);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverSidePagination, rawItems.length, isPhone, isTablet, ...extraDeps]);

  const filteredItems = useMemo(() => {
    if (serverSidePagination) return rawItems;
    const q = (searchQuery || "").toLowerCase();
    return rawItems.filter((item) => searchFilter(item, q));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawItems, searchQuery, searchFilter, serverSidePagination, ...extraDeps]);

  const totalItemsCount = serverTotalCount ?? filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItemsCount / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginatedItems = useMemo(() =>
    serverSidePagination
      ? rawItems
      : filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredItems, currentPage, itemsPerPage, serverSidePagination, rawItems]
  );

  const resolvedHeaders = useMemo(() => {
    if (Array.isArray(tableHeaders)) return tableHeaders;
    if (tableHeaders) {
      if (isDesktop) return tableHeaders.desktop;
      if (isTablet) return tableHeaders.tablet;
      return tableHeaders.phone;
    }
    return [];
  }, [tableHeaders, isDesktop, isTablet]);

  const resolvedAlignments = useMemo(() => {
    if (Array.isArray(columnAlignments)) return columnAlignments;
    if (columnAlignments) {
      if (isDesktop) return columnAlignments.desktop;
      if (isTablet) return columnAlignments.tablet;
      return columnAlignments.phone;
    }
    return [];
  }, [columnAlignments, isDesktop, isTablet]);

  const tableRows = useMemo(() =>
    paginatedItems.map(item => {
      const row = buildRow(item, { isDesktop, isTablet });
      if (!row._id) row._id = getId(item);
      if (!row._raw) row._raw = item;
      return row;
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginatedItems, buildRow, isDesktop, isTablet, getId, ...extraDeps]
  );

  const selectedIndices = useMemo(() =>
    tableRows.map((row, i) => selectedRowIds.includes(row._id) ? i : -1).filter(i => i !== -1),
    [tableRows, selectedRowIds]
  );

  const handleCreate = useCallback(async (formData) => {
    try {
      await createMutation.mutateAsync(formData);
    } catch (err) {
      showError(err.message);
    }
  }, [createMutation, showError]);

  const handleUpdate = useCallback(async (formData) => {
    if (!updateItem || !editingItem) return;
    try {
      await updateMutation.mutateAsync({ id: getId(editingItem), data: formData });
    } catch (err) {
      showError(err.message);
    }
  }, [updateItem, editingItem, getId, updateMutation, showError]);

  const handleFormSubmit = useCallback(async (formData) => {
    setFormIsLoading(true);
    try {
      if (editingItem && getId(editingItem) && updateItem) {
        await handleUpdate(formData);
      } else {
        await handleCreate(formData);
      }
    } finally {
      setFormIsLoading(false);
    }
  }, [editingItem, getId, updateItem, handleUpdate, handleCreate]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(getId(deleteTarget));
    } catch (err) {
      showError(err.message);
    }
  }, [deleteTarget, getId, deleteMutation, showError]);

  const handleDeleteSelected = useCallback(async () => {
    try {
      await deleteSelectedMutation.mutateAsync(selectedRowIds);
    } catch (err) {
      showError(err.message);
    }
  }, [selectedRowIds, deleteSelectedMutation, showError]);

  const openForm = useCallback((item = null) => {
    setEditingItem(item);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingItem(null);
  }, []);

  const loadItems = refetch;

  const formHelpers = {
    isFormOpen, editingItem, openForm, closeForm,
    handleCreate, handleUpdate, handleFormSubmit,
    formIsLoading, setFormIsLoading, loadItems, rawItems,
  };

  const filterHelpers = { filteredItems, setCurrentPage, selectedRowIds, rawItems, loadItems };
  const dialogHelpers = {
    editingItem, isFormOpen, deleteTarget, setDeleteTarget,
    openForm, closeForm, loadItems,
    selectedRowIds, setSelectedRowIds, rawItems, filteredItems,
  };

  const actionsHelpers = { onEdit: openForm, onDelete: setDeleteTarget, loadItems };

  return (
    <>
      {headerType === "user" ? (
        <UserHeader
          role={headerRole}
          setIsUserFormOpen={setIsFormOpen}
          onImportComplete={onImportComplete}
        />
      ) : renderHeaderActions ? (
        <PageHeader title={headerTitle} subtitle={headerSubtitle}>
          {renderHeaderActions({ openForm })}
        </PageHeader>
      ) : (
        <PageHeader title={headerTitle} subtitle={headerSubtitle}>
          <Button variant="primary" onClick={() => openForm(null)}>
            <PlusIcon size={24} />
            {headerAddLabel || t('entity.add', { entity: entityName })}
          </Button>
        </PageHeader>
      )}


      {isLoading ? (
        <p className="text-center py-10 text-text-secondary-default-light dark:text-text-secondary-default-dark">
          {t('entity.loading', { entity: entityNamePlural })}
        </p>
      ) : (
        <Section className={isFetching ? "opacity-60 transition-opacity" : ""}>
          <div className="flex flex-col gap-4 mb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center justify-between gap-3 sm:contents">
                <h2 className="text-xl font-semibold whitespace-nowrap shrink-0">
                  {entityNamePlural}{" "}
                  <span className="text-sm font-normal text-text-secondary-default-light dark:text-text-secondary-default-dark">
                    ({totalItemsCount})
                  </span>
                </h2>
                <div className="flex-1 min-w-0 sm:hidden">
                  <SearchBar
                    placeholder={searchPlaceholder || t('entity.search', { entity: entityNamePlural })}
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="hidden sm:block sm:w-auto sm:flex-1">
                  <SearchBar
                    placeholder={searchPlaceholder || t('entity.search', { entity: entityNamePlural })}
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  />
                </div>
                {renderFilters?.(filterHelpers)}
                {selectedRowIds.length > 0 && (
                  <Button variant="danger" onClick={() => setIsDeleteSelectedOpen(true)} className="px-2 sm:px-4" size="sm">
                    <TrashIcon size={18} />
                    <span className="hidden sm:inline">{t('entity.deleteSelected', { count: selectedRowIds.length })}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Dialog
            isOpen={isDeleteSelectedOpen}
            variant="warning"
            title={getDeleteSelectedTitle || t('entity.deleteSelectedTitle', { entity: entityNamePlural })}
            onClose={() => setIsDeleteSelectedOpen(false)}
            onConfirm={() => { handleDeleteSelected(); return true; }}
            confirmText={t('entity.yesDelete')}
            cancelText={t('entity.noKeep')}
            showCloseButton={true}
          >
            {getDeleteSelectedMessage
              ? getDeleteSelectedMessage(selectedRowIds.length)
              : t('entity.bulkDeleteConfirm', { count: selectedRowIds.length, entity: entityName })}
          </Dialog>

          {renderBeforeTable?.(filterHelpers)}

          {paginatedItems.length > 0 ? (
            <div className="mb-6" ref={tableContainerRef}>
              <Table
                role={tableRole}
                roleLabel={tableRoleLabel}
                headers={resolvedHeaders}
                data={tableRows}
                columnAlignments={resolvedAlignments}
                wrapInSection={false}
                showHeaderActions={false}
                showPagination={false}
                showSelectionColumn={showSelectionColumn}
                selectedRows={selectedIndices}
                page={currentPage}
                onPageChange={setCurrentPage}
                totalPages={totalPages}
                totalItems={isSm ? totalItemsCount : undefined}
                itemsLabel={entityNamePlural}
                from={isSm && totalItemsCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : undefined}
                to={isSm ? Math.min(currentPage * itemsPerPage, totalItemsCount) : undefined}
                onSelectionChange={(indices) => {
                  const visibleIds = new Set(tableRows.map(r => r._id).filter(Boolean));
                  setSelectedRowIds([
                    ...selectedRowIds.filter(id => !visibleIds.has(id)),
                    ...indices.map(i => tableRows[i]?._id).filter(Boolean),
                  ]);
                }}
                onDelete={(rowIndex) => {
                  const row = tableRows[rowIndex];
                  if (row?._raw) setDeleteTarget(row._raw);
                }}
                onPreview={(rowData) => onPreview?.(rowData._raw || rowData)}
                actions={(rowData) => rowActions(rowData._raw, actionsHelpers)}
              />
            </div>
          ) : (
            <p className="text-center py-12 text-text-secondary-default-light dark:text-text-secondary-default-dark">
              {t('entity.noResults', { entity: entityNamePlural })}
            </p>
          )}

        </Section>
      )}

      {renderForm?.(formHelpers)}

      <Dialog
        isOpen={deleteTarget !== null}
        variant="warning"
        title={t('entity.deleteTitle', { entity: entityName })}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { handleDeleteConfirm(); return true; }}
        confirmText={t('entity.deleteAction')}
        cancelText={t('entity.cancelAction')}
        showCloseButton={true}
      >
        {getDeleteMessage
          ? getDeleteMessage(deleteTarget)
          : t('entity.deleteConfirm', { entity: entityName })}
      </Dialog>

      {renderExtraDialogs?.(dialogHelpers)}
    </>
  );
}
