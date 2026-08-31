import { API_URL } from "../config/api";

export default async function downloadChartAsExcel({ title, chartType, data, categoryField, series }) {
  const endpoint = `${API_URL}/api/export/chart-to-excel`;

  const res = await fetch(endpoint, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, chartType, data, categoryField, series }),
  });

  if (!res.ok) throw new Error(`Chart export failed (${res.status})`);

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.replace(/\s+/g, "_")}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
