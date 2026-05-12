import React, { useState, useEffect } from "react";
import {
  Table, Thead, Tbody, Tr, Th, Td, Badge, IconButton,
  Tooltip, Box, HStack, Text, Select as CSelect,
} from "@chakra-ui/react";
import { RiAddLine, RiDeleteBin6Line, RiEditLine, RiSearchLine, RiFilterLine, RiCheckLine, RiCloseLine, RiTaskLine, RiArrowLeftLine, RiArrowRightLine } from "react-icons/ri";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { api } from "../../utils/api";

const STATUSES   = ["All", "Pending", "In Progress", "Completed"];
const PRIORITIES = ["Low", "Medium", "High"];
const PAGE_SIZE  = 8;

const priorityColor = { High: "red", Medium: "yellow", Low: "green" };
const statusColor   = { Completed: "green", "In Progress": "blue", Pending: "orange" };

// ── Outside component to prevent remount ──
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
    <div className="w-full max-w-lg bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl shadow-2xl animate-slideUp">
      <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-[var(--border-base)]">
        <h3 className="font-black text-sm text-[var(--text-base)]">{title}</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-base)] text-[var(--text-base)] opacity-60 hover:opacity-100 cursor-pointer">
          <RiCloseLine className="text-xl" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, fkey, type = "text", placeholder, form, errors, onChange }) => (
  <div>
    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-base)] opacity-50">{label}</label>
    <input type={type} placeholder={placeholder} value={form[fkey]}
      onChange={(e) => onChange(fkey, e.target.value)}
      className={`mt-1.5 w-full bg-[var(--bg-base)] border ${errors[fkey] ? "border-rose-500" : "border-[var(--border-base)]"} text-xs p-3 rounded-xl text-[var(--text-base)] outline-none focus:border-[var(--primary)] transition-all`} />
    {errors[fkey] && <p className="text-rose-400 text-[10px] mt-1 font-semibold">⚠ {errors[fkey]}</p>}
  </div>
);

const emptyForm = { name: "", description: "", employeeId: "", priority: "Medium", deadline: "", category: "General" };

export default function AdminTasks() {
  const [tasks, setTasks]               = useState([]);
  const [employees, setEmployees]       = useState([]);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [showModal, setShowModal]       = useState(false);
  const [editTask, setEditTask]         = useState(null);
  const [form, setForm]                 = useState(emptyForm);
  const [errors, setErrors]             = useState({});
  const [saving, setSaving]             = useState(false);
  const [page, setPage]                 = useState(1);

  useEffect(() => {
    api.getTasks().then(setTasks).catch(() => {});
    api.getEmployees().then(setEmployees).catch(() => {});
  }, []);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, statusFilter, assigneeFilter]);

  const handleFieldChange = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name       = "Task name is required";
    if (!form.employeeId)     e.employeeId = "Please assign to an employee";
    if (!form.deadline)       e.deadline   = "Deadline is required";
    else if (!editTask && new Date(form.deadline) < new Date()) e.deadline = "Deadline cannot be in the past";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreate = () => { setEditTask(null); setForm(emptyForm); setErrors({}); setShowModal(true); };
  const openEdit   = (task) => {
    setEditTask(task);
    setForm({ name: task.name, description: task.description, employeeId: task.employeeId, priority: task.priority, deadline: task.deadline, category: task.category || "General" });
    setErrors({});
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditTask(null); setForm(emptyForm); setErrors({}); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (editTask) {
        const updated = await api.updateTask(editTask.id, form);
        setTasks((prev) => prev.map((t) => t.id === editTask.id ? updated : t));
        toast.success("Task updated!");
      } else {
        const created = await api.createTask(form);
        setTasks((prev) => [created, ...prev]);
        toast.success("Task assigned!");
      }
      closeModal();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({ title: "Delete Task?", text: `"${name}" will be removed.`, icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", cancelButtonColor: "#6b7280", confirmButtonText: "Delete", background: "var(--card-base)", color: "var(--text-base)" });
    if (result.isConfirmed) {
      try { await api.deleteTask(id); setTasks((prev) => prev.filter((t) => t.id !== id)); toast.success("Task deleted."); }
      catch (err) { toast.error(err.message); }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await api.updateStatus(id, newStatus);
      setTasks((prev) => prev.map((t) => t.id === id ? updated : t));
      toast.success(`Status → "${newStatus}"`);
    } catch (err) { toast.error(err.message); }
  };

  const filtered = tasks.filter((t) => {
    const matchSearch   = t.name.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus   = statusFilter   === "All" || t.status     === statusFilter;
    const matchAssignee = assigneeFilter === "All" || t.employeeId === assigneeFilter;
    return matchSearch && matchStatus && matchAssignee;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-base)]">Tasks Board</h1>
          <p className="text-sm text-[var(--text-base)] opacity-50 mt-0.5">{filtered.length} tasks · Assign, track and manage</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-bold py-2.5 px-5 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] cursor-pointer transition-all text-sm">
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

      {/* Table */}
      <Box bg="var(--card-base)" border="1px solid var(--border-base)" borderRadius="xl" overflow="hidden">
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr borderBottom="1px solid var(--border-base)" bg="var(--bg-base)">
                {["Task", "Assigned To", "Category", "Priority", "Deadline", "Status", "Actions"].map((h) => (
                  <Th key={h} color="var(--text-base)" opacity={0.5} fontSize="10px" fontWeight="800"
                    letterSpacing="wider" textTransform="uppercase" borderColor="var(--border-base)" py={3}>
                    {h}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {paginated.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={16} borderColor="transparent">
                    <div className="flex flex-col items-center gap-2">
                      <RiTaskLine className="text-4xl text-[var(--text-base)] opacity-20" />
                      <Text fontSize="xs" color="var(--text-base)" opacity={0.4} fontWeight="700">No tasks found</Text>
                    </div>
                  </Td>
                </Tr>
              ) : paginated.map((task) => {
                const emp = employees.find((e) => e.id === task.employeeId);
                return (
                  <Tr key={task.id} _hover={{ bg: "var(--bg-base)" }} transition="background 0.15s" borderColor="var(--border-base)">
                    {/* Task */}
                    <Td borderColor="var(--border-base)" maxW="200px">
                      <Text fontSize="xs" fontWeight="800" color="var(--text-base)" noOfLines={1}>{task.name}</Text>
                      {task.description && (
                        <Text fontSize="10px" color="var(--text-base)" opacity={0.45} noOfLines={1} mt={0.5}>{task.description}</Text>
                      )}
                    </Td>
                    {/* Assigned To */}
                    <Td borderColor="var(--border-base)">
                      <HStack spacing={2}>
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${emp?.avatarColor || "from-gray-500 to-gray-600"} flex items-center justify-center font-black text-white text-[10px] uppercase shrink-0`}>
                          {task.employeeName?.charAt(0)}
                        </div>
                        <Text fontSize="xs" fontWeight="700" color="var(--text-base)">{task.employeeName || "—"}</Text>
                      </HStack>
                    </Td>
                    {/* Category */}
                    <Td borderColor="var(--border-base)">
                      <Text fontSize="xs" color="var(--text-base)" opacity={0.65}>{task.category || "—"}</Text>
                    </Td>
                    {/* Priority */}
                    <Td borderColor="var(--border-base)">
                      <Badge colorScheme={priorityColor[task.priority]} fontSize="9px" fontWeight="800"
                        borderRadius="md" px={2} py={0.5} textTransform="uppercase">
                        {task.priority}
                      </Badge>
                    </Td>
                    {/* Deadline */}
                    <Td borderColor="var(--border-base)">
                      <Text fontSize="xs" color="var(--text-base)" opacity={0.6}>📅 {task.deadline}</Text>
                    </Td>
                    {/* Status */}
                    <Td borderColor="var(--border-base)">
                      <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border-0 outline-none cursor-pointer ${
                          task.status === "Completed"  ? "bg-emerald-500/15 text-emerald-400" :
                          task.status === "In Progress"? "bg-blue-500/15 text-blue-400" :
                          "bg-amber-500/15 text-amber-400"
                        }`}>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </Td>
                    {/* Actions */}
                    <Td borderColor="var(--border-base)">
                      <HStack spacing={1}>
                        <Tooltip label="Edit" fontSize="xs">
                          <IconButton aria-label="Edit" icon={<RiEditLine />} size="xs" variant="ghost"
                            color="var(--primary)" _hover={{ bg: "var(--bg-base)" }} onClick={() => openEdit(task)} />
                        </Tooltip>
                        <Tooltip label="Delete" fontSize="xs">
                          <IconButton aria-label="Delete" icon={<RiDeleteBin6Line />} size="xs" variant="ghost"
                            color="#ef4444" _hover={{ bg: "var(--bg-base)" }} onClick={() => handleDelete(task.id, task.name)} />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border-base)]">
            <p className="text-[11px] text-[var(--text-base)] opacity-50 font-semibold">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-[var(--border-base)] text-[var(--text-base)] hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all">
                <RiArrowLeftLine className="text-sm" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    page === p
                      ? "bg-[var(--primary)] text-white"
                      : "border border-[var(--border-base)] text-[var(--text-base)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  }`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-[var(--border-base)] text-[var(--text-base)] hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all">
                <RiArrowRightLine className="text-sm" />
              </button>
            </div>
          </div>
        )}
      </Box>

      {/* Modal */}
      {showModal && (
        <Modal title={editTask ? "Edit Task" : "Assign New Task"} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <Field label="Task Name *"  fkey="name"        placeholder="e.g. Design landing page" form={form} errors={errors} onChange={handleFieldChange} />
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-base)] opacity-50">Description</label>
              <textarea placeholder="Describe the task..." value={form.description}
                onChange={(e) => handleFieldChange("description", e.target.value)} rows={3}
                className="mt-1.5 w-full bg-[var(--bg-base)] border border-[var(--border-base)] text-xs p-3 rounded-xl text-[var(--text-base)] outline-none focus:border-[var(--primary)] transition-all resize-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-base)] opacity-50">Assign To *</label>
                <select value={form.employeeId} onChange={(e) => handleFieldChange("employeeId", e.target.value)}
                  className={`mt-1.5 w-full bg-[var(--bg-base)] border ${errors.employeeId ? "border-rose-500" : "border-[var(--border-base)]"} text-xs p-3 rounded-xl text-[var(--text-base)] outline-none cursor-pointer focus:border-[var(--primary)] transition-all`}>
                  <option value="">Select...</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                {errors.employeeId && <p className="text-rose-400 text-[10px] mt-1 font-semibold">⚠ {errors.employeeId}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-base)] opacity-50">Priority</label>
                <select value={form.priority} onChange={(e) => handleFieldChange("priority", e.target.value)}
                  className="mt-1.5 w-full bg-[var(--bg-base)] border border-[var(--border-base)] text-xs p-3 rounded-xl text-[var(--text-base)] outline-none cursor-pointer focus:border-[var(--primary)] transition-all">
                  {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-base)] opacity-50">Deadline *</label>
                <input type="date" value={form.deadline} onChange={(e) => handleFieldChange("deadline", e.target.value)}
                  className={`mt-1.5 w-full bg-[var(--bg-base)] border ${errors.deadline ? "border-rose-500" : "border-[var(--border-base)]"} text-xs p-3 rounded-xl text-[var(--text-base)] outline-none cursor-pointer focus:border-[var(--primary)] transition-all`} />
                {errors.deadline && <p className="text-rose-400 text-[10px] mt-1 font-semibold">⚠ {errors.deadline}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={closeModal}
                className="px-4 py-2.5 rounded-xl border border-[var(--border-base)] text-xs font-bold text-[var(--text-base)] hover:bg-[var(--bg-base)] cursor-pointer transition-all">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white text-xs font-bold hover:brightness-110 cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-60">
                <RiCheckLine /> {editTask ? "Update Task" : "Assign Task"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
