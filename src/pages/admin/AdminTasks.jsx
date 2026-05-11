import React, { useState, useEffect } from "react";
import { RiAddLine, RiDeleteBin6Line, RiSearchLine, RiFilterLine, RiEditLine, RiCheckLine, RiCloseLine, RiTaskLine } from "react-icons/ri";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { getStorage, setStorage } from "../../utils/mockData";

const STATUSES = ["All", "Pending", "In Progress", "Completed"];
const PRIORITIES = ["Low", "Medium", "High"];

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", employeeId: "", priority: "Medium", deadline: "", category: "General" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setTasks(getStorage("apex_tasks", []));
    setEmployees(getStorage("apex_employees", []).filter((e) => e.id !== "admin"));
  }, []);

  const saveTasks = (updated) => { setTasks(updated); setStorage("apex_tasks", updated); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Task name is required";
    if (!form.employeeId) e.employeeId = "Please assign to an employee";
    if (!form.deadline) e.deadline = "Deadline is required";
    else if (new Date(form.deadline) < new Date()) e.deadline = "Deadline cannot be in the past";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreate = () => {
    setEditTask(null);
    setForm({ name: "", description: "", employeeId: "", priority: "Medium", deadline: "", category: "General" });
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({ name: task.name, description: task.description, employeeId: task.employeeId, priority: task.priority, deadline: task.deadline, category: task.category || "General" });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const emp = employees.find((em) => em.id === form.employeeId);
    if (editTask) {
      const updated = tasks.map((t) => t.id === editTask.id ? { ...t, ...form, employeeName: emp?.name || "" } : t);
      saveTasks(updated);
      toast.success("Task updated successfully!");
    } else {
      const newTask = { id: "task_" + Date.now(), ...form, employeeName: emp?.name || "", status: "Pending", createdAt: new Date().toISOString().split("T")[0] };
      const updated = [newTask, ...tasks];
      saveTasks(updated);
      const notifs = getStorage("apex_notifications", []);
      setStorage("apex_notifications", [{ id: "notif_" + Date.now(), content: `New task assigned: "${form.name}". Deadline: ${form.deadline}`, date: new Date().toISOString(), read: false, employeeId: form.employeeId }, ...notifs]);
      toast.success("Task assigned successfully!");
    }
    setShowModal(false);
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({ title: "Delete Task?", text: `"${name}" will be permanently removed.`, icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", cancelButtonColor: "var(--border-base)", confirmButtonText: "Yes, Delete", background: "var(--card-base)", color: "var(--text-base)" });
    if (result.isConfirmed) {
      saveTasks(tasks.filter((t) => t.id !== id));
      toast.success("Task deleted.");
    }
  };

  const handleStatusChange = (id, newStatus) => {
    saveTasks(tasks.map((t) => t.id === id ? { ...t, status: newStatus } : t));
    toast.success(`Status updated to "${newStatus}"`);
  };

  const filtered = tasks.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    const matchAssignee = assigneeFilter === "All" || t.employeeId === assigneeFilter;
    return matchSearch && matchStatus && matchAssignee;
  });

  const priorityStyle = { High: "bg-rose-500/10 text-rose-400", Medium: "bg-amber-500/10 text-amber-400", Low: "bg-emerald-500/10 text-emerald-400" };
  const statusStyle = { Completed: "bg-emerald-500/10 text-emerald-400", "In Progress": "bg-blue-500/10 text-blue-400", Pending: "bg-amber-500/10 text-amber-400" };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-base)]">Tasks Board</h1>
          <p className="text-sm text-[var(--text-base)] opacity-50 mt-0.5">{filtered.length} tasks · Assign, track and manage</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-bold py-2.5 px-5 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] cursor-pointer transition-all text-sm">
          <RiAddLine className="text-lg" /> Assign Task
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-base)] opacity-40" />
          <input type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] text-xs py-2.5 pl-9 pr-4 rounded-xl text-[var(--text-base)] outline-none focus:border-[var(--primary)] transition-all" />
        </div>
        <div className="flex items-center gap-2">
          <RiFilterLine className="text-[var(--text-base)] opacity-40 shrink-0" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] text-xs py-2.5 px-3 rounded-xl text-[var(--text-base)] outline-none cursor-pointer focus:border-[var(--primary)] transition-all">
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}
          className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] text-xs py-2.5 px-3 rounded-xl text-[var(--text-base)] outline-none cursor-pointer focus:border-[var(--primary)] transition-all">
          <option value="All">All Employees</option>
          {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      {/* Task Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl flex flex-col items-center text-center">
          <RiTaskLine className="text-5xl text-[var(--text-base)] opacity-20 mb-3" />
          <p className="font-bold text-sm text-[var(--text-base)] opacity-50">No tasks found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((task) => (
            <div key={task.id} className="bg-[var(--card-base)] border border-[var(--border-base)] hover:border-[var(--primary)]/30 rounded-2xl p-5 flex flex-col justify-between hover:shadow-xl transition-all group">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${priorityStyle[task.priority]}`}>{task.priority}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => openEdit(task)} className="p-1.5 rounded-lg hover:bg-[var(--primary)]/10 text-[var(--primary)] cursor-pointer transition-all"><RiEditLine /></button>
                    <button onClick={() => handleDelete(task.id, task.name)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 cursor-pointer transition-all"><RiDeleteBin6Line /></button>
                  </div>
                </div>
                <h3 className="font-bold text-sm text-[var(--text-base)] leading-snug">{task.name}</h3>
                <p className="text-xs text-[var(--text-base)] opacity-55 leading-relaxed line-clamp-2">{task.description}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border-base)]/50 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-md bg-gradient-to-tr ${employees.find((e) => e.id === task.employeeId)?.avatarColor || "from-gray-500 to-gray-600"} flex items-center justify-center text-white font-black text-[10px]`}>
                      {task.employeeName?.charAt(0)}
                    </div>
                    <span className="font-bold text-[var(--text-base)] opacity-70">{task.employeeName}</span>
                  </div>
                  <span className="text-[var(--text-base)] opacity-40 font-semibold">📅 {task.deadline}</span>
                </div>
                <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className={`w-full text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border-0 outline-none cursor-pointer ${statusStyle[task.status]}`}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl shadow-2xl p-6 animate-slideUp">
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border-base)] mb-5">
              <h3 className="font-black text-base text-[var(--text-base)]">{editTask ? "Edit Task" : "Assign New Task"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-[var(--bg-base)] text-[var(--text-base)] opacity-60 hover:opacity-100 cursor-pointer"><RiCloseLine className="text-xl" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-base)] opacity-50">Task Name *</label>
                <input type="text" placeholder="e.g. Design landing page" value={form.name} onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setErrors((p) => ({ ...p, name: "" })); }}
                  className={`mt-1.5 w-full bg-[var(--bg-base)] border ${errors.name ? "border-rose-500" : "border-[var(--border-base)]"} text-xs p-3 rounded-xl text-[var(--text-base)] outline-none focus:border-[var(--primary)] transition-all`} />
                {errors.name && <p className="text-rose-400 text-[10px] mt-1 font-semibold">⚠ {errors.name}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-base)] opacity-50">Description</label>
                <textarea placeholder="Describe the task..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3}
                  className="mt-1.5 w-full bg-[var(--bg-base)] border border-[var(--border-base)] text-xs p-3 rounded-xl text-[var(--text-base)] outline-none focus:border-[var(--primary)] transition-all resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-base)] opacity-50">Assign To *</label>
                  <select value={form.employeeId} onChange={(e) => { setForm((p) => ({ ...p, employeeId: e.target.value })); setErrors((p) => ({ ...p, employeeId: "" })); }}
                    className={`mt-1.5 w-full bg-[var(--bg-base)] border ${errors.employeeId ? "border-rose-500" : "border-[var(--border-base)]"} text-xs p-3 rounded-xl text-[var(--text-base)] outline-none cursor-pointer focus:border-[var(--primary)] transition-all`}>
                    <option value="">Select...</option>
                    {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                  {errors.employeeId && <p className="text-rose-400 text-[10px] mt-1 font-semibold">⚠ {errors.employeeId}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-base)] opacity-50">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                    className="mt-1.5 w-full bg-[var(--bg-base)] border border-[var(--border-base)] text-xs p-3 rounded-xl text-[var(--text-base)] outline-none cursor-pointer focus:border-[var(--primary)] transition-all">
                    {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-base)] opacity-50">Deadline *</label>
                  <input type="date" value={form.deadline} onChange={(e) => { setForm((p) => ({ ...p, deadline: e.target.value })); setErrors((p) => ({ ...p, deadline: "" })); }}
                    className={`mt-1.5 w-full bg-[var(--bg-base)] border ${errors.deadline ? "border-rose-500" : "border-[var(--border-base)]"} text-xs p-3 rounded-xl text-[var(--text-base)] outline-none cursor-pointer focus:border-[var(--primary)] transition-all`} />
                  {errors.deadline && <p className="text-rose-400 text-[10px] mt-1 font-semibold">⚠ {errors.deadline}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl border border-[var(--border-base)] text-xs font-bold text-[var(--text-base)] hover:bg-[var(--bg-base)] cursor-pointer transition-all">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white text-xs font-bold hover:brightness-110 cursor-pointer transition-all flex items-center gap-1.5">
                  <RiCheckLine /> {editTask ? "Update Task" : "Assign Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
