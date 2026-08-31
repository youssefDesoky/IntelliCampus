import { useTranslation } from "react-i18next";
import CircularProgress from "../../../../../components/ui/CircularProgress";
import GradeComplaint from "./GradeComplaint";

export default function CurrentGrade({ gradePercent = 0, letterGrade = "N/A", items = [], courseId }) {
    const { t } = useTranslation('student');

    const gradePercentNum = gradePercent;

    const getTheme = (pct) => {
        if (pct >= 85) return {
            gradient: "from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30",
            glow: "bg-emerald-200/30 dark:bg-emerald-900/20",
            text: "text-emerald-600 dark:text-emerald-400",
            border: "border-emerald-100 dark:border-emerald-900/50",
            message: pct >= 95 ? t('currentGrade.outstanding') : t('currentGrade.excellent'),
            progressColor: "text-emerald-500 dark:text-emerald-400",
            circleColor: "text-emerald-100 dark:text-emerald-900/20",
            labelColor: "text-emerald-600 dark:text-emerald-400",
        };

        if (pct >= 75) return {
            gradient: "from-sky-50 to-sky-100 dark:from-sky-950/30 dark:to-sky-900/30",
            glow: "bg-sky-200/30 dark:bg-sky-900/20",
            text: "text-sky-700 dark:text-sky-300",
            border: "border-sky-100 dark:border-sky-900/50",
            message: pct >= 80 ? t('currentGrade.veryGood') : t('currentGrade.goodWork'),
            progressColor: "text-sky-500 dark:text-sky-400",
            circleColor: "text-sky-100 dark:text-sky-900/20",
            labelColor: "text-sky-700 dark:text-sky-300",
        };

        if (pct >= 65) return {
            gradient: "from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30",
            glow: "bg-amber-200/30 dark:bg-amber-900/20",
            text: "text-amber-700 dark:text-amber-300",
            border: "border-amber-100 dark:border-amber-900/50",
            message: t('currentGrade.goodProgress'),
            progressColor: "text-amber-500 dark:text-amber-400",
            circleColor: "text-amber-100 dark:text-amber-900/20",
            labelColor: "text-amber-700 dark:text-amber-300",
        };

        if (pct >= 50) return {
            gradient: "from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30",
            glow: "bg-orange-200/30 dark:bg-orange-900/20",
            text: "text-orange-700 dark:text-orange-300",
            border: "border-orange-100 dark:border-orange-900/50",
            message: t('currentGrade.atRisk'),
            progressColor: "text-orange-500 dark:text-orange-400",
            circleColor: "text-orange-100 dark:text-orange-900/20",
            labelColor: "text-orange-700 dark:text-orange-300",
        };

        return {
            gradient: "from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/30",
            glow: "bg-rose-200/30 dark:bg-rose-900/20",
            text: "text-rose-700 dark:text-rose-400",
            border: "border-rose-100 dark:border-rose-900/50",
            message: t('currentGrade.needsAttention'),
            progressColor: "text-rose-500 dark:text-rose-400",
            circleColor: "text-rose-100 dark:text-rose-900/20",
            labelColor: "text-rose-700 dark:text-rose-400",
        };
    };

    const theme = getTheme(gradePercent);

    return (
        <div className={`relative overflow-hidden rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-linear-to-br ${theme.gradient} p-6 sm:p-8 transition-all duration-300`}>
            {/* Ambient Background Glows */}
            <div className={`absolute -top-20 -end-20 h-40 w-40 ${theme.glow} rounded-full blur-3xl pointer-events-none`} />
            <div className={`absolute -bottom-20 -start-20 h-40 w-40 bg-sky-200/20 dark:bg-sky-900/10 rounded-full blur-3xl pointer-events-none`} />
            
			<div className="relative flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-center sm:text-start">
				{/* Progress Visualizer */}
				<div 
					className="relative inline-flex items-center justify-center shrink-0"
					role="img" 
					aria-label={t('currentGrade.ariaLabel', { letterGrade, gradePercent: gradePercentNum })}
				>
					<CircularProgress
						progress={gradePercent}
						size={120}
						progressColor={theme.progressColor}
						circleColor={theme.circleColor}
						textColor={theme.labelColor}
					>
						<span className={`text-5xl font-black tracking-tight ${theme.labelColor}`}>
							{letterGrade}
						</span>
					</CircularProgress>
				</div>
				
				{/* Grade Analytics */}
				<div className="flex-1 w-full">
				<span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-default-light/70 dark:text-text-secondary-default-dark/70">
					{t('currentGrade.currentStanding')}
				</span>
				<p className="text-2xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark mt-0.5">
					{gradePercentNum}% <span className="text-sm font-normal text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('currentGrade.overall')}</span>
				</p>
					
					<div className={`mt-3 pt-3 border-t ${theme.border}`}>
						<p className={`text-sm font-semibold ${theme.text}`}>
							{theme.message}
						</p>
					</div>
				</div>
			</div>

		<div className="mt-4 block sm:hidden">
				<GradeComplaint items={items} compact courseId={courseId} />
			</div>
        </div>
    );
}