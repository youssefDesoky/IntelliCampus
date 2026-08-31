import { useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useRouteLoaderData } from "react-router-dom";
import ManageEntity from "../../../components/ui/ManageEntity";
import RoomForm from "../../../feature/admin/components/RoomForm";
import Button from "../../../components/ui/Button";
import { PlusIcon } from "../../../components/ui/icons";
import useDeviceType from "../../../hooks/useDeviceType";
import { fetchRooms, createRoom, updateRoom, deleteRoom } from "../../../feature/admin/services/adminFacilitiesApi";
import { getLocalizedField } from '../../../utils/getLocalizedField';
import { ManageContentSkeleton } from "../../../feature/admin/shared/SkeletonLoader";

function buildRoomRow(room, isDesktop, isTablet, i18n) {
  return {
    roomName: (
      <div className="flex flex-col text-start">
        <p className="font-medium">{getLocalizedField(room, 'roomName', i18n.language) || getLocalizedField(room, 'name', i18n.language) || "—"}</p>
      </div>
    ),
    type: room.type || "—",
    capacity: room.capacity ?? "—",
    ...((isDesktop || isTablet) ? { location: getLocalizedField(room, 'location', i18n.language) || room.roomLocation || room.Location || room.RoomLocation || "—" } : {}),
    ...((isDesktop || isTablet) ? { faculty: room.facultyName || room.faculty?.facultyName || "—" } : {}),
    id: room.id ?? room.roomId,
  };
}

export default function ManageRooms() {
  const { t, i18n } = useTranslation("admin");
  const { isDesktop, isTablet } = useDeviceType();
  const user = useRouteLoaderData("root");
  const isSuperAdmin = (user?.roles || []).some(r => r.toLowerCase() === 'superadmin');

  const tableHeaders = useMemo(() => {
    if (isDesktop) return [t('manageRooms.roomName'), t('manageRooms.type'), t('manageRooms.capacity'), t('manageRooms.location'), t('manageRooms.faculty')];
    if (isTablet) return [t('manageRooms.roomName'), t('manageRooms.type'), t('manageRooms.capacity'), t('manageRooms.location'), t('manageRooms.faculty')];
    return [t('manageRooms.roomName'), t('manageRooms.type')];
  }, [isDesktop, isTablet, t]);

  const columnAlignments = useMemo(() => {
    if (isDesktop || isTablet) return ["text-start", "text-center", "text-center", "text-center", "text-center"];
    return ["text-start", "text-center"];
  }, [isDesktop, isTablet]);

  return (
    <ManageEntity
      entityName={t('manageRooms.entityName')}
      entityNamePlural={t('manageRooms.entityNamePlural')}
      entityIdField={(item) => item.id ?? item.roomId}
      fetchItems={fetchRooms}
      createItem={createRoom}
      updateItem={updateRoom}
      deleteItem={deleteRoom}
      headerTitle={t('manageRooms.title')}
      headerSubtitle={t('manageRooms.subtitle')}
      renderHeaderActions={({ openForm }) =>
        isSuperAdmin ? (
          <Button variant="primary" onClick={() => openForm(null)}>
            <PlusIcon size={24} />
            {t('manageRooms.addRoom')}
          </Button>
        ) : null
      }
      searchPlaceholder={t('manageRooms.search')}
      serverSidePagination={true}
      filters={{}}
      tableRole="room"
      tableHeaders={tableHeaders}
      columnAlignments={columnAlignments}
      buildRow={(item, { isDesktop, isTablet }) => buildRoomRow(item, isDesktop, isTablet, i18n)}
      rowActions={(item, { onEdit, onDelete }) =>
        isSuperAdmin ? [
          { label: t('manageRooms.edit'), tone: 'primary', onClick: () => onEdit(item) },
          { label: t('manageRooms.delete'), tone: 'danger', onClick: () => onDelete(item) },
        ] : []
      }
      getDeleteMessage={(item) => (
        <Trans ns="admin" i18nKey="manageRooms.deleteMessage" values={{ name: getLocalizedField(item, 'roomName', i18n.language) || getLocalizedField(item, 'name', i18n.language) }}>
          Are you sure you want to delete <strong>{{ name: getLocalizedField(item, 'roomName', i18n.language) || getLocalizedField(item, 'name', i18n.language) }}</strong>?
        </Trans>
      )}
      renderLoading={() => <ManageContentSkeleton />}
      renderForm={({ isFormOpen, editingItem, closeForm, handleFormSubmit, formIsLoading }) =>
        isFormOpen && (
          <RoomForm
            onClose={closeForm}
            onSubmit={handleFormSubmit}
            initialData={editingItem || {}}
            isLoading={formIsLoading}
          />
        )
      }
    />
  );
}
