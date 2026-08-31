import { WarningIcon } from "../../../../components/ui/icons";

export default function SmartNoteItem({ note }) {
    return (
        <li className="p-4 border rounded-lg shadow-sm flex flex-col items-start hover:shadow-md transition-shadow duration-200 ease-in-out border-border-primary-default-light dark:border-border-primary-default-dark">
            <div className="flex justify-between w-full mb-2">
                <h3 className="text-sm font-semibold">{note.title}</h3>
                <WarningIcon className="w-5 h-5 text-text-warning-default-light dark:text-text-warning-default-dark" />
            </div>

            <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{note.modified}</p>
        </li>
    );
}