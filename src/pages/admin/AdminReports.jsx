import React, { useState, useEffect } from "react";
import { RiCheckboxCircleLine, RiCloseLine, RiMessageLine, RiFileTextLine } from "react-icons/ri";
import toast from "react-hot-toast";
import { getStorage, setStorage } from "../../utils/mockData";

const statusStyle = { Approved: "bg-emerald-500/10 text-emerald-400", "Under Review": "bg-amber-500/10 text-amber-400", Reviewed: "bg-blue-500/10 text-blue-400" };

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState("");

  useEffect(() => { setReports(getStorage("apex_reports", [])); }, []);

  const saveReports = (updated) => { setReports(updated); setStorage("apex_reports", updated); };

  const handleApprove = (id) => {
    const rep = reports.find((r) => r.id === id);
    const updated = reports.map((r) => r.id === id ? { ...r, status: "Approved", adminComment: comment || "Approved by Administrator." } : r);
    saveReports(updated);
    const notifs = getStorage("apex_notifications", []);
    setStorage("apex_notifications", [{ id: "notif_" + Date.now(), content: `Your report for "${rep.taskName}" was approved!`, date: new Date().toISOString(), read: false, employeeId: rep.employeeId }, ...notifs]);
    toast.success("Report approved!");
    setSelected(null); setComment("");
  };

  const handleComment = (id) => {
    if (!comment.trim()) return toast.error("Please write a comment first.");
    const updated = reports.map((r) => r.id === id ? { ...r, status: "Reviewed", adminComment: comment } : r);
    saveReports(updated);
    toast.success("Comment posted.");
    setSelected(null); setComment("");
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-black text-[var(--text-base)]">Daily Work Logs</h1>
        <p className="text-sm text-[var(--text-base)] opacity-50 mt-0.5">{reports.length} submissions · Review and approve</p>
      </div>

      <div className="bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border-base)] text-[var(--text-base)] opacity-40 font-black uppercase tracking-wider bg-[var(--bg-base)]/30">
                <th className="text-left p-4">Employee</th>
                <th className="text-left p-4">Task</th>
                <th className="text-center p-4">Hours</th>
                <th className="text-left p-4">Summary</th>
                <th className="text-center p-4">Date</th>
                <th className="text-center p-4">Status</th>
                <th className="text-right p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-base)]/40">
              {reports.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-xs text-[var(--text-base)] opacity-40 font-semibold">No reports submitted yet.</td></tr>
              ) : reports.map((rep) => (
                <tr key={rep.id} className="hover:bg-[var(--bg-base)]/30 transition-all">
                  <td className="p-4 font-bold text-[var(--text-base)] whitespace-nowrap">{rep.employeeName}</td>
                  <td className="p-4 font-semibold text-[var(--primary)] whitespace-nowrap max-w-[140px] truncate">{rep.taskName}</td>
                  <td className="p-4 text-center font-black text-[var(--text-base)]">{rep.hours}h</td>
                  <td className="p-4 max-w-[200px] truncate text-[var(--text-base)] opacity-60 font-medium">{rep.summary}</td>
                  <td className="p-4 text-center text-[var(--text-base)] opacity-50 font-semibold whitespace-nowrap">{rep.date}</td>
                  <td className="p-4 text-center">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${statusStyle[rep.status] || "bg-gray-500/10 text-gray-400"}`}>{rep.status}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => { setSelected(rep); setComment(rep.adminComment || ""); }}
                      className="bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] font-bold px-3 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer whitespace-nowrap">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl shadow-2xl p-6 animate-slideUp">
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border-base)] mb-5">
              <h3 className="font-black text-base text-[var(--text-base)] flex items-center gap-2"><RiFileTextLine className="text-[var(--primary)]" /> Review Work Log</h3>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-[var(--bg-base)] text-[var(--text-base)] opacity-60 hover:opacity-100 cursor-pointer"><RiCloseLine className="text-xl" /></button>
            </div>
            <div className="space-y-4 text-xs font-semibold">
              <div className="bg-[var(--bg-base)]/50 p-4 rounded-xl border border-[var(--border-base)]/50 space-y-2.5">
                {[["Employee", selected.employeeName], ["Task", selected.taskName], ["Hours Spent", `${selected.hours} hours`], ["Date", selected.date]].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-[var(--text-base)] opacity-50">{k}:</span>
                    <span className="font-bold text-[var(--text-base)]">{v}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-50 mb-2">Activity Summary</p>
                <p className="p-3.5 bg-[var(--bg-base)]/60 border border-[var(--border-base)]/60 rounded-xl leading-relaxed text-[var(--text-base)] opacity-80">{selected.summary}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-50 mb-2">Admin Feedback</p>
                <textarea placeholder="Write feedback or approval note..." value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
                  className="w-full bg-[var(--bg-base)]/60 border border-[var(--border-base)] text-xs p-3 rounded-xl text-[var(--text-base)] outline-none focus:border-[var(--primary)] transition-all resize-none" />
              </div>
              <div className="flex justify-between gap-3 pt-1">
                <button onClick={() => handleComment(selected.id)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--border-base)] text-xs font-bold text-[var(--text-base)] hover:bg-[var(--bg-base)] cursor-pointer transition-all">
                  <RiMessageLine /> Post Comment
                </button>
                <button onClick={() => handleApprove(selected.id)} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold hover:brightness-110 cursor-pointer transition-all shadow-lg">
                  <RiCheckboxCircleLine className="text-base" /> Approve Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
