import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";

import TextArea from "../../../../../components/ui/TextArea";
import BaseComponent from "../../../../../components/ui/BaseComponent";
import BaseFormComponent from "../../../../../components/ui/BaseFormComponent";
import Button from "../../../../../components/ui/Button";
import { ExclamationIcon } from "../../../../../components/ui/icons";
import { fileGradeComplaint } from "../../../services/gradeApi";
import { useToast } from "../../../../../contexts/ToastContext";

export default function GradeComplaint({ className = "", items = [], compact = false, courseId }) {
	const { t } = useTranslation('student');
	const { showToast } = useToast();

	const complaintTypes = [
		{ value: "quiz", label: t('gradeComplaint.typeQuiz') },
		{ value: "assignment", label: t('gradeComplaint.typeAssignment') },
		{ value: "midterm", label: t('gradeComplaint.typeMidterm') },
		{ value: "project", label: t('gradeComplaint.typeProject') },
		{ value: "final", label: t('gradeComplaint.typeFinal') },
	];
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [complaintType, setComplaintType] = useState("");
	const [assessmentId, setAssessmentId] = useState("");
	const [complaintReason, setComplaintReason] = useState("");
	const [formError, setFormError] = useState("");

	const complaintItemOptions = useMemo(() => {
		return items.filter((item) => item.type === complaintType);
	}, [complaintType, items]);

	const submitMutation = useMutation({
		mutationFn: fileGradeComplaint,
		onSuccess: () => {
			showToast({ type: "success", title: t('gradeComplaint.complaintSubmitted'), message: t('gradeComplaint.complaintSubmittedMsg') });
			setIsFormOpen(false);
			setFormError("");
			setComplaintType("");
			setAssessmentId("");
			setComplaintReason("");
		},
		onError: (err) => {
			setFormError(err.message || t('gradeComplaint.submitFailed'));
		},
	});

	const openForm = () => {
		setFormError("");
		setIsFormOpen(true);
	};

	const closeForm = () => {
		if (submitMutation.isPending) return;
		setIsFormOpen(false);
		setFormError("");
		setComplaintType("");
		setAssessmentId("");
		setComplaintReason("");
	};

	const handleComplaintTypeChange = (event) => {
		const nextType = event.target.value;
		const filtered = items.filter((item) => item.type === nextType);
		const nextId = filtered.length === 1 ? String(filtered[0].id) : "";
		setComplaintType(nextType);
		setAssessmentId(nextId);
		setFormError("");
	};

	const handleSubmit = () => {
		if (!complaintType) {
			setFormError(t('gradeComplaint.errorSelectType'));
			return;
		}

		if (!complaintReason.trim()) {
			setFormError(t('gradeComplaint.errorAddReason'));
			return;
		}

		if (complaintItemOptions.length === 0) {
			setFormError(t('gradeComplaint.errorNoItems', { type: complaintType }));
			return;
		}

		if (complaintItemOptions.length > 1 && !assessmentId) {
			setFormError(t('gradeComplaint.errorSelectSpecific', { type: complaintType }));
			return;
		}

		setFormError("");

		submitMutation.mutate({
			complaintType,
			gradeId: parseInt(complaintItemOptions.length === 1 ? String(complaintItemOptions[0].id) : assessmentId),
			details: complaintReason.trim(),
		});
	};

	return (
		<>
			{compact ? (
				<Button
					type="button"
					variant="danger"
					className="w-full"
					onClick={openForm}
				>
					{t('gradeComplaint.fillComplaint')}
				</Button>
			) : (
				<BaseComponent
					title={t('gradeComplaint.title')}
					description={t('gradeComplaint.description')}
					className={`flex flex-col ${className}`}
					contentClassName="flex flex-1 flex-col justify-center px-5 py-5 sm:px-6"
				>
					<div className="flex flex-col items-center space-y-4 text-center">
						<div className="flex flex-row items-start gap-4 text-start">
							<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border-danger-default-light/30 bg-bg-surface-danger-default-light/40 text-text-danger-active-light shadow-sm ring-4 ring-bg-surface-danger-default-light/10 dark:border-border-danger-default-dark/30 dark:bg-bg-surface-danger-default-dark/40 dark:text-text-danger-active-dark dark:ring-bg-surface-danger-default-dark/10">
								<ExclamationIcon size={22} />
							</div>
							<p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
								{t('gradeComplaint.infoText')}
							</p>
						</div>

						<Button
							type="button"
							variant="secondary"
							className="w-full text-text-danger-active-light hover:bg-bg-surface-danger-default-light dark:text-text-danger-active-dark dark:hover:bg-bg-surface-danger-default-dark"
							onClick={openForm}
						>
							{t('gradeComplaint.fillComplaint')}
						</Button>
					</div>
				</BaseComponent>
			)}

			<BaseFormComponent
				isOpen={isFormOpen}
				title={t('gradeComplaint.formTitle')}
				description={t('gradeComplaint.formDescription')}
				onClose={closeForm}
				onSubmit={handleSubmit}
				submitText={submitMutation.isPending ? t('gradeComplaint.submitting') : t('gradeComplaint.submitComplaint')}
				cancelText={t('gradeComplaint.cancel')}
				maxWidth="max-w-2xl"
				submitDisabled={submitMutation.isPending}
				submitLoading={submitMutation.isPending}
				contentClassName="space-y-6"
			>
				{formError ? (
					<div className="rounded-2xl border border-border-danger-default-light bg-bg-surface-danger-default-light px-4 py-3 text-sm text-text-danger-default-light dark:border-border-danger-default-dark dark:bg-bg-surface-danger-default-dark dark:text-text-danger-default-dark">
						{formError}
					</div>
				) : null}

				<div className="space-y-4">
					<div className={`grid grid-cols-1 gap-4 ${complaintItemOptions.length > 1 ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" : ""}`}>
						<div className="space-y-2">
							<label className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
								{t('gradeComplaint.complaintType')}
							</label>
							<select
								value={complaintType}
								onChange={handleComplaintTypeChange}
								className="w-full rounded-2xl border border-border-primary-default-light bg-bg-surface-secondary-default-light px-4 py-3 text-sm text-text-primary-light outline-none transition-colors focus:border-border-accent-default-light focus:ring-4 focus:ring-accent-500/10 dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark dark:text-text-primary-dark"
							>
								<option value="">{t('gradeComplaint.selectType')}</option>
								{complaintTypes.map((type) => (
									<option key={type.value} value={type.value}>
										{type.label}
									</option>
								))}
							</select>
						</div>

						{complaintItemOptions.length > 1 && (
							<div className="space-y-2">
								<label className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
									{t('gradeComplaint.selectSpecific', { type: complaintType })}
								</label>
								<select
									value={assessmentId}
									onChange={(event) => setAssessmentId(event.target.value)}
									className="w-full rounded-2xl border border-border-primary-default-light bg-bg-surface-secondary-default-light px-4 py-3 text-sm text-text-primary-light outline-none transition-colors focus:border-border-accent-default-light focus:ring-4 focus:ring-accent-500/10 dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark dark:text-text-primary-dark"
								>
									<option value="">{t('gradeComplaint.chooseSpecific', { type: complaintType })}</option>
									{complaintItemOptions.map((item) => (
										<option key={item.id} value={item.id}>
											{item.title}
										</option>
									))}
								</select>
							</div>
						)}
						{complaintItemOptions.length === 0 && (
							<p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
								{t('gradeComplaint.noItems', { type: complaintType })}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<label className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
							{t('gradeComplaint.complaintDetails')}
						</label>
						<TextArea
							value={complaintReason}
							onChange={(event) => setComplaintReason(event.target.value)}
							placeholder={t('gradeComplaint.placeholder')}
							className="w-full rounded-2xl border border-border-primary-default-light bg-bg-surface-secondary-default-light px-4 py-3 text-sm text-text-primary-light outline-none transition-colors placeholder:text-text-secondary-default-light focus:border-border-accent-default-light focus:ring-4 focus:ring-accent-500/10 dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark dark:text-text-primary-dark dark:placeholder:text-text-secondary-default-dark"
						/>
					</div>
				</div>
				</BaseFormComponent>
			</>
	);
}
