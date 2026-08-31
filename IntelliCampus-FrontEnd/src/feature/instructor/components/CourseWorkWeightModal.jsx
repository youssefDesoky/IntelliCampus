import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import BaseFormComponent from "../../../components/ui/BaseFormComponent";
import NumberInput from "../../../components/form/NumberInput";
import { setCourseWorkWeight } from "../services/gradesApi";
export default function CourseWorkWeightModal({ isOpen, onClose, courseId, currentWeight, onSaved }) {
    const { t } = useTranslation('instructor');
    const [quizWeight, setQuizWeight] = useState("");
    const [assignmentWeight, setAssignmentWeight] = useState("");
    const [midtermWeight, setMidtermWeight] = useState("");

    useEffect(() => {
        if (currentWeight) {
            setQuizWeight(currentWeight.quizWeight?.toString() ?? "");
            setAssignmentWeight(currentWeight.assignmentWeight?.toString() ?? "");
            setMidtermWeight(currentWeight.midtermWeight?.toString() ?? "");
        } else {
            setQuizWeight("");
            setAssignmentWeight("");
            setMidtermWeight("");
        }
    }, [currentWeight, isOpen]);

    const saveMutation = useMutation({
        mutationFn: () =>
            setCourseWorkWeight(courseId, {
                quizWeight: parseFloat(quizWeight) || 0,
                assignmentWeight: parseFloat(assignmentWeight) || 0,
                midtermWeight: parseFloat(midtermWeight) || 0,
            }),
        onSuccess: () => {
            onSaved?.();
            onClose();
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        saveMutation.mutate();
    };

    return (
        <BaseFormComponent
            isOpen={isOpen}
            title={t('weights.title')}
            description={t('weights.description')}
            onClose={onClose}
            onSubmit={handleSubmit}
            submitText={saveMutation.isPending ? t('weights.saving') : t('weights.saveWeights')}
            submitLoading={saveMutation.isPending}
        >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <NumberInput
                    label={t('weights.quizzes')}
                    value={quizWeight}
                    onChange={(e) => setQuizWeight(e.target.value)}
                    placeholder={t('weights.placeholderQuizzes')}
                    min="0"
                    max="100"
                    step="0.1"
                    required
                />
                <NumberInput
                    label={t('weights.assignments')}
                    value={assignmentWeight}
                    onChange={(e) => setAssignmentWeight(e.target.value)}
                    placeholder={t('weights.placeholderAssignments')}
                    min="0"
                    max="100"
                    step="0.1"
                    required
                />
                <NumberInput
                    label={t('weights.midterm')}
                    value={midtermWeight}
                    onChange={(e) => setMidtermWeight(e.target.value)}
                    placeholder={t('weights.placeholderMidterm')}
                    min="0"
                    max="100"
                    step="0.1"
                    required
                />
            </div>
            <p className="mt-4 text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                {t('weights.note')}
            </p>
        </BaseFormComponent>
    );
}
