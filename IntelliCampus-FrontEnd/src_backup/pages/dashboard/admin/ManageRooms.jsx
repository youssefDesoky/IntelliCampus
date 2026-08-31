import { useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import ManageEntity from "../../../components/ui/ManageEntity";
import RoomForm from "../../../feature/admin/components/RoomForm";
import useDeviceType from "../../../hooks/useDeviceType";
import { fetchRooms, createRoom, updateRoom, deleteRoom } from "../../../feature/admin/services/adminFacilitiesApi";
import { getLocalizedField } from '../../../utils/getLocalizedField';

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
    id: room.id ?? room.roomId,
  };
}

export default function ManageRooms() {
  const { t, i18n } = useTranslation("admin");
  const { isDesktop, isTablet } = useDeviceType();

  const tableHeaders = useMemo(() => {
    if (isDesktop) return [t('manageRooms.roomName'), t('manageRooms.type'), t('manageRooms.capacity'), t('manageRooms.location')];
    if (isTablet) return [t('manageRooms.roomName'), t('manageRooms.type'), t('manageRooms.capacity'), t('manageRooms.location')];
    return [t('manageRooms.roomName'), t('manageRooms.type')];
  }, [isDesktop, isTablet, t]);

  const columnAlignments = useMemo(() => {
    if (isDesktop || isTablet) return ["text-start", "text-center", "text-center", "text-center"];
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
      headerAddLabel={t('manageRooms.addRoom')}
      searchPlaceholder={t('manageRooms.search')}
      searchFilter={(item, q) =>
        (item.name || item.roomName || "").toLowerCase().includes(q) ||
        (item.type && item.type.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q))
      }
      tableRole="room"
      tableHeaders={tableHeaders}
      columnAlignments={columnAlignments}
      buildRow={(item, { isDesktop, isTablet }) => buildRoomRow(item, isDesktop, isTablet, i18n)}
      rowActions={(item, { onEdit, onDelete }) => [
        { label: t('manageRooms.edit'), onClick: () => onEdit(item), className: "text-text-primary-default-light dark:text-text-primary-default-dark font-medium" },
        { label: t('manageRooms.delete'), onClick: () => onDelete(item), className: "text-text-danger-default-light dark:text-text-danger-default-dark" },
      ]}
      getDeleteMessage={(item) => (
        <Trans ns="admin" i18nKey="manageRooms.deleteMessage" values={{ name: getLocalizedField(item, 'roomName', i18n.language) || getLocalizedField(item, 'name', i18n.language) }}>
          Are you sure you want to delete <strong>{{ name: getLocalizedField(item, 'roomName', i18n.language) || getLocalizedField(item, 'name', i18n.language) }}</strong>?
        </Trans>
      )}
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
