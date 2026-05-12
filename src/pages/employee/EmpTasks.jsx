import React, { useState, useEffect } from "react";
import { RiPlayLine, RiCheckLine, RiTimeLine, RiFileExcel2Line, RiFilePdfLine } from "react-icons/ri";
import toast from "react-hot-toast";
import { api } from "../../utils/api";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

const priorityStyle = { High: "bg-rose-500/10 text-rose-400", Medium: "bg-amber-500/10 text-amber-400", Low: "bg-emerald-500/10 text-emerald-400" };
const statusStyle   = { Completed: "bg-emerald-500/10 text-emerald-400", "In Progress": "bg-blue-500/10 text-blue-400", Pending: "bg-amber-500/10 text-amber-400" };

export default function EmpTasks() {
  const [tasks, setTasks]   = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => { api.getTasks().then(setTasks).catch(() => {}); }, []);

  const advance = async (task) => {
    const next = task.status === "Pending" ? "In Progress" : task.status === "In Progress" ? "Completed" : null;
    if (!next) return;
    try {
      const updated = await api.updateStatus(task.id, next);
      setTasks((prev) => prev.map((t) => t.id === task.id ? updated : t));
      toast.success(`Task marked as "${next}"`);
    } catch (err) { toast.error(err.message); }
  };

  const filtered = filter === "All" ? tasks : tasks.filter((t) => t.status === filter);

  const handleExportExcel = () => {
    const data = filtered.map(t => ({
      ID: t.id,
      Name: t.name,
      Description: t.description || "",
      Category: t.category || "General",
      Priority: t.priority,
      Deadline: t.deadline,
      Status: t.status
    }));
    exportToExcel(data, "My_Tasks");
  };

  const handleExportPDF = () => {
    const columns = ["Task", "Category", "Priority", "Deadline", "Status"];
    const data = filtered.map(t => [
      t.name,
      t.category || "General",
      t.priority,
      t.deadline,
      t.status
    ]);
    exportToPDF(columns, data, "My_Tasks", "My Tasks Board");
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-base)]">My Tasks</h1>
          <p className="text-sm text-[var(--text-base)] opacity-50 mt-0.5">{tasks.length} assigned · Keep your board updated</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button onClick={handleExportExcel}
            className="flex-1 md:flex-none items-center justify-center gap-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold py-2 px-4 rounded-xl hover:bg-emerald-500 hover:text-white cursor-pointer transition-all text-xs flex">
            <RiFileExcel2Line className="text-base" /> Excel
          </button>
          <button onClick={handleExportPDF}
            className="flex-1 md:flex-none items-center justify-center gap-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold py-2 px-4 rounded-xl hover:bg-rose-500 hover:text-white cursor-pointer transition-all text-xs flex">
            <RiFilePdfLine className="text-base" /> PDF
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["All", "Pending", "In Progress", "Completed"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${filter === s ? "bg-[var(--primary)] text-white shadow-lg" : "bg-[var(--card-base)] border border-[var(--border-base)] text-[var(--text-base)] opacity-60 hover:opacity-100"}`}>
            {s} {s === "All" ? `(${tasks.length})` : `(${tasks.filter((t) => t.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl flex flex-col items-center text-center">
          <RiTimeLine className="text-5xl text-[var(--text-base)] opacity-20 mb-3" />
          <p className="font-bold text-sm text-[var(--text-base)] opacity-50">No tasks in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((task) => (
            <div key={task.id} className="bg-[var(--card-base)] border border-[var(--border-base)] hover:border-[var(--primary)]/30 rounded-2xl p-5 flex flex-col justify-between hover:shadow-xl transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${priorityStyle[task.priority]}`}>{task.priority} Priority</span>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${statusStyle[task.status]}`}>{task.status}</span>
                </div>
                <h3 className="font-bold text-sm text-[var(--text-base)] leading-snug">{task.name}</h3>
                <p className="text-xs text-[var(--text-base)] opacity-55 leading-relaxed line-clamp-2">{task.description}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--border-base)]/50 flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold text-[var(--text-base)] opacity-40">📅 Deadline: {task.deadline}</span>
                {task.status !== "Completed" ? (
                  <button onClick={() => advance(task)}
                    className={`flex items-center gap-1.5 font-bold py-2 px-4 rounded-xl text-xs cursor-pointer transition-all shadow-md ${task.status === "Pending" ? "bg-amber-500 hover:brightness-110 text-white shadow-amber-500/20" : "bg-blue-500 hover:brightness-110 text-white shadow-blue-500/20"}`}>
                    {task.status === "Pending" ? <><RiPlayLine /> Start Task</> : <><RiCheckLine /> Mark Done</>}
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-500 text-xs font-black"><RiCheckLine /> Completed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
