import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TrashIcon } from '../icons';
import Button from '../../ui/Button';
import SearchBar from '../../ui/SearchBar';
import Dialog from '../../ui/Dialog';

export default function TableHeaderActions({ role, roleLabel, selectedRows, onDeleteSelected, minimal = false }) {
    const { t } = useTranslation('common');
    const [DeleteSelected, setDeleteSelected] = useState(false);

    const label = roleLabel || (role === 'student' ? t('labels.students', 'Students') : role === 'admin' ? t('labels.admins', 'Admins') : t('labels.instructors', 'Instructors'));
    const singularLabel = roleLabel
        ? roleLabel.replace(/s$/i, '').toLowerCase()
        : (role === 'student' ? t('labels.student', 'student') : role === 'admin' ? t('labels.admin', 'admin') : t('labels.instructor', 'instructor'));

    if (minimal && selectedRows.length === 0) return null;

    return (
        <div className={`flex items-center ${minimal ? 'justify-end' : 'justify-between gap-8'} mb-4`}>
            {!minimal && <h2 className="text-xl font-semibold">{label}</h2>}
            <div className="flex items-center gap-2">
                {!minimal && <SearchBar placeholder={`${t('search', 'Search')} ${label}...`} />}
                
                {selectedRows.length > 0 && (
                    <Button 
                        variant="danger"
                        onClick={() => setDeleteSelected(true)}
                    >
                        <TrashIcon size={20} />
                        {t('delete')} ({selectedRows.length})
                    </Button>
                )}
            </div>

            <Dialog 
                isOpen={DeleteSelected} 
                variant="warning"
                confirmText={t('confirm.yesDelete', 'Yes, Delete')}
                cancelText={t('confirm.noKeep', 'No, Keep')}
                onConfirm={() => {
                    if (onDeleteSelected) {
                        onDeleteSelected(selectedRows);
                    }
                    setDeleteSelected(false);
                }}
                onClose={() => setDeleteSelected(false)}
            >
                {t('confirm.bulkDeleteMessage', 'Are you sure you want to delete {{count}} selected {{entity}}? This action cannot be undone.', { count: selectedRows.length, entity: singularLabel })}
            </Dialog>
        </div>
    );
}