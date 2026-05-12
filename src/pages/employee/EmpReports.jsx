import React, { useState, useEffect } from "react";
import { RiSendPlaneLine, RiFileTextLine, RiMessageLine } from "react-icons/ri";
import toast from "react-hot-toast";
import { api } from "../../utils/api";

export default function EmpReports() {
  const [tasks, setTasks]     = useState([]);
  const [reports, setReports] = useState([]);
  const [form, setForm]       = useState({ taskId: "", hours: 8, summary: "" });
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    api.getTasks().then(setTasks).catch(() => {});
    api.getReports().then(setReports).catch(() => {});
  }, []);

  const validate = () => {
    const e = {};
    if (!form.taskId) e.taskId = "Please select a task";
    if (!form.summary.trim()) e.summary = "Summary is required";
    else if (form.summary.trim().length < 20) e.summary = "Summary must be at least 20 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const task = tasks.find((t) => t.id === form.taskId);
    setSaving(true);
    try {
      const newReport = await api.createReport({ taskId: form.taskId, taskName: task?.name || "Work", hours: form.hours, summary: form.summary });
      setReports((prev) => [newReport, ...prev]);
      toast.success("Daily report submitted successfully!");
      setForm({ taskId: "", hours: 8, summary: "" });
      setErrors({});
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const statusStyle = { Approved: "bg-emerald-500/10 text-emerald-400", "Under Review": "bg-amber-500/10 text-amber-400", Reviewed: "bg-blue-500/10 text-blue-400" };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-black text-[var(--text-base)]">Daily Reports</h1>
        <p className="text-sm text-[var(--text-base)] opacity-50 mt-0.5">Submit your daily work log and track feedback</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl p-5 h-fit">
          <h2 className="font-black text-sm text-[var(--text-base)] flex items-center gap-2 mb-5">
            <RiFileTextLine className="text-[var(--primary)] text-lg" /> Submit Work Log
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-base)] opacity-50">Select Task *</label>
              <select value={form.taskId} onChange={(e) => { setForm((p) => ({ ...p, taskId: e.target.value })); setErrors((p) => ({ ...p, taskId: "" })); }}
                className={`mt-1.5 w-full bg-[var(--bg-base)] border ${errors.taskId ? "border-rose-500" : "border-[var(--border-base)]"} text-xs p-3 rounded-xl text-[var(--text-base)] outline-none cursor-pointer focus:border-[var(--primary)] transition-all`}>
                <option value="">Choose task...</option>
                {tasks.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.status})</option>)}
              </select>
              {errors.taskId && <p className="text-rose-400 text-[10px] mt-1 font-semibold">⚠ {errors.taskId}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-base)] opacity-50">Hours Spent</label>
                <span className="text-xs font-black text-[var(--primary)]">{form.hours}h</span>
              </div>
              <input type="range" min="1" max="12" value={form.hours} onChange={(e) => setForm((p) => ({ ...p, hours: parseInt(e.target.value) }))}
                className="mt-2 w-full accent-[var(--primary)] h-1.5 rounded-full cursor-pointer" />
              <div className="flex justify-between text-[10px] text-[var(--text-base)] opacity-30 font-bold mt-1"><span>1h</span><span>12h</span></div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-base)] opacity-50">Activity Summary *</label>
              <textarea placeholder="Describe what you accomplished today, any blockers, and next steps..." value={form.summary}
                onChange={(e) => { setForm((p) => ({ ...p, summary: e.target.value })); setErrors((p) => ({ ...p, summary: "" })); }} rows={5}
                className={`mt-1.5 w-full bg-[var(--bg-base)] border ${errors.summary ? "border-rose-500" : "border-[var(--border-base)]"} text-xs p-3 rounded-xl text-[var(--text-base)] outline-none focus:border-[var(--primary)] transition-all resize-none`} />
              {errors.summary && <p className="text-rose-400 text-[10px] mt-1 font-semibold">⚠ {errors.summary}</p>}
              <p className="text-[10px] text-[var(--text-base)] opacity-30 mt-1 font-semibold">{form.summary.length} chars (min 20)</p>
            </div>

            <button type="submit" disabled={saving}
              className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:brightness-110 active:scale-[0.98] disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg">
              <RiSendPlaneLine className="text-lg" /> Submit Report
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-black text-sm text-[var(--text-base)] uppercase tracking-wider opacity-70">My Submissions ({reports.length})</h2>
          {reports.length === 0 ? (
            <div className="py-16 bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl flex flex-col items-center text-center">
              <RiFileTextLine className="text-5xl text-[var(--text-base)] opacity-20 mb-3" />
              <p className="font-bold text-sm text-[var(--text-base)] opacity-50">No reports submitted yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {reports.map((rep) => (
                <div key={rep.id} className="bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl p-5 hover:border-[var(--primary)]/20 transition-all space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-black text-sm text-[var(--text-base)]">{rep.taskName}</h4>
                      <p className="text-[10px] text-[var(--text-base)] opacity-40 font-bold mt-0.5">{rep.date} · {rep.hours}h logged</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shrink-0 ${statusStyle[rep.status] || "bg-gray-500/10 text-gray-400"}`}>{rep.status}</span>
                  </div>
                  <p className="text-xs text-[var(--text-base)] opacity-65 leading-relaxed">{rep.summary}</p>
                  {rep.adminComment && (
                    <div className="bg-[var(--bg-base)]/50 p-3 rounded-xl border border-[var(--border-base)]/50 flex gap-2.5 items-start">
                      <RiMessageLine className="text-[var(--primary)] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-black uppercase opacity-40 mb-1">Admin Feedback</p>
                        <p className="text-xs text-[var(--text-base)] opacity-75 leading-relaxed">{rep.adminComment}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
