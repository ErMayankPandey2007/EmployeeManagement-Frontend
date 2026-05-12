import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RiTaskLine, RiCheckboxCircleLine, RiTimeLine, RiArrowRightLine, RiBarChartLine } from "react-icons/ri";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
const HC = HighchartsReact.default ?? HighchartsReact;
import { api } from "../../utils/api";

export default function AdminOverview() {
  const [tasks, setTasks]         = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    api.getTasks().then(setTasks).catch(() => {});
    api.getEmployees().then(setEmployees).catch(() => {});
  }, []);

  const empList  = employees.filter((e) => e.role !== "Admin");
  const total      = tasks.length;
  const pending    = tasks.filter((t) => t.status === "Pending").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const completed  = tasks.filter((t) => t.status === "Completed").length;
  const rate       = total > 0 ? Math.round((completed / total) * 100) : 0;

  const donutOptions = {
    chart: { type: "pie", backgroundColor: "transparent", height: 220 },
    title: { text: null },
    tooltip: { pointFormat: "<b>{point.y}</b> tasks ({point.percentage:.0f}%)" },
    plotOptions: { pie: { innerSize: "65%", dataLabels: { enabled: false } } },
    series: [{ name: "Tasks", colorByPoint: true, data: [
      { name: "Completed",  y: completed  || 0, color: "#10b981" },
      { name: "In Progress",y: inProgress || 0, color: "#3b82f6" },
      { name: "Pending",    y: pending    || 0, color: "#f59e0b" },
    ]}],
    credits: { enabled: false }, legend: { enabled: false },
  };

  const barOptions = {
    chart: { type: "column", backgroundColor: "transparent", height: 220 },
    title: { text: null },
    xAxis: { categories: empList.map((e) => e.name.split(" ")[0]), labels: { style: { color: "var(--text-base)", fontSize: "11px" } }, lineColor: "var(--border-base)" },
    yAxis: { title: { text: null }, gridLineColor: "var(--border-base)", labels: { style: { color: "var(--text-base)" } } },
    tooltip: { backgroundColor: "var(--card-base)", style: { color: "var(--text-base)" }, borderColor: "var(--border-base)" },
    plotOptions: { column: { borderRadius: 6 } },
    series: [
      { name: "Assigned",  data: empList.map((e) => tasks.filter((t) => t.employeeId === e.id).length), color: "var(--primary)" },
      { name: "Completed", data: empList.map((e) => tasks.filter((t) => t.employeeId === e.id && t.status === "Completed").length), color: "#10b981" },
    ],
    credits: { enabled: false },
    legend: { itemStyle: { color: "var(--text-base)", fontSize: "11px" } },
  };

  const stats = [
    { label: "Total Tasks",  value: total,      icon: RiTaskLine,            color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10", border: "border-[var(--primary)]/20" },
    { label: "Pending",      value: pending,    icon: RiTimeLine,            color: "text-amber-500",        bg: "bg-amber-500/10",        border: "border-amber-500/20" },
    { label: "In Progress",  value: inProgress, icon: RiBarChartLine,        color: "text-blue-500",         bg: "bg-blue-500/10",         border: "border-blue-500/20" },
    { label: "Completed",    value: completed,  icon: RiCheckboxCircleLine,  color: "text-emerald-500",      bg: "bg-emerald-500/10",      border: "border-emerald-500/20" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-black text-[var(--text-base)]">Admin Dashboard</h1>
        <p className="text-sm text-[var(--text-base)] opacity-50 mt-0.5">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`bg-[var(--card-base)] border ${border} rounded-2xl p-5 flex items-center justify-between hover:shadow-xl transition-all group`}>
            <div>
              <p className="text-xs font-bold text-[var(--text-base)] opacity-50 uppercase tracking-wider">{label}</p>
              <p className={`text-3xl font-black mt-1 ${color}`}>{value}</p>
              {label === "Completed" && <p className="text-[10px] font-bold text-emerald-500 mt-1">{rate}% rate</p>}
            </div>
            <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center ${color} group-hover:scale-110 transition-all`}>
              <Icon className="text-2xl" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl p-5">
          <h3 className="text-sm font-black text-[var(--text-base)] uppercase tracking-wider opacity-70 mb-2">Task Distribution</h3>
          <div className="flex items-center gap-4 flex-wrap">
            <HC highcharts={Highcharts} options={donutOptions} />
            <div className="space-y-3 text-xs font-bold">
              {[["#10b981","Completed",completed],["#3b82f6","In Progress",inProgress],["#f59e0b","Pending",pending]].map(([color, label, val]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: color }} />
                  <span className="text-[var(--text-base)] opacity-60">{label}:</span>
                  <span className="text-[var(--text-base)] font-black">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl p-5">
          <h3 className="text-sm font-black text-[var(--text-base)] uppercase tracking-wider opacity-70 mb-2">Workload by Employee</h3>
          <HC highcharts={Highcharts} options={barOptions} />
        </div>
      </div>

      <div className="bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-base)]">
          <h3 className="text-sm font-black text-[var(--text-base)] uppercase tracking-wider opacity-70">Staff Status</h3>
          <Link to="/admin/employees" className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1">View All <RiArrowRightLine /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border-base)] text-[var(--text-base)] opacity-40 font-black uppercase tracking-wider">
                <th className="text-left p-4">Employee</th>
                <th className="text-center p-4">Tasks</th>
                <th className="text-center p-4">Done</th>
                <th className="text-center p-4">Rating</th>
                <th className="text-right p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-base)]/40">
              {empList.map((emp) => {
                const empTasks = tasks.filter((t) => t.employeeId === emp.id);
                const done = empTasks.filter((t) => t.status === "Completed").length;
                const busy = empTasks.some((t) => t.status === "In Progress");
                return (
                  <tr key={emp.id} className="hover:bg-[var(--bg-base)]/30 transition-all">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${emp.avatarColor} flex items-center justify-center font-black text-white uppercase text-xs`}>{emp.name.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-[var(--text-base)]">{emp.name}</p>
                          <p className="opacity-40 text-[10px] font-semibold">{emp.designation || emp.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center font-bold text-[var(--text-base)]">{empTasks.length}</td>
                    <td className="p-4 text-center font-bold text-emerald-500">{done}</td>
                    <td className="p-4 text-center font-bold text-amber-500">⭐ {emp.rating?.toFixed(1)}</td>
                    <td className="p-4 text-right">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${busy ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                        {busy ? "Busy" : "Available"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
