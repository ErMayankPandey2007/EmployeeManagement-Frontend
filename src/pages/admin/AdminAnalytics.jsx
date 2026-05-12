import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
const HC = HighchartsReact.default ?? HighchartsReact;
import { api } from "../../utils/api";

export default function AdminAnalytics() {
  const [tasks, setTasks]         = useState([]);
  const [employees, setEmployees] = useState([]);
  const [reports, setReports]     = useState([]);

  useEffect(() => {
    api.getTasks().then(setTasks).catch(() => {});
    api.getEmployees().then((all) => setEmployees(all.filter((e) => e.role !== "Admin"))).catch(() => {});
    api.getReports().then(setReports).catch(() => {});
  }, []);

  const total      = tasks.length;
  const completed  = tasks.filter((t) => t.status === "Completed").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const pending    = tasks.filter((t) => t.status === "Pending").length;

  const pieOptions = {
    chart: { type: "pie", backgroundColor: "transparent", height: 280 },
    title: { text: "Task Status Breakdown", style: { color: "var(--text-base)", fontSize: "13px", fontWeight: "800" } },
    tooltip: { pointFormat: "<b>{point.y}</b> ({point.percentage:.1f}%)" },
    plotOptions: { pie: { innerSize: "60%", dataLabels: { enabled: true, format: "{point.name}: {point.y}", style: { color: "var(--text-base)", fontSize: "11px", fontWeight: "600", textOutline: "none" } } } },
    series: [{ name: "Tasks", colorByPoint: true, data: [
      { name: "Completed",  y: completed  || 0, color: "#10b981" },
      { name: "In Progress",y: inProgress || 0, color: "#3b82f6" },
      { name: "Pending",    y: pending    || 0, color: "#f59e0b" },
    ]}],
    credits: { enabled: false },
  };

  const barOptions = {
    chart: { type: "bar", backgroundColor: "transparent", height: 280 },
    title: { text: "Tasks per Employee", style: { color: "var(--text-base)", fontSize: "13px", fontWeight: "800" } },
    xAxis: { categories: employees.map((e) => e.name.split(" ")[0]), labels: { style: { color: "var(--text-base)" } }, lineColor: "var(--border-base)" },
    yAxis: { title: { text: null }, gridLineColor: "var(--border-base)", labels: { style: { color: "var(--text-base)" } } },
    tooltip: { backgroundColor: "var(--card-base)", style: { color: "var(--text-base)" }, borderColor: "var(--border-base)" },
    plotOptions: { bar: { borderRadius: 5, dataLabels: { enabled: true, style: { color: "var(--text-base)", textOutline: "none" } } } },
    series: [
      { name: "Total", data: employees.map((e) => tasks.filter((t) => t.employeeId === e.id).length), color: "var(--primary)" },
      { name: "Done",  data: employees.map((e) => tasks.filter((t) => t.employeeId === e.id && t.status === "Completed").length), color: "#10b981" },
    ],
    credits: { enabled: false },
    legend: { itemStyle: { color: "var(--text-base)" } },
  };

  const dates = [...new Set(reports.map((r) => r.date))].sort();
  const lineOptions = {
    chart: { type: "line", backgroundColor: "transparent", height: 260 },
    title: { text: "Report Submissions Over Time", style: { color: "var(--text-base)", fontSize: "13px", fontWeight: "800" } },
    xAxis: { categories: dates, labels: { style: { color: "var(--text-base)", fontSize: "10px" } }, lineColor: "var(--border-base)" },
    yAxis: { title: { text: null }, gridLineColor: "var(--border-base)", labels: { style: { color: "var(--text-base)" } }, allowDecimals: false },
    tooltip: { backgroundColor: "var(--card-base)", style: { color: "var(--text-base)" }, borderColor: "var(--border-base)" },
    series: [{ name: "Reports", data: dates.map((d) => reports.filter((r) => r.date === d).length), color: "var(--secondary)", marker: { fillColor: "var(--secondary)", lineColor: "var(--secondary)" } }],
    credits: { enabled: false },
    legend: { itemStyle: { color: "var(--text-base)" } },
  };

  const ratingOptions = {
    chart: { type: "column", backgroundColor: "transparent", height: 260 },
    title: { text: "Employee Performance Ratings", style: { color: "var(--text-base)", fontSize: "13px", fontWeight: "800" } },
    xAxis: { categories: employees.map((e) => e.name.split(" ")[0]), labels: { style: { color: "var(--text-base)" } }, lineColor: "var(--border-base)" },
    yAxis: { title: { text: null }, min: 0, max: 5, gridLineColor: "var(--border-base)", labels: { style: { color: "var(--text-base)" } } },
    tooltip: { backgroundColor: "var(--card-base)", style: { color: "var(--text-base)" }, borderColor: "var(--border-base)", valueSuffix: " / 5" },
    plotOptions: { column: { borderRadius: 6, dataLabels: { enabled: true, format: "{y:.1f}", style: { color: "var(--text-base)", textOutline: "none", fontSize: "10px" } } } },
    series: [{ name: "Rating", data: employees.map((e) => e.rating || 0), color: "#f59e0b" }],
    credits: { enabled: false }, legend: { enabled: false },
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-black text-[var(--text-base)]">Analytics & Reports</h1>
        <p className="text-sm text-[var(--text-base)] opacity-50 mt-0.5">Organizational performance insights</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks",      value: total,      color: "text-[var(--primary)]" },
          { label: "Completion Rate",  value: `${total > 0 ? Math.round((completed / total) * 100) : 0}%`, color: "text-emerald-500" },
          { label: "Reports Filed",    value: reports.length, color: "text-blue-500" },
          { label: "Avg Rating",       value: employees.length > 0 ? (employees.reduce((s, e) => s + (e.rating || 0), 0) / employees.length).toFixed(1) : "—", color: "text-amber-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl p-5 text-center">
            <p className="text-xs font-bold text-[var(--text-base)] opacity-50 uppercase tracking-wider">{label}</p>
            <p className={`text-3xl font-black mt-2 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl p-5"><HC highcharts={Highcharts} options={pieOptions} /></div>
        <div className="bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl p-5"><HC highcharts={Highcharts} options={barOptions} /></div>
        <div className="bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl p-5"><HC highcharts={Highcharts} options={lineOptions} /></div>
        <div className="bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl p-5"><HC highcharts={Highcharts} options={ratingOptions} /></div>
      </div>
    </div>
  );
}
