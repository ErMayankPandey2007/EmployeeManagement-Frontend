import React, { useState, useEffect } from "react";
import { RiUserAddLine, RiDeleteBin6Line, RiSearchLine, RiStarFill, RiMailLine, RiCalendarLine, RiCloseLine, RiCheckLine } from "react-icons/ri";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { getStorage, setStorage } from "../../utils/mockData";

const AVATAR_COLORS = ["from-blue-500 to-cyan-500", "from-pink-500 to-rose-500", "from-emerald-500 to-teal-500", "from-amber-500 to-orange-500", "from-purple-500 to-indigo-500", "from-red-500 to-pink-500"];

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", designation: "", department: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setEmployees(getStorage("apex_employees", []));
    setTasks(getStorage("apex_tasks", []));
  }, []);

  const saveEmployees = (updated) => { setEmployees(updated); setStorage("apex_employees", updated); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    else if (employees.some((emp) => emp.email === form.email)) e.email = "Email already exists";
    if (!form.password.trim()) e.password = "Password is required";
    else if (form.password.length < 4) e.password = "Minimum 4 characters";
    if (!form.designation.trim()) e.designation = "Designation is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const newEmp = {
      id: "emp_" + Date.now().toString().slice(-5),
      name: form.name, email: form.email, password: form.password,
      role: "Employee", designation: form.designation, department: form.department,
      rating: 5.0, bio: "New team member.", avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      joinDate: new Date().toISOString().split("T")[0]
    };
    saveEmployees([...employees, newEmp]);
    const notifs = getStorage("apex_notifications", []);
    setStorage("apex_notifications", [{ id: "notif_" + Date.now(), content: `New member onboarded: ${form.name} (${form.designation})`, date: new Date().toISOString(), read: false }, ...notifs]);
    toast.success(`${form.name} onboarded successfully!`);
    setForm({ name: "", email: "", password: "", designation: "", department: "" });
    setShowModal(false);
  };

  const handleDelete = async (id, name) => {
    if (id === "admin") return toast.error("Cannot remove the administrator.");
    const result = await Swal.fire({ title: "Remove Employee?", text: `${name} will be permanently removed.`, icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", cancelButtonColor: "var(--border-base)", confirmButtonText: "Remove", background: "var(--card-base)", color: "var(--text-base)" });
    if (result.isConfirmed) {
      saveEmployees(employees.filter((e) => e.id !== id));
      toast.success(`${name} removed.`);
    }
  };

  const handleRating = (id, val) => {
    const parsed = parseFloat(val);
    if (isNaN(parsed) || parsed < 1 || parsed > 5) return;
    saveEmployees(employees.map((e) => e.id === id ? { ...e, rating: parsed } : e));
  };

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.designation || e.role).toLowerCase().includes(search.toLowerCase()) ||
    (e.department || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-base)]">Employee Directory</h1>
          <p className="text-sm text-[var(--text-base)] opacity-50 mt-0.5">{employees.length} members · Manage your team</p>
        </div>
        <button onClick={() => { setShowModal(true); setErrors({}); }} className="flex items-center gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-bold py-2.5 px-5 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] cursor-pointer transition-all text-sm">
          <RiUserAddLine className="text-lg" /> Onboard Member
        </button>
      </div>

      <div className="relative max-w-sm">
        <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-base)] opacity-40" />
        <input type="text" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[var(--card-base)] border border-[var(--border-base)] text-xs py-2.5 pl-9 pr-4 rounded-xl text-[var(--text-base)] outline-none focus:border-[var(--primary)] transition-all" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((emp) => {
          const empTasks = tasks.filter((t) => t.employeeId === emp.id);
          const done = empTasks.filter((t) => t.status === "Completed").length;
          return (
            <div key={emp.id} className="bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl p-5 hover:shadow-xl hover:border-[var(--primary)]/20 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${emp.avatarColor} flex items-center justify-center font-black text-white text-lg uppercase shadow-lg`}>{emp.name.charAt(0)}</div>
                  <div>
                    <h3 className="font-black text-sm text-[var(--text-base)]">{emp.name}</h3>
                    <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider mt-0.5">{emp.designation || emp.role}</p>
                    {emp.department && <p className="text-[10px] text-[var(--text-base)] opacity-40 font-semibold">{emp.department}</p>}
                  </div>
                </div>
                {emp.id !== "admin" && (
                  <button onClick={() => handleDelete(emp.id, emp.name)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-rose-400 cursor-pointer transition-all">
                    <RiDeleteBin6Line />
                  </button>
                )}
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[var(--text-base)] opacity-50">
                  <RiMailLine className="shrink-0" /><span className="truncate">{emp.email}</span>
                </div>
                {emp.joinDate && (
                  <div className="flex items-center gap-2 text-[var(--text-base)] opacity-50">
                    <RiCalendarLine className="shrink-0" /><span>Joined {emp.joinDate}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border-base)]/50 grid grid-cols-3 gap-3 text-center text-xs font-bold">
                <div>
                  <p className="text-[10px] uppercase opacity-40 mb-1">Tasks</p>
                  <p className="text-[var(--text-base)]">{empTasks.length}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase opacity-40 mb-1">Done</p>
                  <p className="text-emerald-500">{done}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase opacity-40 mb-1">Rating</p>
                  {emp.id !== "admin" ? (
                    <div className="flex items-center justify-center gap-1">
                      <RiStarFill className="text-amber-500 text-xs" />
                      <input type="number" min="1" max="5" step="0.1" value={emp.rating?.toFixed(1)} onChange={(e) => handleRating(emp.id, e.target.value)}
                        className="w-12 bg-transparent border-b border-[var(--border-base)] text-amber-500 text-xs text-center outline-none focus:border-amber-500 transition-all" />
                    </div>
                  ) : (
                    <p className="text-amber-500 flex items-center justify-center gap-1"><RiStarFill className="text-xs" />{emp.rating?.toFixed(1)}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl shadow-2xl p-6 animate-slideUp">
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border-base)] mb-5">
              <h3 className="font-black text-base text-[var(--text-base)]">Onboard New Member</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-[var(--bg-base)] text-[var(--text-base)] opacity-60 hover:opacity-100 cursor-pointer"><RiCloseLine className="text-xl" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3.5">
              {[
                { key: "name", label: "Full Name", placeholder: "e.g. Kevin Sterling", type: "text" },
                { key: "email", label: "Email Address", placeholder: "e.g. kevin@apex.com", type: "email" },
                { key: "password", label: "Portal Password", placeholder: "Min. 4 characters", type: "password" },
                { key: "designation", label: "Designation / Role", placeholder: "e.g. Backend Developer", type: "text" },
                { key: "department", label: "Department (optional)", placeholder: "e.g. Engineering", type: "text" }
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-base)] opacity-50">{label}</label>
                  <input type={type} placeholder={placeholder} value={form[key]} onChange={(e) => { setForm((p) => ({ ...p, [key]: e.target.value })); setErrors((p) => ({ ...p, [key]: "" })); }}
                    className={`mt-1.5 w-full bg-[var(--bg-base)] border ${errors[key] ? "border-rose-500" : "border-[var(--border-base)]"} text-xs p-3 rounded-xl text-[var(--text-base)] outline-none focus:border-[var(--primary)] transition-all`} />
                  {errors[key] && <p className="text-rose-400 text-[10px] mt-1 font-semibold">⚠ {errors[key]}</p>}
                </div>
              ))}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl border border-[var(--border-base)] text-xs font-bold text-[var(--text-base)] hover:bg-[var(--bg-base)] cursor-pointer transition-all">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white text-xs font-bold hover:brightness-110 cursor-pointer transition-all flex items-center gap-1.5">
                  <RiCheckLine /> Onboard Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
