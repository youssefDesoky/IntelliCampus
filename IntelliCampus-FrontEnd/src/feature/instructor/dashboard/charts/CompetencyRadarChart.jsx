import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { BrainIcon } from "../../../../components/ui/icons";
import { useTranslation } from "react-i18next";
import { ChartCard } from "../../../../components/charts";

const tooltipStyle = {
  backgroundColor: "var(--color-bg-surface-primary-default-light)",
  border: "1px solid var(--color-border-primary-default-light)",
  borderRadius: "8px",
  color: "var(--color-text-primary-default-light)",
};

export default function CompetencyRadarChart({ className = "", data = [], downloadUrl }) {
  const hasData = data.length > 0;
  const { t } = useTranslation('instructor');

  return (
    <ChartCard title={t('chart.competencyRadar')} icon={<BrainIcon size={20} />} className={className} downloadUrl={downloadUrl}
      chartType="radar" chartData={data} categoryField="skill" series={[{ field: "score", name: "Class Average" }]}>

      {hasData ? (
        <div dir="ltr">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={data}>
              <PolarGrid className="stroke-border-primary-default-light dark:stroke-border-primary-default-dark" />
              <PolarAngleAxis dataKey="skill" className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
              <Tooltip contentStyle={tooltipStyle} />
              <Radar name="Class Average" dataKey="score" stroke="var(--color-bg-fill-accent-default-light)" fill="var(--color-bg-fill-accent-default-light)" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[280px] text-text-tertiary-default-light dark:text-text-tertiary-default-dark text-sm">
          {t('chart.noCompetencyData')}
        </div>
      )}
    </ChartCard>
  );
}
