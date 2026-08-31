import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Section from "./Section";
import PaginationButtons from "./PaginationButtons";
import BaseComponent from "./BaseComponent";
import { TableHeader, TableHeaderActions, TableBody } from "./table/index";


export default function Table({ role, headers, data, onDelete, onDeleteSelected, onEdit, onPreview, actions, roleLabel, wrapInSection = true, showHeaderActions = true, showPagination = true, totalPages = 1, paginationSummary, onSelectionChange, showSelectionColumn = true, showActionsColumn = true, grouped = false, title, description, componentButton, displayRowLimit, selectedRows: controlledSelectedRows, page, onPageChange, totalItems, itemsLabel, from, to, columnAlignments, columnClassNames, emptyMessage }) {
    const { t, i18n } = useTranslation('common');
    const isRTL = i18n.language === 'ar';
    const toArabicDigits = (str) => isRTL ? String(str).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]) : str;
    const rawData = data || [];
    const hasPagingLimit = typeof displayRowLimit === 'number' && displayRowLimit > 0;
    const computedTotalPages = hasPagingLimit ? Math.max(1, Math.ceil(rawData.length / displayRowLimit)) : totalPages || 1;

    const [currentPage, setCurrentPage] = useState(1);
    const [internalSelectedRows, setInternalSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [prevDataKey, setPrevDataKey] = useState(() => {
        if (!data?.length) return 'empty';
        return `${data.length}-${data[0]?._id ?? data[0]?._raw?.courseId ?? data[0]?.id ?? ''}`;
    });

    const displayData = hasPagingLimit ? rawData.slice((currentPage - 1) * displayRowLimit, currentPage * displayRowLimit) : rawData;

    const dataKey = data?.length
        ? `${data.length}-${data[0]?._id ?? data[0]?._raw?.courseId ?? data[0]?.id ?? ''}`
        : 'empty';
    if (prevDataKey !== dataKey) {
        setPrevDataKey(dataKey);
        setSelectAll(false);
    }

    const isControlled = controlledSelectedRows !== undefined;
    const selectedRows = isControlled ? controlledSelectedRows : internalSelectedRows;

    const allSelected = isControlled
        ? (selectedRows.length === (displayData?.length || 0) && (displayData?.length || 0) > 0)
        : selectAll;

    const setSelectedRows = (rowsOrFn) => {
        if (isControlled) {
            if (typeof rowsOrFn === 'function') {
                onSelectionChange?.(rowsOrFn(controlledSelectedRows));
            } else {
                onSelectionChange?.(rowsOrFn);
            }
        } else {
            if (typeof rowsOrFn === 'function') {
                setInternalSelectedRows(rowsOrFn);
            } else {
                setInternalSelectedRows(rowsOrFn);
            }
        }
    };

    useEffect(() => {
        if (!isControlled && onSelectionChange) onSelectionChange(internalSelectedRows);
    }, [internalSelectedRows, onSelectionChange, isControlled]);

    const handleSetSelectAll = (valueOrFn) => {
        if (isControlled) {
            const next = typeof valueOrFn === 'function' ? valueOrFn(allSelected) : valueOrFn;
            if (next) {
                onSelectionChange?.(displayData.map((_, i) => i));
            } else {
                onSelectionChange([]);
            }
        } else {
            setSelectAll(valueOrFn);
        }
    };

    const content = (
        <>
            {showHeaderActions && (
                <TableHeaderActions
                    role={role}
                    roleLabel={roleLabel}
                    selectedRows={selectedRows}
                    onDeleteSelected={onDeleteSelected}
                />
            )}

            {grouped ? (
                <BaseComponent
                    title={title}
                    description={description}
                    componentButton={componentButton}
                    contentClassName="flex flex-col gap-4 overflow-x-auto"
                >
                    <div className="rounded-lg overflow-hidden border border-border-primary-default-light dark:border-border-primary-default-dark">
                    <table className="min-w-full table-auto border-separate border-spacing-0">
                    <TableHeader
                        headerData={headers}
                        selectAll={allSelected}
                        setSelectAll={handleSetSelectAll}
                        showSelectionColumn={showSelectionColumn}
                        showActionsColumn={showActionsColumn}
                        headerClassNames={columnClassNames}
                    />

                    <TableBody
                        role={role}
                        rowData={displayData}
                        columnCount={headers.length}
                        selectAll={allSelected}
                        setSelectAll={setSelectAll}
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onPreview={onPreview}
                        actions={actions}
                        showSelectionColumn={showSelectionColumn}
                        showActionsColumn={showActionsColumn}
                        columnAlignments={columnAlignments}
                        columnClassNames={columnClassNames}
                        emptyMessage={emptyMessage || t('empty.noData')}
                    />
                </table>
                </div>

                {(showPagination || paginationSummary || (hasPagingLimit && rawData.length > displayRowLimit)) && (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-3 pt-3" dir={isRTL ? 'rtl' : 'ltr'}>
                        <div className="hidden sm:block text-center text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark" dir={isRTL ? 'rtl' : 'ltr'}>
                            {(hasPagingLimit && rawData.length > displayRowLimit)
                                                    ? (itemsLabel
                                                        ? `${t('pagination.showing')} ${toArabicDigits((currentPage - 1) * displayRowLimit + 1)}–${toArabicDigits(Math.min(currentPage * displayRowLimit, rawData.length))} ${t('pagination.of')} ${toArabicDigits(rawData.length)} ${itemsLabel}`
                                                        : `${t('pagination.showingFirst', { count: displayRowLimit })} ${t('pagination.of')} ${toArabicDigits(rawData.length)} ${t('pagination.rows')}`)
                                : paginationSummary || ""}
                        </div>

                        {showPagination && (
                            <PaginationButtons
                                totalPages={computedTotalPages}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                            />
                        )}
                    </div>
                )}
                </BaseComponent>
            ) : (
                <div className="flex flex-col gap-4 overflow-x-auto">
                    <div className="rounded-lg overflow-hidden border border-border-primary-default-light dark:border-border-primary-default-dark">
                    <table className="min-w-full table-auto border-separate border-spacing-0">
                    <TableHeader
                        headerData={headers}
                        selectAll={allSelected}
                        setSelectAll={handleSetSelectAll}
                        showSelectionColumn={showSelectionColumn}
                        showActionsColumn={showActionsColumn}
                        headerClassNames={columnClassNames}
                    />

                    <TableBody
                        role={role}
                        rowData={displayData}
                        columnCount={headers.length}
                        selectAll={allSelected}
                        setSelectAll={setSelectAll}
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onPreview={onPreview}
                        actions={actions}
                        showSelectionColumn={showSelectionColumn}
                        showActionsColumn={showActionsColumn}
                        columnAlignments={columnAlignments}
                        columnClassNames={columnClassNames}
                        emptyMessage={emptyMessage || t('empty.noData')}
                    />
                </table>
                </div>

                {(showPagination || paginationSummary || (hasPagingLimit && rawData.length > displayRowLimit)) && (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-3 pt-3" dir={isRTL ? 'rtl' : 'ltr'}>
                        <div className="hidden sm:block text-center text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark" dir={isRTL ? 'rtl' : 'ltr'}>
                            {(hasPagingLimit && rawData.length > displayRowLimit)
                                                    ? (itemsLabel
                                                        ? `${t('pagination.showing')} ${toArabicDigits((currentPage - 1) * displayRowLimit + 1)}–${toArabicDigits(Math.min(currentPage * displayRowLimit, rawData.length))} ${t('pagination.of')} ${toArabicDigits(rawData.length)} ${itemsLabel}`
                                                        : `${t('pagination.showingFirst', { count: displayRowLimit })} ${t('pagination.of')} ${toArabicDigits(rawData.length)} ${t('pagination.rows')}`)
                                : paginationSummary || ""}
                        </div>

                        {showPagination && (
                            <PaginationButtons
                                totalPages={computedTotalPages}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                            />
                        )}
                    </div>
                )}
                </div>
            )}

            <PaginationRow
                page={page}
                totalPages={totalPages}
                onPageChange={onPageChange}
                from={from !== undefined ? from : (page && displayData.length ? (page - 1) * displayData.length + 1 : undefined)}
                to={to !== undefined ? to : (page && displayData.length ? (page - 1) * displayData.length + displayData.length : undefined)}
                totalItems={totalItems}
                itemsLabel={itemsLabel}
            />
        </>
    );

    return wrapInSection ? <Section>{content}</Section> : content;
}

function PaginationRow({ page, totalPages, onPageChange, from, to, totalItems, itemsLabel }) {
    if (page === undefined) return null;
    return (
        <div className="pt-3">
            <PaginationButtons
                totalPages={totalPages}
                currentPage={page}
                setCurrentPage={onPageChange}
                from={from}
                to={to}
                total={totalItems}
                label={itemsLabel}
            />
        </div>
    );
}
