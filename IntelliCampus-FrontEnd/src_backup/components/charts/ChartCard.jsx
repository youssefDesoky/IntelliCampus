import { DownloadIcon } from "../ui/icons";
import { downloadBlob } from "../../api/apiClient";
import downloadChartAsExcel from "../../utils/downloadChartAsExcel";

export default function ChartCard({
  title, subtitle, icon, children, className = "",
  downloadUrl, onTitleClick,
  chartType, chartData, categoryField, series,
}) {
  const handleDownload = async () => {
    if (chartData?.length && chartType && categoryField && series?.length) {
      try {
        await downloadChartAsExcel({ title, chartType, data: chartData, categoryField, series });
      } catch (err) {
        console.error("Failed to download chart as Excel:", err);
      }
    } else if (downloadUrl) {
      downloadBlob(downloadUrl, title.replace(/\s+/g, "_"));
    }
  };

  const showDownload = (downloadUrl) || (chartData?.length && chartType && categoryField && series?.length);

  return (
    <div className={`p-6 h-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg outline-none ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <span className="text-icon-primary-default-light dark:text-icon-primary-default-dark shrink-0">{icon}</span>
          )}
          <div>
            <h3
              className={`text-lg font-bold text-text-primary-default-light dark:text-text-primary-default-dark${onTitleClick ? " hover:text-text-accent-default-light dark:hover:text-text-accent-default-dark transition-colors cursor-pointer" : ""}`}
              onClick={onTitleClick}
            >
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {showDownload && (
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-text-tertiary-default-light dark:text-text-tertiary-default-dark hover:text-text-accent-default-light dark:hover:text-text-accent-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark focus:outline-none transition-colors"
            title="Download chart"
          >
            <DownloadIcon size={18} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
