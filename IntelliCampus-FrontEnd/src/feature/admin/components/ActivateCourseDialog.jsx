import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../../components/ui/Button";
import { CheckIcon, XIcon } from "../../../components/ui/icons";
import SelectBox from "../../../components/ui/SelectBox";
import ModelOverlay from "../../../components/ui/ModelOverlay";
import { fetchInstructors } from "../services/adminInstructorsApi";

const semesterOptions = [
    { value: "Fall 2025", label: "Fall 2025" },
    { value: "Spring 2026", label: "Spring 2026" },
    { value: "Summer 2026", label: "Summer 2026" },
    { value: "Fall 2026", label: "Fall 2026" },
];

export default function ActivateCourseDialog({ course, onClose, onActivate }) {
    const { t } = useTranslation('admin');
    const [professorOptions, setProfessorOptions] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(semesterOptions[0]);
    const [selectedProfessor, setSelectedProfessor] = useState(null);

    useEffect(() => {
        async function loadInstructors() {
            try {
                const data = await fetchInstructors();
                const list = Array.isArray(data) ? data : [];

                const professors = list
                    .filter(i => i.role === "Professor")
                    .map(i => ({ value: i.name, label: `${i.name} — ${i.department}` }));
                setProfessorOptions(professors);

                if (professors.length > 0) setSelectedProfessor(professors[0]);
            } catch { /* silently ignored */ }
        }
        loadInstructors();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        onActivate({
            semester: selectedSemester.value,
            professor: selectedProfessor?.value || "",
        });
    };

    return (
        <ModelOverlay onClose={onClose}>
            <form
                className="bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark w-full p-6 rounded-lg shadow-md"
                onSubmit={handleSubmit}
            >
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1 mb-6">
                        <h2 className="text-2xl font-semibold">{t('activateCourse.title')}</h2>
                        <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                            {t('activateCourse.description', { title: course.title, id: course.id })}
                        </p>
                    </div>

                    <button type="button" onClick={onClose} className="p-2 place-self-start rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 hover:text-gray-800">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-6 mb-6">
                    <SelectBox
                        className="w-full"
                        label={t('activateCourse.semester')}
                        labelDirection="flex-col"
                        options={semesterOptions}
                        selectedOption={selectedSemester}
                        onChange={setSelectedSemester}
                    />

                    {professorOptions.length > 0 && (
                        <SelectBox
                            className="w-full"
                            label={t('activateCourse.mainProfessor')}
                            labelDirection="flex-col"
                            options={professorOptions}
                            selectedOption={selectedProfessor}
                            onChange={setSelectedProfessor}
                        />
                    )}
                </div>

                <div className="flex items-center justify-end gap-4">
                    <Button variant="secondary" type="button" onClick={onClose}>
                        {t('manageExams.cancel')}
                    </Button>

                    <Button variant="success" type="submit">
                        <CheckIcon className="w-5 h-5" /> {t('activateCourse.activate')}
                    </Button>
                </div>
            </form>
        </ModelOverlay>
    );
}
