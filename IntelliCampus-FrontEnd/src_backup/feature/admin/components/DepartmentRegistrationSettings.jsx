import { useState } from "react";
import { useTranslation } from "react-i18next";
import ModelOverlay from "../../../components/ui/ModelOverlay";
import Button from "../../../components/ui/Button";
import DateInput from "../../../components/form/DateInput";
import { XIcon, FloppyDiskIcon } from "../../../components/ui/icons";
import { useError } from '../../../contexts/ErrorContext.jsx';

export default function DepartmentRegistrationSettings({ onClose, onSave }) {
  const { t } = useTranslation('admin');
  const { showError } = useError();

  const [regStartDate, setRegStartDate] = useState("");
  const [regEndDate, setRegEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        regStartDate: regStartDate || null,
        regEndDate: regEndDate || null,
      });
      onClose();
    } catch (err) {
      showError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModelOverlay onClose={onClose} maxWidth="max-w-lg">
      <div className="w-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
          <div>
            <h2 className="text-xl font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
              {t('deptRegSettings.title')}
            </h2>
            <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark mt-0.5">
              {t('deptRegSettings.description')}
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

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-primary-default-light dark:text-text-primary-default-dark">
              {t('deptRegSettings.startDate')}
            </label>
            <DateInput
              name="regStartDate"
              value={regStartDate}
              onChange={(e) => setRegStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-primary-default-light dark:text-text-primary-default-dark">
              {t('deptRegSettings.endDate')}
            </label>
            <DateInput
              name="regEndDate"
              value={regEndDate}
              onChange={(e) => setRegEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
          <Button variant="secondary" onClick={onClose}>
            {t('manageExams.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            <FloppyDiskIcon size={16} />
            {saving ? t('roomForm.saving') : t('deptRegSettings.saveSettings')}
          </Button>
        </div>
      </div>
    </ModelOverlay>
  );
}
