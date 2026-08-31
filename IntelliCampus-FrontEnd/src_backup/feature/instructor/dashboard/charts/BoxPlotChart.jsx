import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { ChartBarIcon } from "../../../../components/ui/icons";
import { ChartCard } from "../../../../components/charts";

const tooltipStyle = {
  backgroundColor: "var(--color-bg-surface-primary-default-light)",
  border: "1px solid var(--color-border-primary-default-light)",
  borderRadius: "8px",
  color: "var(--color-text-primary-default-light)",
};

const ACCENT = "var(--color-bg-fill-accent-default-light)";
const DANGER = "var(--color-bg-fill-danger-default-light)";
const SUCCESS = "var(--color-bg-fill-success-default-light)";
const WARNING = "var(--color-bg-fill-warning-default-light)";

function BoxPlotWhisker({ chartW, chartH, left, right, min, q1, median, q3, max, scale }) {
  const centerX = (left + right) / 2;
  const yMin = scale(min);
  const yQ1 = scale(q1);
  const yMed = scale(median);
  const yQ3 = scale(q3);
  const yMax = scale(max);

  return (
    <g>
      <line x1={centerX} y1={yMin} x2={centerX} y2={yMax} stroke={DANGER} strokeWidth={1.5} />
      <line x1={centerX - 6} y1={yMin} x2={centerX + 6} y2={yMin} stroke={DANGER} strokeWidth={2} />
      <line x1={centerX - 6} y1={yMax} x2={centerX + 6} y2={yMax} stroke={DANGER} strokeWidth={2} />
      <rect x={left + 4} y={yQ3} width={right - left - 8} height={yQ1 - yQ3} fill={ACCENT} opacity={0.7} stroke={ACCENT} strokeWidth={1.5} rx={2} />
      <line x1={left + 4} y1={yMed} x2={right - 4} y2={yMed} stroke={WARNING} strokeWidth={3} />
    </g>
  );
}

export default function BoxPlotChart({ className = "", data = [] }) {
  const { t } = useTranslation('instructor');
  const { svgWidth, height, padding, scale } = useMemo(() => {
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };
    return { svgWidth: 600, height: 280, padding, scale: null };
  }, []);

  if (!data || data.length === 0) {
    return (
      <ChartCard title={t('chart.scoreDistribution')} icon={<ChartBarIcon size={20} />} className={className}
        chartType="bar" chartData={data} categoryField="name" series={[{ field: "min", name: t('chart.min') }, { field: "q1", name: "Q1" }, { field: "median", name: t('chart.median') }, { field: "q3", name: "Q3" }, { field: "max", name: t('chart.max') }]}>
        <p className="text-center text-text-tertiary-default-light dark:text-text-tertiary-default-dark py-8">{t('chart.noData')}</p>
      </ChartCard>
    );
  }

  const allVals = data.flatMap((d) => [d.min, d.q1, d.median, d.q3, d.max]);
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const range = maxVal - minVal || 1;

  const chartW = svgWidth - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const bandW = chartW / data.length;
  const scaleY = (v) => padding.top + chartH - ((v - minVal) / range) * chartH;

  const yTicks = [];
  const tickCount = 5;
  for (let i = 0; i <= tickCount; i++) {
    yTicks.push(minVal + (range * i) / tickCount);
  }

  return (
    <ChartCard title={t('chart.scoreDistribution')} icon={<ChartBarIcon size={20} />} className={className}
      chartType="bar" chartData={data} categoryField="name" series={[{ field: "min", name: t('chart.min') }, { field: "q1", name: "Q1" }, { field: "median", name: t('chart.median') }, { field: "q3", name: "Q3" }, { field: "max", name: t('chart.max') }]}>

      <div className="w-full overflow-x-auto">
        <svg width="100%" height={height} viewBox={`0 0 ${svgWidth} ${height}`} className="text-text-primary-default-light dark:text-text-primary-default-dark">
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="var(--color-border-primary-default-light)" strokeWidth={1} />
          <line x1={padding.left} y1={height - padding.bottom} x2={svgWidth - padding.right} y2={height - padding.bottom} stroke="var(--color-border-primary-default-light)" strokeWidth={1} />
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line x1={padding.left - 4} y1={scaleY(tick)} x2={padding.left} y2={scaleY(tick)} stroke="var(--color-border-primary-default-light)" strokeWidth={1} />
              <line x1={padding.left} y1={scaleY(tick)} x2={svgWidth - padding.right} y2={scaleY(tick)} stroke="var(--color-border-primary-default-light)" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.4} />
              <text x={padding.left - 8} y={scaleY(tick) + 4} textAnchor="end" className="text-xs fill-text-tertiary-default-light dark:fill-text-tertiary-default-dark">{Math.round(tick)}</text>
            </g>
          ))}
          {data.map((d, i) => {
            const left = padding.left + i * bandW;
            const right = padding.left + (i + 1) * bandW;
            return (
              <g key={i}>
                <BoxPlotWhisker
                  chartW={chartW}
                  chartH={chartH}
                  left={left}
                  right={right}
                  min={d.min}
                  q1={d.q1}
                  median={d.median}
                  q3={d.q3}
                  max={d.max}
                  scale={scaleY}
                />
                <text x={(left + right) / 2} y={height - padding.bottom + 16} textAnchor="middle" className="text-xs fill-text-tertiary-default-light dark:fill-text-tertiary-default-dark">{d.name}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex items-center gap-4 mt-2 text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark flex-wrap">
        <span className="font-medium">Key:</span>
        <span className="flex items-center gap-1"><span className="w-4 h-3 rounded" style={{ backgroundColor: ACCENT, opacity: 0.7 }} /> IQR (Q1-Q3)</span>
        <span className="flex items-center gap-1"><span className="w-4 h-0.5 inline-block" style={{ backgroundColor: WARNING }} /> Median</span>
        <span className="flex items-center gap-1"><span className="w-4 h-0.5 inline-block" style={{ backgroundColor: DANGER }} /> Min/Max</span>
      </div>
    </ChartCard>
  );
}
