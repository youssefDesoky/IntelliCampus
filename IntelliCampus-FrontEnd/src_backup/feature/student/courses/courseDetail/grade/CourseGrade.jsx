import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";

import AssessmentBreakdown from "./AssessmentBreakdown";
import CurrentGrade from "./CurrentGrade";
import GradeComplaint from "./GradeComplaint";
import GradeHistory from "./GradeHistory";
import { fetchCourseGrade } from "../../gradeApi";

import { useDeviceType } from '../../../../../hooks';
import { CourseGradeSkeleton } from "./SkeletonLoader";

const PAGE_SIZE = 3;

export default function CourseGrade() {
	const { t } = useTranslation('student');
	const { course } = useOutletContext();
	const { isPhone } = useDeviceType();
	const [currentPage, setCurrentPage] = useState(1);

	const { data: gradeData = null, isLoading } = useQuery({
		queryKey: ["courseGrade", course?.id],
		queryFn: () => fetchCourseGrade(course.id),
		staleTime: 5 * 60 * 1000,
		enabled: !!course?.id,
	});

	if (isLoading) {
		return <CourseGradeSkeleton />;
	}

	if (!gradeData) {
		return (
			<div className="flex flex-col flex-1 items-center justify-center min-h-[60vh] text-center">
				<h3 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('courseGrade.emptyTitle')}</h3>
				<p className="mt-2 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('courseGrade.emptyDesc')}</p>
			</div>
		);
	}

	const { overallGrade = {}, assessmentBreakdown = [], history = [] } = gradeData || {};
	const gradedItems = history?.filter((item) => item.status === "Graded") || [];

	return (
		<div className="relative overflow-hidden">
			<div className="absolute -top-24 end-0 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-900/20" />
			<div className="absolute bottom-0 start-0 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl dark:bg-sky-900/20" />

			{isPhone ? (
				<div className="relative flex flex-col gap-6">
					<CurrentGrade gradePercent={overallGrade.percent} letterGrade={overallGrade.letter} gradedItems={gradedItems} items={history} courseId={course.id} />
					<GradeHistory items={history} currentPage={currentPage} setCurrentPage={setCurrentPage} />
				</div>
			) : (
				<div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2">
						<AssessmentBreakdown groups={assessmentBreakdown} />
					</div>
					<div className="flex flex-col gap-6 lg:h-full">
						<CurrentGrade className="flex-1" gradePercent={overallGrade.percent} letterGrade={overallGrade.letter} gradedItems={gradedItems} />
						<GradeComplaint className="flex-1" items={history} courseId={course.id} />
					</div>
				</div>
			)}

			{/* Grade History - desktop only */}
			{!isPhone && (
				<div className="relative mt-6">
					<GradeHistory items={history} currentPage={currentPage} setCurrentPage={setCurrentPage} />
				</div>
			)}
		</div>
	);
}
