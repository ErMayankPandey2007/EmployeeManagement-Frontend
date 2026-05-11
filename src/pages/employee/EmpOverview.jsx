import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RiTaskLine, RiCheckboxCircleLine, RiTimeLine, RiPlayLine, RiArrowRightLine, RiStarFill } from "react-icons/ri";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
const HC = HighchartsReact.default ?? HighchartsReact;
import { getStorage } from "../../utils/mockData";
import { useApp } from "../../context/AppContext";

export default function EmpOverview() {
  const { currentUser } = useApp();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    setTasks(getStorage("apex_tasks", []).filter((t) => t.employeeId === currentUser?.id));
  }, [currentUser]);

  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === "Pending").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const donutOptions = {
    chart: { type: "pie", backgroundColor: "transparent", height: 200 },
    title: { text: null },
    tooltip: { pointFormat: "<b>{point.y}</b> ({point.percentage:.0f}%)" },
    plotOptions: { pie: { innerSize: "65%", dataLabels: { enabled: false } } },
    series: [{ name: "Tasks", colorByPoint: true, data: [
      { name: "Completed", y: completed || 0, color: "#10b981" },
      { name: "In Progress", y: inProgress || 0, color: "#3b82f6" },
      { name: "Pending", y: pending || 0, color: "#f59e0b" }
    ]}],
    credits: { enabled: false }, legend: { enabled: false }
  };

  const stats = [
    { label: "Assigned", value: total, icon: RiTaskLine, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
    { label: "Pending", value: pending, icon: RiTimeLine, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "In Progress", value: inProgress, icon: RiPlayLine, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Completed", value: completed, icon: RiCheckboxCircleLine, color: "text-emerald-500", bg: "bg-emerald-500/10" }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[var(--primary)]/15 to-[var(--secondary)]/5 border border-[var(--border-base)] rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-black text-[var(--text-base)]">Hello, {currentUser?.name?.split(" ")[0]}! 👋</h1>
          <p className="text-sm text-[var(--text-base)] opacity-55 mt-1 max-w-lg">Here's your workspace overview. Keep your tasks updated and submit daily reports on time.</p>
          <div className="flex items-center gap-2 mt-3">
            <RiStarFill className="text-amber-500" />
            <span className="text-sm font-black text-amber-500">{currentUser?.rating?.toFixed(1)}</span>
            <span className="text-xs text-[var(--text-base)] opacity-50 font-semibold">Performance Rating</span>
          </div>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 hidden md:block">
          <RiStarFill className="text-[120px] text-[var(--primary)]" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl p-5 flex items-center justify-between hover:shadow-xl transition-all group`}>
            <div>
              <p className="text-xs font-bold text-[var(--text-base)] opacity-50 uppercase tracking-wider">{label}</p>
              <p className={`text-3xl font-black mt-1 ${color}`}>{value}</p>
            </div>
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center ${color} group-hover:scale-110 transition-all`}>
              <Icon className="text-xl" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Active Tasks */}
        <div className="lg:col-span-2 bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[var(--border-base)]">
            <h3 className="text-sm font-black text-[var(--text-base)] uppercase tracking-wider opacity-70">Active Tasks</h3>
            <Link to="/dashboard/tasks" className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1">View All <RiArrowRightLine /></Link>
          </div>
          <div className="p-4 space-y-3">
            {tasks.filter((t) => t.status !== "Completed").length === 0 ? (
              <p className="py-8 text-center text-xs text-[var(--text-base)] opacity-40 font-semibold">All tasks completed! Great work 🎉</p>
            ) : tasks.filter((t) => t.status !== "Completed").slice(0, 4).map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3.5 bg-[var(--bg-base)]/40 rounded-xl border border-[var(--border-base)]/50">
                <div className="overflow-hidden">
                  <p className="font-bold text-sm text-[var(--text-base)] truncate">{t.name}</p>
                  <p className="text-[10px] text-[var(--text-base)] opacity-40 font-semibold mt-0.5">📅 {t.deadline} · <span className={t.priority === "High" ? "text-rose-400" : t.priority === "Medium" ? "text-amber-400" : "text-emerald-400"}>{t.priority}</span></p>
                </div>
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shrink-0 ml-3 ${t.status === "In Progress" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"}`}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut */}
        <div className="bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl p-5 flex flex-col">
          <h3 className="text-sm font-black text-[var(--text-base)] uppercase tracking-wider opacity-70 mb-2">My Progress</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative">
              <HC highcharts={Highcharts} options={donutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-[var(--text-base)]">{rate}%</span>
                <span className="text-[10px] font-bold text-[var(--text-base)] opacity-40 uppercase">Done</span>
              </div>
            </div>
          </div>
          <div className="border-t border-[var(--border-base)]/50 pt-4 mt-2 space-y-2 text-xs font-bold">
            {[["#10b981", "Completed", completed], ["#3b82f6", "In Progress", inProgress], ["#f59e0b", "Pending", pending]].map(([c, l, v]) => (
              <div key={l} className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-[var(--text-base)] opacity-60"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />{l}</span>
                <span className="text-[var(--text-base)]">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
