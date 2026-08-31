import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Button from "../../../components/ui/Button";
import {PlusIcon, ArrowRightIcon} from "../../../components/ui/icons";

import SmartNoteItem from "./smartNotes/SmartNoteItem";

export default function DashboardSmartNotes({ studentNotes=[], className }) {
    const { t } = useTranslation('student');
    return (
        <div className={`p-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg ${className}`}>
            <div id="today-reminders-header" className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{t("dashboard.smartNotes")}</h2>
                <Button className="p-2 bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark hover:bg-bg-surface-accent-hover-light dark:hover:bg-bg-surface-accent-hover-dark text-text-accent-active-light dark:text-text-accent-active-dark rounded-md transition-transform duration-200 ease-in-out flex items-center justify-center">
                    <PlusIcon className="w-6 h-6" />
                </Button>
            </div>

            <menu className="flex flex-col  gap-3 mb-8" aria-labelledby="smart-notes-header">
                {studentNotes.length === 0 ? (
                    <div className="mb-4 border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg">
                        <div className="flex flex-col items-center justify-center h-full p-6 text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                            <PlusIcon className="w-12 h-12 mb-4" />
                            <p className="text-center">{t("dashboard.noNotes")}</p>
                        </div>
                    </div>
                ) : (
                    studentNotes.slice(0, 2).map((note, index) => (
                        <SmartNoteItem key={index} note={note} />
                    ))
                )}
            </menu>

            <NavLink to="/smart-notes" className="text-text-accent-default-light dark:text-text-accent-default-dark hover:underline flex items-center gap-2 justify-center font-medium">
                {t("dashboard.viewAllNotes")}
                <ArrowRightIcon className="w-4 h-4 rtl:scale-x-[-1]" />
            </NavLink>
        </div>
    );
}