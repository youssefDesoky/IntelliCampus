import { useEffect, useState, useRef, useCallback } from "react";
import DropdownMenu from "../DropdownMenu";
import { EllipsisVerticalIcon } from "../icons";
import Dialog from "../Dialog";
import AdminForm from "../../../feature/admin/components/AdminForm";
import InstructorForm from "../../../feature/admin/components/InstructorForm";
import StudentForm from "../../../feature/admin/components/StudentForm";

const buttonStyle = "w-full text-start px-3 py-2 rounded hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark ";

export default function TableBody({ role, rowData, columnCount, selectAll, setSelectAll, selectedRows, setSelectedRows, onDelete, onEdit, onPreview, actions, showSelectionColumn = true, showActionsColumn = true, columnAlignments, columnClassNames, emptyMessage = "No data found." }) {
	const [editingRow, setEditingRow] = useState(null);
	const [deleteButtonClicked, setDeleteButtonClicked] = useState(false);
	const [actionButtonClicked, setActionButtonClicked] = useState(null);
	const [dropdownStyle, setDropdownStyle] = useState({});
	const buttonRefs = useRef({});
	useEffect(() => {
		if (selectAll) {
			if (selectedRows.length !== rowData.length) {
				setSelectedRows(rowData.map((_, index) => index));
			}
		} else if (selectedRows.length === rowData.length && rowData.length > 0) {
			setSelectedRows([]);
		}
	}, [selectAll, rowData, selectedRows.length, setSelectedRows]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (!event.target.closest('.action-dropdown') && !event.target.closest('.action-btn')) {
				setActionButtonClicked(null);
			}
		};

		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	const handleCheckboxChange = (index) => {
		if (!showSelectionColumn) return;
		if (selectedRows.includes(index)) {
			setSelectedRows(selectedRows.filter(i => i !== index));
			setSelectAll(false);
		} else {
			const newSelectedRows = [...selectedRows, index];
			setSelectedRows(newSelectedRows);
			if (newSelectedRows.length === rowData.length) {
				setSelectAll(true);
			}
		}
	};

	const handleActionClick = useCallback((e, rowIndex) => {
		e.stopPropagation();
		if (rowIndex === actionButtonClicked) {
			setActionButtonClicked(null);
			return;
		}
		const buttonEl = buttonRefs.current[rowIndex];
		if (buttonEl) {
			const rect = buttonEl.getBoundingClientRect();
			setDropdownStyle({
				top: rect.bottom + 8,
				left: rect.left + rect.width / 2,
				transform: 'translateX(-50%)',
			});
		}
		setActionButtonClicked(rowIndex);
	}, [actionButtonClicked]);


	const handleEditClick = useCallback((rowIndex) => {
		setEditingRow({ index: rowIndex, data: rowData[rowIndex] });
		setActionButtonClicked(null);
	}, [rowData]);

	const handleDeleteClick = useCallback((rowIndex) => {
		setDeleteButtonClicked(rowIndex);
		setActionButtonClicked(null);
	}, []);

	const getEditComponent = () => {
		if (editingRow === null) return null;

		const commonProps = {
			initialData: editingRow.data,
			onClose: () => setEditingRow(null),
			onSubmit: (data) => {
				if (onEdit) onEdit(editingRow.index, data);
				setEditingRow(null);
			},
		};

		switch (role) {
			case "admin":
				return <AdminForm {...commonProps} method="put" />;
			case "instructor":
				return <InstructorForm {...commonProps} method="put" />;
			case "student":
				return <StudentForm {...commonProps} method="put" />;
			default:
				return null;
		}
	};

	return (
	<>
		<tbody>
			{rowData.map((row, rowIndex) => (
					<tr
						key={rowIndex}
						className={`${showSelectionColumn ? "text-center" : "text-center"} relative z-0 no-transitions hover:z-10 hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark 
							[&>td]:border-e [&>td]:border-e-border-primary-default-light dark:[&>td]:border-e-border-primary-default-dark [&>td:last-child]:border-e-0 hover:[&>td]:border-e-border-primary-hover-light dark:hover:[&>td]:border-e-border-primary-hover-dark                
							border border-border-primary-default-light dark:border-border-primary-default-dark hover:ring-1 hover:ring-inset hover:ring-border-primary-hover-light dark:hover:ring-border-primary-hover-dark
						`}
						onClick={showSelectionColumn ? () => handleCheckboxChange(rowIndex) : undefined}
						style={{ backgroundColor: showSelectionColumn && selectedRows.includes(rowIndex) ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}
					>
					{showSelectionColumn && (
						<td className="px-3 py-2 text-center">
							<input 
								type="checkbox" 
								checked={selectedRows.includes(rowIndex)}
								onChange={() => handleCheckboxChange(rowIndex)}
							/>
						</td>
					)}

					{Object.entries(row).filter(([key]) => !key.startsWith('_')).slice(0, columnCount).map(([key, cell], cellIndex) => (
						<td key={cellIndex} className={`px-1 sm:px-3 py-2 align-middle ${columnAlignments?.[cellIndex] || "text-center"} ${columnClassNames?.[cellIndex] || ""}`}>
							{cell}
						</td>
					))}
                    
					{showActionsColumn && (
						<td className="px-1 sm:px-3 py-2 text-center align-middle">
							<button
								ref={(el) => (buttonRefs.current[rowIndex] = el)}
								onClick={(e) => handleActionClick(e, rowIndex)}
								className="action-btn p-2 rounded-full hover:bg-bg-fill-tertiary-hover-light dark:hover:bg-bg-fill-tertiary-hover-dark"
							>
								<EllipsisVerticalIcon size={24} className="rotate-90" />
							</button>
						</td>
					)}
                </tr>
            ))}

            {rowData.length === 0 && (
                <tr>
                    <td
                        colSpan={
                            (showSelectionColumn ? 1 : 0) +
                            columnCount +
                            (showActionsColumn ? 1 : 0)
                        }
                        className="text-center py-12 text-text-secondary-default-light dark:text-text-secondary-default-dark"
                    >
                        {emptyMessage}
                    </td>
                </tr>
            )}

            {showActionsColumn && actionButtonClicked !== null && 
				<DropdownMenu 
					direction="bottom" 
					position="middle" 
					portal={true}
					style={dropdownStyle}
					className="action-dropdown"
				>
					{actions ? (
						actions(rowData[actionButtonClicked], actionButtonClicked).map((action, i) => (
							<button
								key={i}
								className={`${buttonStyle} text-text-primary-default-light dark:text-text-primary-default-dark hover:text-text-primary-hover-light dark:hover:text-text-primary-hover-dark ${action.className || ""}`}
								onClick={() => {
									action.onClick();
									setActionButtonClicked(null);
								}}
							>
								{action.label}
							</button>
						))
					) : (
						<>
							<button 
								className={`${buttonStyle} text-text-primary-default-light dark:text-text-primary-default-dark hover:text-text-primary-hover-light dark:hover:text-text-primary-hover-dark`}
								onClick={() => { onPreview?.(rowData[actionButtonClicked]?._raw ?? rowData[actionButtonClicked]); setActionButtonClicked(null); }}
							>
								View Details
							</button>
							<button 
								className={`${buttonStyle} text-text-primary-default-light dark:text-text-primary-default-dark hover:text-text-primary-hover-light dark:hover:text-text-primary-hover-dark`}
								onClick={() => handleEditClick(actionButtonClicked)}
							>
								Edit
							</button>
							<button 
								className={`${buttonStyle} text-text-danger-default-light dark:text-text-danger-default-dark hover:text-text-danger-hover-light dark:hover:text-text-danger-default-dark`}
								onClick={() => handleDeleteClick(actionButtonClicked)}
							>
								Delete
							</button>
						</>
					)}
				</DropdownMenu>
			}
		</tbody>    

		{showActionsColumn && !actions && deleteButtonClicked !== false && (
			<Dialog
				isOpen={deleteButtonClicked !== false}
				variant="error"
				title={`Delete ${role === "admin" ? "Admin" : role === "student" ? "Student" : "Instructor"}`}
				onClose={() => setDeleteButtonClicked(false)}
				onConfirm={() => {
					if (onDelete) {
						onDelete(deleteButtonClicked);
					}
					setDeleteButtonClicked(false);
					return true;
				}}
				confirmText="Delete"
				cancelText="Cancel"
				showCloseButton={true}
			>
				Are you sure you want to delete this {role === "admin" ? "Admin" : role === "student" ? "Student" : "Instructor"}? This action cannot be undone.
			</Dialog>
		)}

		{showActionsColumn && !actions && editingRow !== null && getEditComponent()}
	</>    
	);
}

