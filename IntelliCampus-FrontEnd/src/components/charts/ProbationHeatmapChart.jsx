import { TableIcon } from "../ui/icons";
import ChartCard from "./ChartCard";

function getProbationColor(rate) {
  if (rate === 0) return "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100";
  if (rate < 10) return "bg-yellow-300 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-200";
  if (rate < 25) return "bg-orange-300 dark:bg-orange-900/40 text-orange-900 dark:text-orange-200";
  if (rate < 50) return "bg-red-400 dark:bg-red-900/50 text-white dark:text-red-200";
  return "bg-red-600 dark:bg-red-700/60 text-white dark:text-white";
}

export default function ProbationHeatmapChart({ className = "", data = [], t }) {
  if (!data || data.length === 0) {
    return (
      <ChartCard title={t('dashboard.probationHeatmap')} subtitle={t('dashboard.probationHeatmapSubtitle')} icon={<TableIcon size={20} />} className={className}
        chartType="bar" chartData={[]} categoryField="department" series={[{ field: "probationRate", name: t('dashboard.heatmapProbationRate') }]}>
        <p className="text-center text-text-tertiary-default-light dark:text-text-tertiary-default-dark py-8">{t('dashboard.noData')}</p>
      </ChartCard>
    );
  }

  const departments = [...new Set(data.map(d => d.department))];
  const levels = [...new Set(data.map(d => d.level))].sort((a, b) => a - b);

  const getCell = (dept, level) => data.find(d => d.department === dept && d.level === level);

  const chartData = data.map(d => ({ department: d.department, level: d.level, probationRate: d.probationRate }));
  const heatmapSeries = levels.map(l => ({ field: `L${l}`, name: `Level ${l}` }));

  return (
    <ChartCard title={t('dashboard.probationHeatmap')} subtitle={t('dashboard.probationHeatmapSubtitle')} icon={<TableIcon size={20} />} className={className}
      chartType="bar" chartData={chartData} categoryField="department" series={heatmapSeries}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-start p-2 text-text-tertiary-default-light dark:text-text-tertiary-default-dark font-medium sticky start-0 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark z-10">
                {t('dashboard.departments')}
              </th>
              {levels.map(l => (
                <th key={l} className="text-center p-2 text-text-tertiary-default-light dark:text-text-tertiary-default-dark font-medium min-w-[100px]">
                  {t('dashboard.level')} {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {departments.map(dept => (
              <tr key={dept} className="border-t border-border-primary-default-light dark:border-border-primary-default-dark">
                <td className="text-start p-2 text-text-primary-default-light dark:text-text-primary-default-dark font-medium sticky start-0 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark">
                  {dept}
                </td>
                {levels.map(l => {
                  const cell = getCell(dept, l);
                  const rate = cell ? cell.probationRate : 0;
                  const count = cell ? `${cell.probationCount}/${cell.totalStudents}` : '-';
                  return (
                    <td key={l} className={`text-center p-2 ${getProbationColor(rate)}`} title={`${dept} L${l}: ${count} (${rate.toFixed(1)}%)`}>
                      <span className="tabular-nums font-bold">{rate.toFixed(0)}%</span>
                      <span className="block text-[10px] font-medium">{count}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3 mt-4 text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark flex-wrap">
        <span className="font-medium">{t('dashboard.legend')}:</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-800 inline-block" /> 0%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-300 dark:bg-yellow-900/40 inline-block" /> &lt;10%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-300 dark:bg-orange-900/40 inline-block" /> &lt;25%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 dark:bg-red-900/50 inline-block" /> &lt;50%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-600 dark:bg-red-700/60 inline-block" /> ≥50%</span>
      </div>
    </ChartCard>
  );
}