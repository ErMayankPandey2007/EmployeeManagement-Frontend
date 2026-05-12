import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RiArrowLeftLine, RiMailLine, RiCalendarLine, RiStarFill, RiCheckboxCircleLine, RiTimeLine, RiFileList3Line } from "react-icons/ri";
import toast from "react-hot-toast";
import { api } from "../../utils/api";

export default function AdminEmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empData = await api.getEmployee(id);
        const allTasks = await api.getTasks();
        const empTasks = allTasks.filter(t => t.employeeId === id);
        
        setEmployee(empData);
        setTasks(empTasks);
      } catch (err) {
        toast.error("Failed to load employee details.");
        navigate("/admin/employees");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const toggleStatus = async () => {
    try {
      const newStatus = !employee.isActive;
      const updated = await api.updateEmployeeStatus(id, newStatus);
      setEmployee(updated);
      toast.success(`Employee ${newStatus ? 'activated' : 'deactivated'} successfully.`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
          <p className="text-sm font-bold text-[var(--text-base)] opacity-50">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!employee) return null;

  const completedTasks = tasks.filter(t => t.status === "Completed");
  const pendingTasks = tasks.filter(t => t.status !== "Completed");

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header / Back */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/employees")} className="p-2 rounded-xl bg-[var(--card-base)] border border-[var(--border-base)] hover:bg-[var(--bg-base)] text-[var(--text-base)] cursor-pointer transition-all shadow-sm">
          <RiArrowLeftLine className="text-lg" />
        </button>
        <h1 className="text-2xl font-black text-[var(--text-base)]">Employee Profile</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-[var(--card-base)] border border-[var(--border-base)] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--primary)]/10 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 w-full md:w-auto">
          {employee.avatarUrl ? (
            <img src={employee.avatarUrl} alt={employee.name} className="w-28 h-28 rounded-3xl object-cover shadow-xl shrink-0 border-4 border-[var(--card-base)] ring-2 ring-[var(--border-base)]" />
          ) : (
            <div className={`w-28 h-28 rounded-3xl bg-gradient-to-tr ${employee.avatarColor} flex items-center justify-center font-black text-white text-4xl uppercase shadow-xl shrink-0 border-4 border-[var(--card-base)] ring-2 ring-[var(--border-base)]`}>
              {employee.name.charAt(0)}
            </div>
          )}
          
          <div className="text-center sm:text-left space-y-2">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-base)] tracking-tight">{employee.name}</h2>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${employee.isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                  {employee.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-[var(--primary)] font-bold text-sm mt-1">{employee.designation || "Employee"} <span className="text-[var(--text-base)] opacity-40 mx-1">•</span> {employee.department || "No Department"}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 text-xs font-semibold text-[var(--text-base)] opacity-70 mt-2">
              <div className="flex items-center gap-1.5"><RiMailLine className="text-[var(--primary)] opacity-80" /> {employee.email}</div>
              <div className="flex items-center gap-1.5"><RiCalendarLine className="text-[var(--primary)] opacity-80" /> Joined {employee.joinDate}</div>
              <div className="flex items-center gap-1.5"><RiStarFill className="text-amber-500 opacity-80" /> {employee.rating?.toFixed(1)} / 5.0</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full md:w-auto flex justify-center md:justify-end">
          <button 
            onClick={toggleStatus}
            className={`px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all cursor-pointer flex items-center gap-2 border ${
              employee.isActive 
              ? "bg-[var(--card-base)] border-rose-500/30 text-rose-500 hover:bg-rose-500/10" 
              : "bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] border-transparent text-white hover:brightness-110"
            }`}
          >
            {employee.isActive ? "Deactivate Account" : "Activate Account"}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Tasks", value: tasks.length, icon: RiFileList3Line, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Completed", value: completedTasks.length, icon: RiCheckboxCircleLine, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Pending/In Progress", value: pendingTasks.length, icon: RiTimeLine, color: "text-amber-500", bg: "bg-amber-500/10" }
        ].map((stat, i) => (
          <div key={i} className="bg-[var(--card-base)] border border-[var(--border-base)] p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${stat.bg} ${stat.color}`}>
              <stat.icon />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-[var(--text-base)] opacity-50">{stat.label}</p>
              <p className="text-2xl font-black text-[var(--text-base)]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Logs / Tasks List */}
      <div className="bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[var(--border-base)] flex items-center justify-between bg-[var(--bg-base)]/30">
          <div>
            <h3 className="font-black text-[var(--text-base)] text-lg">Activity & Task Logs</h3>
            <p className="text-xs text-[var(--text-base)] opacity-50 mt-0.5">A history of tasks assigned to {employee.name}</p>
          </div>
        </div>
        
        <div className="divide-y divide-[var(--border-base)] max-h-[500px] overflow-y-auto custom-scrollbar">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-base)] opacity-40 text-sm font-semibold">
              No tasks or activities recorded yet.
            </div>
          ) : (
            tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(task => (
              <div key={task.id} className="p-5 hover:bg-[var(--bg-base)]/50 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                      task.status === 'Completed' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' :
                      task.status === 'In Progress' ? 'border-blue-500/30 text-blue-500 bg-blue-500/10' :
                      'border-amber-500/30 text-amber-500 bg-amber-500/10'
                    }`}>
                      {task.status}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-base)] opacity-40">
                      ID: {task.id.slice(-6)}
                    </span>
                  </div>
                  <p className="font-bold text-[var(--text-base)] text-sm">{task.name}</p>
                  <p className="text-xs text-[var(--text-base)] opacity-60 line-clamp-1 max-w-2xl">{task.description}</p>
                </div>
                
                <div className="text-left sm:text-right shrink-0">
                  <p className="text-xs font-semibold text-[var(--text-base)] opacity-50">Due Date</p>
                  <p className="text-sm font-bold text-[var(--text-base)]">{task.deadline}</p>
                  <p className="text-[10px] font-bold text-[var(--primary)] mt-1">{task.priority} Priority</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
