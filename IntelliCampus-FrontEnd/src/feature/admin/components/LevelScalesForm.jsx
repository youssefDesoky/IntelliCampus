import { useState } from "react";
import { useTranslation } from "react-i18next";
import BaseFormComponent from "../../../components/ui/BaseFormComponent";
import Button from "../../../components/ui/Button";
import NumberInput from "../../../components/form/NumberInput";
import { PlusIcon, TrashIcon } from "../../../components/ui/icons";
import { useError } from '../../../contexts/ErrorContext.jsx';

const defaultLevelScale = { level: 1, minHours: 0 };

const inputClass = "w-full px-2 py-1.5 border border-border-primary-default-light dark:border-border-primary-default-dark rounded-md bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-sm text-text-primary-default-light dark:text-text-primary-default-dark focus:outline-none focus:border-border-primary-active-light";

function LevelScaleCard({ scale, index, onChange, onRemove, t }) {
    return (
        <div className="grid grid-cols-4 gap-3 items-end p-3 border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg">
            <div>
                <label className="block text-xs font-medium mb-1 text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('manageBylaws.levelScaleLevel')}</label>
                <NumberInput value={scale.level} onChange={(e) => onChange(index, "level", parseInt(e.target.value) || 1)} min="1" className="w-full" />
            </div>
            <div>
                <label className="block text-xs font-medium mb-1 text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('manageBylaws.levelScaleMinCredits')}</label>
                <NumberInput value={scale.minHours} onChange={(e) => onChange(index, "minHours", parseInt(e.target.value) || 0)} min="0" className="w-full" />
            </div>
            <div className="flex justify-center items-end">
                <Button variant="danger" type="button" onClick={() => onRemove(index)}>
                    <TrashIcon size={16} />
                </Button>
            </div>
        </div>
    );
}

export default function LevelScalesForm({ onClose, onSubmit, initialData = {}, isLoading = false, isOpen = true }) {
    const { t } = useTranslation('admin');
    const { showError } = useError();
    const [levelScales, setLevelScales] = useState(() => {
        if (initialData.levelScales && initialData.levelScales.length > 0) {
            return initialData.levelScales.map(l => ({ ...l }));
        }
        return [];
    });
    const addLevelScale = () => {
        const nextLevel = levelScales.length > 0 ? Math.max(...levelScales.map(l => l.level)) + 1 : 1;
        setLevelScales(prev => [...prev, { ...defaultLevelScale, level: nextLevel }]);
    };

    const removeLevelScale = (index) => {
        setLevelScales(prev => prev.filter((_, i) => i !== index));
    };

    const updateLevelScale = (index, field, value) => {
        setLevelScales(prev => prev.map((l, i) => i === index ? { ...l, [field]: value } : l));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const valid = levelScales.filter(l => l.level > 0);
        if (valid.length === 0) {
            showError(t('manageBylaws.errorLevelScaleRequired'));
            return;
        }

        try {
            await onSubmit({ levelScales: valid.map(l => ({
                level: l.level,
                minHours: parseInt(l.minHours) || 0,
            })) });
            onClose();
        } catch (err) {
            showError(err.message || t('manageBylaws.errorOccurred'));
        }
    };

    return (
        <BaseFormComponent
            isOpen={isOpen}
            title={t('manageBylaws.levelScaleTitle', { name: initialData.name || t('manageBylaws.entity') })}
            description={t('manageBylaws.levelScaleDescription')}
            onClose={onClose}
            onSubmit={handleSubmit}
            submitText={isLoading ? t('roomForm.saving') : t('manageBylaws.saveLevels')}
            submitLoading={isLoading}
        >
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
                        {t('manageBylaws.levelScaleCount', { count: levelScales.length })}
                    </span>
                    <Button variant="secondary" type="button" onClick={addLevelScale}>
                        <PlusIcon size={16} />
                        {t('courseGradesTab.addLevel')}
                    </Button>
                </div>

                {levelScales.length === 0 ? (
                    <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark py-4 text-center border border-dashed border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg">
                        {t('manageBylaws.noLevelScales')}
                    </p>
                ) : (
                    <div className="space-y-3">
                        {levelScales.map((scale, index) => (
                            <LevelScaleCard key={index} scale={scale} index={index} onChange={updateLevelScale} onRemove={removeLevelScale} t={t} />
                        ))}
                    </div>
                )}
            </div>
        </BaseFormComponent>
    );
}