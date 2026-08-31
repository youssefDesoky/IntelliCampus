import { useState } from 'react';
import { TrashIcon } from '../icons';
import Button from '../../ui/Button';
import SearchBar from '../../ui/SearchBar';
import Dialog from '../../ui/Dialog';

export default function TableHeaderActions({ role, roleLabel, selectedRows, onDeleteSelected, minimal = false }) {
    const [DeleteSelected, setDeleteSelected] = useState(false);

    const label = roleLabel || (role === 'student' ? 'Students' : role === 'admin' ? 'Admins' : 'Instructors');
    const singularLabel = roleLabel
        ? roleLabel.replace(/s$/i, '').toLowerCase()
        : (role === 'student' ? 'student' : role === 'admin' ? 'admin' : 'instructor');

    if (minimal && selectedRows.length === 0) return null;

    return (
        <div className={`flex items-center ${minimal ? 'justify-end' : 'justify-between gap-8'} mb-4`}>
            {!minimal && <h2 className="text-xl font-semibold">{label}</h2>}
            <div className="flex items-center gap-2">
                {!minimal && <SearchBar placeholder={`Search ${label}...`} />}
                
                {selectedRows.length > 0 && (
                    <Button 
                        variant="danger"
                        onClick={() => setDeleteSelected(true)}
                    >
                        <TrashIcon size={20} />
                        Delete ({selectedRows.length})
                    </Button>
                )}
            </div>

            <Dialog 
                isOpen={DeleteSelected} 
                variant="warning"
                confirmText="Yes, Delete"
                cancelText="No, Keep"
                onConfirm={() => {
                    if (onDeleteSelected) {
                        onDeleteSelected(selectedRows);
                    }
                    setDeleteSelected(false);
                }}
                onClose={() => setDeleteSelected(false)}
            >
                Are you sure you want to delete {selectedRows.length} selected {
                    selectedRows.length > 1 ? `${singularLabel}s` : singularLabel
                }
                ? This action cannot be undone.
            </Dialog>
        </div>
    );
}