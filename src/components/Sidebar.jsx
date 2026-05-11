import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  RiDashboardLine, RiTaskLine, RiTeamLine, RiFileTextLine,
  RiBarChartLine, RiLogoutBoxLine, RiSparklingFill, RiMenuFoldLine, RiMenuUnfoldLine
} from "react-icons/ri";
import { useApp } from "../context/AppContext";

export default function Sidebar() {
  const { currentUser, logout, sidebarOpen, setSidebarOpen } = useApp();
  const navigate = useNavigate();
  const isAdmin = currentUser?.role === "Admin";

  const adminLinks = [
    { to: "/admin", label: "Dashboard", icon: RiDashboardLine, end: true },
    { to: "/admin/tasks", label: "Tasks Board", icon: RiTaskLine },
    { to: "/admin/employees", label: "Employees", icon: RiTeamLine },
    { to: "/admin/reports", label: "Daily Logs", icon: RiFileTextLine },
    { to: "/admin/analytics", label: "Analytics", icon: RiBarChartLine }
  ];

  const empLinks = [
    { to: "/dashboard", label: "Dashboard", icon: RiDashboardLine, end: true },
    { to: "/dashboard/tasks", label: "My Tasks", icon: RiTaskLine },
    { to: "/dashboard/reports", label: "Daily Report", icon: RiFileTextLine },
    { to: "/dashboard/analytics", label: "My Analytics", icon: RiBarChartLine }
  ];

  const links = isAdmin ? adminLinks : empLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" />
      )}

      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-[var(--card-base)] border-r border-[var(--border-base)] flex flex-col transition-all duration-300 ${sidebarOpen ? "w-64 translate-x-0" : "w-0 lg:w-20 -translate-x-full lg:translate-x-0"} overflow-hidden`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-base)] shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shrink-0 shadow-lg">
              <RiSparklingFill className="text-white text-lg" />
            </div>
            {sidebarOpen && (
              <span className="font-black text-lg tracking-widest bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent whitespace-nowrap">
                APEX
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex w-8 h-8 rounded-lg bg-[var(--bg-base)] border border-[var(--border-base)] items-center justify-center text-[var(--text-base)] opacity-60 hover:opacity-100 cursor-pointer transition-all shrink-0"
          >
            {sidebarOpen ? <RiMenuFoldLine className="text-base" /> : <RiMenuUnfoldLine className="text-base" />}
          </button>
        </div>

        {/* Role Badge */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-[var(--border-base)]">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${isAdmin ? "bg-indigo-500/15 text-indigo-400" : "bg-emerald-500/15 text-emerald-400"}`}>
              {isAdmin ? "⚡ Administrator" : "👤 Employee Portal"}
            </span>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={({ isActive }) =>
                `flex items-center gap-3.5 py-3 px-3.5 rounded-xl font-semibold text-sm transition-all cursor-pointer relative group ${
                  isActive
                    ? "bg-gradient-to-r from-[var(--primary)]/15 to-[var(--secondary)]/5 text-[var(--primary)] border-l-[3px] border-[var(--primary)]"
                    : "text-[var(--text-base)] opacity-55 hover:opacity-100 hover:bg-[var(--bg-base)]/50"
                }`
              }
            >
              <Icon className="text-xl shrink-0" />
              {sidebarOpen ? (
                <span className="truncate">{label}</span>
              ) : (
                <div className="absolute left-[72px] bg-[var(--card-base)] border border-[var(--border-base)] text-[var(--text-base)] text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none shadow-xl whitespace-nowrap z-50 translate-x-2 group-hover:translate-x-0 transition-all">
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-[var(--border-base)] shrink-0">
          {sidebarOpen ? (
            <div className="flex items-center justify-between gap-2 bg-[var(--bg-base)]/50 p-2.5 rounded-2xl border border-[var(--border-base)]/50">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${currentUser?.avatarColor || "from-primary to-secondary"} flex items-center justify-center font-black text-white text-sm shrink-0 uppercase`}>
                  {currentUser?.name?.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate text-[var(--text-base)]">{currentUser?.name}</p>
                  <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider">{currentUser?.role}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 cursor-pointer transition-all shrink-0" title="Logout">
                <RiLogoutBoxLine className="text-base" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center relative group">
              <button onClick={handleLogout} className="w-10 h-10 rounded-xl bg-[var(--bg-base)]/50 border border-[var(--border-base)]/50 flex items-center justify-center text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-all">
                <RiLogoutBoxLine className="text-lg" />
              </button>
              <div className="absolute left-[52px] bg-[var(--card-base)] border border-[var(--border-base)] text-rose-400 text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none shadow-xl whitespace-nowrap z-50">
                Logout
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
