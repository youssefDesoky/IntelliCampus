import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import ModelOverlay from "../../../components/ui/ModelOverlay";
import Button from "../../../components/ui/Button";
import DateInput from "../../../components/form/DateInput";
import { XIcon, FloppyDiskIcon } from "../../../components/ui/icons";
import { fetchDepartments } from "../services/adminDepartmentsApi";
import { useError } from '../../../contexts/ErrorContext.jsx';
import { getLocalizedField } from '../../../utils/getLocalizedField';

const levelOptions = [
  { value: 1, label: "Level 1" },
  { value: 2, label: "Level 2" },
  { value: 3, label: "Level 3" },
  { value: 4, label: "Level 4" },
  { value: 5, label: "Level 5" },
];

export default function CourseRegistrationSettings({ onClose, onSave }) {
  const { t, i18n } = useTranslation('admin');
  const { showError } = useError();

  const [regStartDate, setRegStartDate] = useState("");
  const [regEndDate, setRegEndDate] = useState("");
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedDeptIds, setSelectedDeptIds] = useState([]);
  const [saving, setSaving] = useState(false);

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      try {
        const result = await fetchDepartments();
        return Array.isArray(result) ? result : (result?.data ?? []);
      } catch {
        return [];
      }
    },
    staleTime: 10 * 60 * 1000,
  });

  const toggleLevel = (level) => {
    setSelectedLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const toggleDepartment = (deptId) => {
    setSelectedDeptIds(prev =>
      prev.includes(deptId) ? prev.filter(d => d !== deptId) : [...prev, deptId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        regStartDate: regStartDate || null,
        regEndDate: regEndDate || null,
        allowedLevels: selectedLevels,
        allowedDepartmentIds: selectedDeptIds,
      });
      onClose();
    } catch (err) {
      showError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModelOverlay onClose={onClose} maxWidth="max-w-2xl">
      <div className="w-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
          <div>
            <h2 className="text-xl font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
              {t('courseRegSettings.title')}
            </h2>
            <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark mt-0.5">
              {t('courseRegSettings.description')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border-primary-default-light bg-bg-surface-secondary-default-light p-2 text-icon-secondary-default-light transition-colors hover:bg-bg-surface-secondary-hover-light dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark dark:text-icon-secondary-default-dark dark:hover:bg-bg-surface-secondary-hover-dark"
            aria-label="Close"
          >
            <XIcon size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Registration Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-text-primary-default-light dark:text-text-primary-default-dark">
                {t('courseRegSettings.startDate')}
              </label>
              <DateInput
                name="regStartDate"
                value={regStartDate}
                onChange={(e) => setRegStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-text-primary-default-light dark:text-text-primary-default-dark">
                {t('courseRegSettings.endDate')}
              </label>
              <DateInput
                name="regEndDate"
                value={regEndDate}
                onChange={(e) => setRegEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Allowed Levels */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-text-primary-default-light dark:text-text-primary-default-dark">
              {t('courseRegSettings.allowedLevels')}
            </label>
            <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mb-3">
              {t('courseRegSettings.allowedLevelsDesc')}
            </p>
            <div className="flex flex-wrap gap-2">
              {levelOptions.map(level => (
                <label
                  key={level.value}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                    selectedLevels.includes(level.value)
                      ? "border-border-accent-active-light dark:border-border-accent-active-dark bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark"
                      : "border-border-primary-default-light dark:border-border-primary-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedLevels.includes(level.value)}
                    onChange={() => toggleLevel(level.value)}
                    className="sr-only"
                  />
                  {level.label}
                </label>
              ))}
            </div>
          </div>

          {/* Allowed Departments */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-text-primary-default-light dark:text-text-primary-default-dark">
              {t('courseRegSettings.allowedDepartments')}
            </label>
            <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mb-3">
              {t('courseRegSettings.allowedDepartmentsDesc')}
            </p>
            {departments.length === 0 ? (
              <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('courseRegSettings.loadingDepartments')}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {departments.map(dept => (
                  <label
                    key={dept.departmentId || dept.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                      selectedDeptIds.includes(dept.departmentId || dept.id)
                        ? "border-border-accent-active-light dark:border-border-accent-active-dark bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark"
                        : "border-border-primary-default-light dark:border-border-primary-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDeptIds.includes(dept.departmentId || dept.id)}
                      onChange={() => toggleDepartment(dept.departmentId || dept.id)}
                      className="sr-only"
                    />
                    {getLocalizedField(dept, 'departmentName', i18n.language) || dept.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
          <Button variant="secondary" onClick={onClose}>
            {t('manageExams.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            <FloppyDiskIcon size={16} />
            {saving ? t('roomForm.saving') : t('courseRegSettings.saveSettings')}
          </Button>
        </div>
      </div>
    </ModelOverlay>
  );
}
