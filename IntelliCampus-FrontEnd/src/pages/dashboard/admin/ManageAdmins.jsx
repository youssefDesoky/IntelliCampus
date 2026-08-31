import { useState, useCallback, useMemo } from "react";
import { useRouteLoaderData } from "react-router-dom";
import { useTranslation, Trans } from 'react-i18next';
import ManageEntity from "../../../components/ui/ManageEntity";
import ModelOverlay from "../../../components/ui/ModelOverlay";
import AdminForm from "../../../feature/admin/components/AdminForm";
import AssignRoleModal from "../../../feature/admin/components/AssignRoleModal";
import Button from "../../../components/ui/Button";
import { UserIcon, XIcon } from "../../../components/ui/icons";
import useDeviceType from "../../../hooks/useDeviceType";
import { fetchAdmins, createAdmin, updateAdmin, deleteAdmin } from "../../../feature/admin/services/adminAccountsApi";
import { getLocalizedField } from '../../../utils/getLocalizedField';
import { formatHireDate } from "../../../utils/formatDate";
import { ManageContentSkeleton } from "../../../feature/admin/shared/SkeletonLoader";

function getAdminRoleDisplay(admin) {
  if (admin.role) return admin.role;
  const roles = admin.roles || [];
  if (roles.length === 0) return null;
  const roleMap = {
    'admin_bachelor': 'Bachelor Admin',
    'admin_masters': 'Masters Admin',

    'admin_phd': 'PhD Admin',
    'admin_diploma': 'Diploma Admin',
    'admin_academicstaff': 'Academic Staff Admin',
    'superadmin': 'Super Admin',
    'admin': 'Admin',
  };
  const key = roles[0].toLowerCase();
  return roleMap[key] || roles[0];
}

export default function ManageAdmins() {
  const { t, i18n } = useTranslation('admin');
  const { isDesktop, isTablet } = useDeviceType();
  const user = useRouteLoaderData("root");
  const isSuperAdmin = (user?.roles || []).some(r => r.toLowerCase() === 'superadmin');

  const [previewAdmin, setPreviewAdmin] = useState(null);
  const [assignRoleTarget, setAssignRoleTarget] = useState(null);

  const adminTableHeaders = useMemo(() => {
    if (isDesktop) return [t('manageAdmins.adminId'), t('manageAdmins.admin'), t('manageAdmins.role'), t('manageAdmins.phone'), t('manageAdmins.hireDate')];
    if (isTablet) return [t('manageAdmins.adminId'), t('manageAdmins.admin'), t('manageAdmins.role')];
    return [t('manageAdmins.admin')];
  }, [isDesktop, isTablet, t]);

  const adminColumnAlignments = useMemo(() => {
    if (isDesktop) return ['text-center', 'text-start', 'text-center', 'text-center', 'text-center'];
    if (isTablet) return ['text-center', 'text-start', 'text-center'];
    return ['text-start'];
  }, [isDesktop, isTablet]);

  const searchFilter = useCallback((admin, q) => {
    if (!q) return true;
    return (
      admin.fullName?.toLowerCase().includes(q) ||
      String(admin.adminId)?.toLowerCase().includes(q) ||
      admin.email?.toLowerCase().includes(q) ||
      admin.department?.toLowerCase().includes(q) ||
      getAdminRoleDisplay(admin)?.toLowerCase().includes(q)
    );
  }, []);

  const buildAdminRow = useCallback((admin, { isDesktop, isTablet }) => {
    const row = {};
    if (isDesktop || isTablet) row.adminID = admin.adminId;
    row.admin = (
      <div className="flex items-center gap-3 min-w-0">
        {admin.profileImage || admin.avatar ? (
          <img src={admin.profileImage || admin.avatar} alt={getLocalizedField(admin, 'fullName', i18n.language)} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-text-secondary-default-light dark:text-text-secondary-default-dark" />
          </div>
        )}
        <div className="flex flex-col text-start min-w-0 max-w-40">
          <p className="truncate">{getLocalizedField(admin, 'fullName', i18n.language)}</p>
          <p className="text-xs truncate text-text-secondary-default-light dark:text-text-secondary-default-dark">{admin.email}</p>
        </div>
      </div>
    );
    if (isDesktop || isTablet) row.role = getAdminRoleDisplay(admin) || "—";
    if (isDesktop) { row.phone = admin.phoneNumber || admin.phone || "—"; row.hireDate = formatHireDate(admin.hireDate) || "—"; }
    return row;
  }, []);

  return (
    <ManageEntity
      entityName={t('manageAdmins.entityName')}
      entityNamePlural={t('manageAdmins.entityNamePlural')}
      entityIdField="userId"
      fetchItems={fetchAdmins}
      createItem={createAdmin}
      updateItem={updateAdmin}
      deleteItem={deleteAdmin}
      headerType="user"
      headerRole="admin"
      searchPlaceholder={t('manageAdmins.search')}
      serverSidePagination={true}
      tableRole="admin"
      tableHeaders={adminTableHeaders}
      columnAlignments={adminColumnAlignments}
      buildRow={buildAdminRow}
      onPreview={(admin) => setPreviewAdmin(admin)}
      rowActions={(item, { onEdit, onDelete }) => {
        const isTargetSuperAdmin = item.roles?.some(r => r.toLowerCase() === 'superadmin');
        const items = [
          { label: t('manageAdmins.viewDetails'), tone: 'primary', onClick: () => setPreviewAdmin(item) },
          { label: t('manageAdmins.editAction'), tone: 'primary', onClick: () => onEdit(item) },
          { label: t('manageAdmins.deleteAction'), tone: 'danger', onClick: () => onDelete(item) },
        ];
        if (isSuperAdmin && !isTargetSuperAdmin) {
          items.push({ label: t('manageAdmins.assignRole'), tone: 'accent', onClick: () => setAssignRoleTarget(item) });
        }
        return items;
      }}
      getDeleteMessage={(item) => {
        const name = getLocalizedField(item, 'fullName', i18n.language);
        const id = item?.adminId;
        return (
          <Trans i18nKey="manageAdmins.deleteConfirm" ns="admin" values={{ name, id }}>
            Are you sure you want to delete <strong>{{ name }}</strong> ({{ id }})? This action cannot be undone.
          </Trans>
        );
      }}
      renderForm={({ isFormOpen, editingItem, closeForm, handleCreate, handleFormSubmit }) => {
        if (!isFormOpen) return null;
        if (editingItem) {
          return <AdminForm method="put" initialData={editingItem} onClose={closeForm} onSubmit={handleFormSubmit} />;
        }
        return <AdminForm method="post" onClose={closeForm} onSubmit={handleCreate} />;
      }}
      renderLoading={() => <ManageContentSkeleton />}
      renderExtraDialogs={({ loadItems, openForm }) => (
        <>
          {previewAdmin && (
            <ModelOverlay onClose={() => setPreviewAdmin(null)} maxWidth="max-w-3xl">
              <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl shadow-2xl w-full flex flex-col">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark ring-2 ring-bg-surface-primary-default-light dark:ring-bg-surface-primary-default-dark shrink-0">
                        {previewAdmin.profileImage || previewAdmin.avatar ? (
                          <img src={previewAdmin.profileImage || previewAdmin.avatar} alt={getLocalizedField(previewAdmin, 'fullName', i18n.language) || previewAdmin.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserIcon className="w-7 h-7 text-text-secondary-default-light dark:text-text-secondary-default-dark" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                          {getLocalizedField(previewAdmin, 'fullName', i18n.language) || previewAdmin.name}
                        </h2>
                        <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark font-mono mt-1">
                          {t('manageAdmins.idLabel', { id: previewAdmin.adminId || "—" })}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setPreviewAdmin(null)} className="p-1.5 rounded-lg text-text-secondary-default-light dark:text-text-secondary-default-dark hover:bg-bg-surface-accent-default-light dark:hover:bg-bg-surface-accent-default-dark transition-colors">
                      <XIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    <div className="p-3 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                      <span className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('manageAdmins.role')}</span>
                      <span className="text-lg font-bold text-text-primary-default-light dark:text-text-primary-default-dark">{getAdminRoleDisplay(previewAdmin) || "—"}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                      <span className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('manageAdmins.phone')}</span>
                      <span className="text-lg font-bold text-text-primary-default-light dark:text-text-primary-default-dark">{previewAdmin.phoneNumber || previewAdmin.phone || "—"}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                      <span className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('manageAdmins.hireDate')}</span>
                      <span className="text-lg font-bold text-text-primary-default-light dark:text-text-primary-default-dark">{formatHireDate(previewAdmin.hireDate) || "—"}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-1">
                      <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark w-20">{t('manageAdmins.email')}</span>
                      <span className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">{previewAdmin.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-3 px-1">
                      <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark w-20">{t('manageAdmins.role')}</span>
                      <span className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">{getAdminRoleDisplay(previewAdmin) || "—"}</span>
                    </div>
                    <div className="flex items-center gap-3 px-1">
                      <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark w-20">{t('manageAdmins.hireDate')}</span>
                      <span className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">{formatHireDate(previewAdmin.hireDate) || "—"}</span>
                    </div>
                    <div className="flex items-center gap-3 px-1">
                      <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark w-20">{t('manageAdmins.phone')}</span>
                      <span className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">{previewAdmin.phoneNumber || previewAdmin.phone || "—"}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border-primary-default-light dark:border-border-primary-default-dark p-4 px-6 flex justify-end gap-3">
                  <Button variant="secondary" size="sm" onClick={() => setPreviewAdmin(null)}>{t('manageAdmins.close')}</Button>
                  <Button variant="primary" size="sm" onClick={() => { openForm(previewAdmin); setPreviewAdmin(null); }}>{t('manageAdmins.editProfile')}</Button>
                </div>
              </div>
            </ModelOverlay>
          )}
          {assignRoleTarget && (
            <AssignRoleModal
              userId={assignRoleTarget.userId}
              userName={getLocalizedField(assignRoleTarget, 'fullName', i18n.language)}
              onClose={() => setAssignRoleTarget(null)}
              onRolesUpdated={loadItems}
            />
          )}
        </>
      )}
    />
  );
}
