import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RiUserAddLine, RiDeleteBin6Line, RiEditLine, RiEyeLine, RiSearchLine, RiCloseLine, RiCheckLine, RiStarFill, RiMailLine, RiCalendarLine, RiFileExcel2Line, RiFilePdfLine } from "react-icons/ri";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { api } from "../../utils/api";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

const DEPARTMENTS = ["Engineering", "Design", "Quality", "Marketing", "HR", "Finance", "Operations"];
const emptyForm   = { name: "", email: "", password: "", designation: "", department: "", loginAllowedFrom: "", loginAllowedUntil: "", firstLoginDeadline: "" };

// ── Moved OUTSIDE to prevent remount on every render ──
const Modal = ({ onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
    <div className="w-full max-w-md bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl shadow-2xl animate-slideUp max-h-[90vh] flex flex-col">
      {children}
    </div>
  </div>
);

const Field = ({ label, fkey, type = "text", placeholder, form, errors, onChange }) => (
  <div>
    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-base)] opacity-50">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={form[fkey]}
      onChange={(e) => onChange(fkey, e.target.value)}
      className={`mt-1.5 w-full bg-[var(--bg-base)] border ${errors[fkey] ? "border-rose-500" : "border-[var(--border-base)]"} text-xs p-3 rounded-xl text-[var(--text-base)] outline-none focus:border-[var(--primary)] transition-all`}
    />
    {errors[fkey] && <p className="text-rose-400 text-[10px] mt-1 font-semibold">⚠ {errors[fkey]}</p>}
  </div>
);

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks]         = useState([]);
  const [search, setSearch]       = useState("");
  const [form, setForm]           = useState(emptyForm);
  const [errors, setErrors]       = useState({});
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.getEmployees().then(setEmployees).catch(() => {});
    api.getTasks().then(setTasks).catch(() => {});
  }, []);

  const handleFieldChange = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name        = "Full name is required";
    if (!form.email.trim())       e.email       = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    
    // Password only required for creation
    if (!editId) {
      if (!form.password.trim())    e.password    = "Password is required";
      else if (form.password.length < 4) e.password = "Minimum 4 characters";
    } else {
      if (form.password && form.password.length < 4) e.password = "Minimum 4 characters";
    }

    if (!form.designation.trim()) e.designation = "Designation is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const closeForm = () => { setShowForm(false); setForm(emptyForm); setErrors({}); setEditId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (editId) {
        const updated = await api.updateEmployee(editId, form);
        setEmployees((prev) => prev.map(emp => emp.id === editId ? updated : emp));
        toast.success(`Updated ${form.name}!`);
      } else {
        const newEmp = await api.createEmployee(form);
        setEmployees((prev) => [...prev, newEmp]);
        toast.success(`${form.name} onboarded!`);
      }
      closeForm();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (emp) => {
    const toDateLocal = (d) => d ? new Date(new Date(d).getTime() - (new Date(d).getTimezoneOffset() * 60000)).toISOString().slice(0,16) : "";
    setEditId(emp.id);
    setForm({
      name:               emp.name || "",
      email:              emp.email || "",
      password:           "",
      designation:        emp.designation || "",
      department:         emp.department || "",
      loginAllowedFrom:   toDateLocal(emp.loginAllowedFrom),
      loginAllowedUntil:  toDateLocal(emp.loginAllowedUntil),
      firstLoginDeadline: toDateLocal(emp.firstLoginDeadline),
    });
    setErrors({});
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({ title: "Remove Employee?", text: `${name} will be permanently removed.`, icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", cancelButtonColor: "#6b7280", confirmButtonText: "Remove", background: "var(--card-base)", color: "var(--text-base)" });
    if (result.isConfirmed) {
      try {
        await api.deleteEmployee(id);
        setEmployees((prev) => prev.filter((e) => e.id !== id));
        toast.success(`${name} removed.`);
      } catch (err) { toast.error(err.message); }
    }
  };

  const handleRating = async (id, val) => {
    const parsed = parseFloat(val);
    if (isNaN(parsed) || parsed < 1 || parsed > 5) return;
    try {
      const updated = await api.updateRating(id, parsed);
      setEmployees((prev) => prev.map((e) => e.id === id ? updated : e));
    } catch {}
  };

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.designation || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.department  || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleExportExcel = () => {
    const data = filtered.map(e => ({
      ID: e.id,
      Name: e.name,
      Email: e.email,
      Designation: e.designation,
      Department: e.department,
      "Join Date": e.joinDate,
      Rating: e.rating?.toFixed(1) || "5.0",
      Status: e.isActive ? "Active" : "Inactive"
    }));
    exportToExcel(data, "Employees_Directory");
  };

  const handleExportPDF = () => {
    const columns = ["Name", "Email", "Designation", "Department", "Joined", "Status"];
    const data = filtered.map(e => [
      e.name,
      e.email,
      e.designation || "-",
      e.department || "-",
      e.joinDate || "-",
      e.isActive ? "Active" : "Inactive"
    ]);
    exportToPDF(columns, data, "Employees_Directory", "Employee Directory");
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-base)]">Employee Directory</h1>
          <p className="text-sm text-[var(--text-base)] opacity-50 mt-0.5">{filtered.length} members · Manage your team</p>
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
          <button onClick={() => { setEditId(null); setForm(emptyForm); setErrors({}); setShowForm(true); }}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-bold py-2.5 px-5 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] cursor-pointer transition-all text-sm">
            <RiUserAddLine className="text-lg" /> Onboard Member
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-base)] opacity-40" />
        <input type="text" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[var(--card-base)] border border-[var(--border-base)] text-xs py-2.5 pl-9 pr-4 rounded-xl text-[var(--text-base)] outline-none focus:border-[var(--primary)] transition-all" />
      </div>

      {/* Table */}
      <div className="bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border-base)]">
                {["Employee", "Designation", "Department", "Joined", "Rating", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--text-base)] opacity-50">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-[var(--text-base)] opacity-40 text-xs">No employees found</td></tr>
              ) : filtered.map((emp) => (
                <tr key={emp.id} className="border-b border-[var(--border-base)]/50 hover:bg-[var(--bg-base)]/60 transition-colors last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {emp.avatarUrl ? (
                        <img src={emp.avatarUrl} alt={emp.name} className="w-9 h-9 rounded-xl object-cover shadow shrink-0 border border-[var(--border-base)]" />
                      ) : (
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${emp.avatarColor} flex items-center justify-center font-black text-white text-sm uppercase shadow shrink-0`}>
                          {emp.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-black text-[var(--text-base)]">{emp.name}</p>
                        <p className="text-[10px] text-[var(--text-base)] opacity-45">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="font-bold text-[var(--primary)]">{emp.designation || "—"}</span></td>
                  <td className="px-4 py-3 text-[var(--text-base)] opacity-70">{emp.department || "—"}</td>
                  <td className="px-4 py-3 text-[var(--text-base)] opacity-60">{emp.joinDate || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <RiStarFill className="text-amber-500 text-xs" />
                      <input type="number" min="1" max="5" step="0.1" value={emp.rating?.toFixed(1)}
                        onChange={(e) => handleRating(emp.id, e.target.value)}
                        className="w-12 bg-transparent border-b border-[var(--border-base)] text-amber-500 text-xs text-center outline-none focus:border-amber-500 transition-all" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/admin/employees/${emp.id}`)} title="View Profile"
                        className="p-1.5 rounded-lg hover:bg-[var(--bg-base)] text-[var(--primary)] cursor-pointer transition-all">
                        <RiEyeLine className="text-base" />
                      </button>
                      <button onClick={() => handleEditClick(emp)} title="Edit"
                        className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-400 cursor-pointer transition-all">
                        <RiEditLine className="text-base" />
                      </button>
                      <button onClick={() => handleDelete(emp.id, emp.name)} title="Delete"
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 cursor-pointer transition-all">
                        <RiDeleteBin6Line className="text-base" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showForm && (
        <Modal onClose={closeForm}>
          <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-[var(--border-base)]">
            <h3 className="font-black text-sm text-[var(--text-base)]">{editId ? "Edit Member Details" : "Onboard New Member"}</h3>
            <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-[var(--bg-base)] text-[var(--text-base)] opacity-60 hover:opacity-100 cursor-pointer">
              <RiCloseLine className="text-xl" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto custom-scrollbar">
            <Field label="Full Name"       fkey="name"        placeholder="e.g. Kevin Sterling"    form={form} errors={errors} onChange={handleFieldChange} />
            <Field label="Email Address"   fkey="email"       type="email" placeholder="e.g. kevin@apex.com" form={form} errors={errors} onChange={handleFieldChange} />
            <Field label="Portal Password" fkey="password"    type="password" placeholder={editId ? "Leave blank to keep current" : "Min. 4 characters"} form={form} errors={errors} onChange={handleFieldChange} />
            <Field label="Designation"     fkey="designation" placeholder="e.g. Backend Developer" form={form} errors={errors} onChange={handleFieldChange} />
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-base)] opacity-50">Department</label>
              <select value={form.department} onChange={(e) => handleFieldChange("department", e.target.value)}
                className="mt-1.5 w-full bg-[var(--bg-base)] border border-[var(--border-base)] text-xs p-3 rounded-xl text-[var(--text-base)] outline-none focus:border-[var(--primary)] transition-all cursor-pointer">
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Login Restrictions Title */}
            <div className="pt-2 border-t border-[var(--border-base)]/50">
              <h4 className="text-[11px] font-black text-[var(--primary)] uppercase tracking-wider mb-2">Login Constraints</h4>
              <div className="grid grid-cols-1 gap-3">
                <Field label="Allowed Login From" type="datetime-local" fkey="loginAllowedFrom" form={form} errors={errors} onChange={handleFieldChange} />
                <Field label="Allowed Login Until" type="datetime-local" fkey="loginAllowedUntil" form={form} errors={errors} onChange={handleFieldChange} />

              </div>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={closeForm}
                className="px-4 py-2.5 rounded-xl border border-[var(--border-base)] text-xs font-bold text-[var(--text-base)] hover:bg-[var(--bg-base)] cursor-pointer transition-all">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white text-xs font-bold hover:brightness-110 cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-60">
                <RiCheckLine /> {editId ? "Save Changes" : "Onboard Member"}
              </button>
            </div>
          </form>
        </Modal>
      )}


    </div>
  );
}
