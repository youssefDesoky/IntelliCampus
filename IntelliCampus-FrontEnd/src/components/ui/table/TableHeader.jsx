import { useTranslation } from "react-i18next";

export default function TableHeader({ headerData, selectAll, setSelectAll, showSelectionColumn = true, showActionsColumn = true, headerClassNames }) {
    const { t } = useTranslation("common");
    return (
        <thead className="bg-bg-surface-secondary-active-light dark:bg-bg-fill-secondary-default-dark border-b border-border-primary-default-light dark:border-border-primary-default-dark">
            <tr className="text-text-primary-active-light dark:text-text-primary-default-dark">
                {showSelectionColumn && (
                    <th className="p-3">
                        <input 
                            type="checkbox" 
                            checked={selectAll}
                            onChange={() => setSelectAll(!selectAll)} 
                        />
                    </th>
                )}

                {headerData.map((header, index) => (
                    <th key={index} className={`p-3 text-center ${headerClassNames?.[index] || ""}`}>
                        {header}
                    </th>
                ))}

                {showActionsColumn && <th className="p-3">{t('labels.actions', 'Actions')}</th>}
            </tr>
        </thead>
    );
}