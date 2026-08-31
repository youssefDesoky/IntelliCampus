import { useTranslation } from "react-i18next";
import { TableIcon } from "../../../../components/ui/icons";
import { ChartCard } from "../../../../components/charts";

function getScoreColor(score) {
  if (score >= 90) return "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200";
  if (score >= 80) return "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200";
  if (score >= 70) return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200";
  if (score >= 60) return "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200";
  return "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200";
}

export default function StudentScoreHeatmap({ className = "", data = [], downloadUrl }) {
  const { t } = useTranslation('instructor');
  if (!data || data.length === 0) {
    return (
      <ChartCard title={t('chart.studentScoreHeatmap')} icon={<TableIcon size={20} />} className={className} downloadUrl={downloadUrl}
        chartType="bar" chartData={[]} categoryField="student" series={[{ field: "score", name: t('chart.score') }]}>
        <p className="text-center text-text-tertiary-default-light dark:text-text-tertiary-default-dark py-8">{t('chart.noData')}</p>
      </ChartCard>
    );
  }

  const assessmentKeys = Object.keys(data[0].scores);
  const chartData = data.map((row) => ({
    student: row.student,
    ...row.scores,
  }));
  const heatmapSeries = assessmentKeys.map((key) => ({ field: key, name: key }));

  return (
    <ChartCard title={t('chart.studentScoreHeatmap')} icon={<TableIcon size={20} />} className={className} downloadUrl={downloadUrl}
      chartType="bar" chartData={chartData} categoryField="student" series={heatmapSeries}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-start p-2 text-text-tertiary-default-light dark:text-text-tertiary-default-dark font-medium sticky start-0 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark z-10">{t('chart.student')}</th>
              {assessmentKeys.map((key) => (
                <th key={key} className="text-center p-2 text-text-tertiary-default-light dark:text-text-tertiary-default-dark font-medium min-w-[80px]">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.student} className="border-t border-border-primary-default-light dark:border-border-primary-default-dark">
                <td className="text-start p-2 text-text-primary-default-light dark:text-text-primary-default-dark font-medium sticky start-0 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark">{row.student}</td>
                {assessmentKeys.map((key) => {
                  const score = row.scores[key];
                  return (
                    <td key={key} className={`text-center p-2 ${score !== undefined ? getScoreColor(score) : ""}`}>
                      {score !== undefined ? score : "-"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3 mt-4 text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark flex-wrap">
        <span className="font-medium">{t('chart.legend')}:</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/40 inline-block" /> 90-100</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-900/40 inline-block" /> 80-89</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-100 dark:bg-yellow-900/40 inline-block" /> 70-79</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-100 dark:bg-orange-900/40 inline-block" /> 60-69</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/40 inline-block" /> &lt;60</span>
      </div>
    </ChartCard>
  );
}
