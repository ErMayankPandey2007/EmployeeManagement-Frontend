import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
const HC = HighchartsReact.default ?? HighchartsReact;
import { api } from "../../utils/api";
import { useApp } from "../../context/AppContext";
import { RiStarFill } from "react-icons/ri";

export default function EmpAnalytics() {
  const { currentUser } = useApp();
  const [tasks, setTasks]     = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.getTasks().then(setTasks).catch(() => {});
    api.getReports().then(setReports).catch(() => {});
  }, []);

  const total      = tasks.length;
  const completed  = tasks.filter((t) => t.status === "Completed").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const pending    = tasks.filter((t) => t.status === "Pending").length;
  const rate       = total > 0 ? Math.round((completed / total) * 100) : 0;

  const donutOptions = {
    chart: { type: "pie", backgroundColor: "transparent", height: 260 },
    title: { text: "My Task Status", style: { color: "var(--text-base)", fontSize: "13px", fontWeight: "800" } },
    tooltip: { pointFormat: "<b>{point.y}</b> ({point.percentage:.1f}%)" },
    plotOptions: { pie: { innerSize: "60%", dataLabels: { enabled: true, format: "{point.name}: {point.y}", style: { color: "var(--text-base)", fontSize: "11px", fontWeight: "600", textOutline: "none" } } } },
    series: [{ name: "Tasks", colorByPoint: true, data: [
      { name: "Completed",  y: completed  || 0, color: "#10b981" },
      { name: "In Progress",y: inProgress || 0, color: "#3b82f6" },
      { name: "Pending",    y: pending    || 0, color: "#f59e0b" },
    ]}],
    credits: { enabled: false },
  };

  const hoursOptions = {
    chart: { type: "column", backgroundColor: "transparent", height: 260 },
    title: { text: "Hours Logged per Report", style: { color: "var(--text-base)", fontSize: "13px", fontWeight: "800" } },
    xAxis: { categories: reports.map((r) => r.date), labels: { style: { color: "var(--text-base)", fontSize: "10px" } }, lineColor: "var(--border-base)" },
    yAxis: { title: { text: null }, gridLineColor: "var(--border-base)", labels: { style: { color: "var(--text-base)" } } },
    tooltip: { backgroundColor: "var(--card-base)", style: { color: "var(--text-base)" }, borderColor: "var(--border-base)", valueSuffix: " hrs" },
    plotOptions: { column: { borderRadius: 6, dataLabels: { enabled: true, style: { color: "var(--text-base)", textOutline: "none", fontSize: "10px" } } } },
    series: [{ name: "Hours", data: reports.map((r) => r.hours), color: "var(--primary)" }],
    credits: { enabled: false }, legend: { enabled: false },
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-black text-[var(--text-base)]">My Analytics</h1>
        <p className="text-sm text-[var(--text-base)] opacity-50 mt-0.5">Your personal productivity metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks",     value: total,                          color: "text-[var(--primary)]" },
          { label: "Completion Rate", value: `${rate}%`,                     color: "text-emerald-500" },
          { label: "Reports Filed",   value: reports.length,                 color: "text-blue-500" },
          { label: "My Rating",       value: currentUser?.rating?.toFixed(1),color: "text-amber-500", icon: true },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl p-5 text-center">
            <p className="text-xs font-bold text-[var(--text-base)] opacity-50 uppercase tracking-wider">{label}</p>
            <p className={`text-3xl font-black mt-2 ${color} flex items-center justify-center gap-1`}>
              {icon && <RiStarFill className="text-2xl" />}{value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl p-5">
          <HC highcharts={Highcharts} options={donutOptions} />
        </div>
        <div className="bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl p-5">
          {reports.length > 0
            ? <HC highcharts={Highcharts} options={hoursOptions} />
            : <div className="h-full flex items-center justify-center"><p className="text-xs text-[var(--text-base)] opacity-40 font-semibold">Submit reports to see hours chart</p></div>
          }
        </div>
      </div>
    </div>
  );
}
