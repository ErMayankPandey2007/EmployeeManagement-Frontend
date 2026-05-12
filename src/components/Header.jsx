import React, { useState, useEffect } from "react";
import { RiMenuLine, RiBellLine, RiPaletteLine, RiFontSize, RiCheckLine, RiMoonLine, RiSunLine, RiFlashlightLine, RiLeafLine, RiFireLine, RiDropLine } from "react-icons/ri";
import { useApp, themes, fonts } from "../context/AppContext";
import { api } from "../utils/api";

const themeIcons = { midnight: RiMoonLine, ice: RiSunLine, cyberpunk: RiFlashlightLine, forest: RiLeafLine, sunset: RiFireLine, ocean: RiDropLine };

export default function Header() {
  const { currentUser, sidebarOpen, setSidebarOpen, selectedTheme, setSelectedTheme, selectedFont, setSelectedFont } = useApp();
  const [showTheme, setShowTheme]         = useState(false);
  const [showFont, setShowFont]           = useState(false);
  const [showNotif, setShowNotif]         = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifs = async () => {
    try { setNotifications(await api.getNotifications()); } catch {}
  };

  useEffect(() => { if (currentUser) fetchNotifs(); }, [currentUser]);

  const unread = notifications.filter((n) => !n.read).length;

  const markAll = async () => {
    try {
      await api.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const closeAll = () => { setShowTheme(false); setShowFont(false); setShowNotif(false); };

  return (
    <header className="h-16 sticky top-0 z-30 bg-[var(--card-base)]/90 backdrop-blur-xl border-b border-[var(--border-base)] px-5 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-base)] text-[var(--text-base)] hover:border-[var(--primary)] hover:text-[var(--primary)] cursor-pointer transition-all">
          <RiMenuLine className="text-lg" />
        </button>
        <div className="hidden sm:block">
          <p className="text-sm font-bold text-[var(--text-base)]">Welcome, <span className="text-[var(--primary)]">{currentUser?.name}</span></p>
          <p className="text-[10px] text-[var(--text-base)] opacity-40 font-semibold uppercase tracking-wider">{currentUser?.role} · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme */}
        <div className="relative">
          <button onClick={() => { setShowTheme(!showTheme); setShowFont(false); setShowNotif(false); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${showTheme ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]" : "bg-[var(--bg-base)] border-[var(--border-base)] text-[var(--text-base)] hover:border-[var(--primary)] hover:text-[var(--primary)]"}`}>
            <RiPaletteLine className="text-base" /><span className="hidden md:inline">Theme</span>
          </button>
          {showTheme && (
            <>
              <div onClick={closeAll} className="fixed inset-0 z-40" />
              <div className="absolute right-0 mt-2 w-64 z-50 bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl shadow-2xl p-2 animate-slideUp">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-base)] opacity-40 px-3 py-2">Choose Colorway</p>
                {Object.entries(themes).map(([id, t]) => {
                  const Icon = themeIcons[id] || RiPaletteLine;
                  return (
                    <button key={id} onClick={() => { setSelectedTheme(id); closeAll(); }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--bg-base)]/60 cursor-pointer transition-all ${selectedTheme === id ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--text-base)]"}`}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: t.primary + "22" }}>
                          <Icon className="text-base" style={{ color: t.primary }} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold leading-tight">{t.name}</p>
                          <p className="text-[10px] opacity-50 leading-tight">{t.isDark ? "Dark" : "Light"} theme</p>
                        </div>
                      </div>
                      {selectedTheme === id && <RiCheckLine className="text-base shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Font */}
        <div className="relative">
          <button onClick={() => { setShowFont(!showFont); setShowTheme(false); setShowNotif(false); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${showFont ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]" : "bg-[var(--bg-base)] border-[var(--border-base)] text-[var(--text-base)] hover:border-[var(--primary)] hover:text-[var(--primary)]"}`}>
            <RiFontSize className="text-base" /><span className="hidden md:inline">Font</span>
          </button>
          {showFont && (
            <>
              <div onClick={closeAll} className="fixed inset-0 z-40" />
              <div className="absolute right-0 mt-2 w-60 z-50 bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl shadow-2xl p-2 animate-slideUp">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-base)] opacity-40 px-3 py-2">Typography</p>
                {Object.entries(fonts).map(([id, f]) => (
                  <button key={id} onClick={() => { setSelectedFont(id); closeAll(); }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--bg-base)]/60 cursor-pointer transition-all ${selectedFont === id ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--text-base)]"}`}
                    style={{ fontFamily: f.css }}>
                    <div>
                      <p className="text-xs font-bold">{f.label}</p>
                      <p className="text-[10px] opacity-50" style={{ fontFamily: "var(--font-family)" }}>{f.desc}</p>
                    </div>
                    {selectedFont === id && <RiCheckLine className="text-base shrink-0" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => { setShowNotif(!showNotif); setShowTheme(false); setShowFont(false); if (!showNotif) fetchNotifs(); }}
            className={`relative p-2 rounded-xl border cursor-pointer transition-all ${showNotif ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]" : "bg-[var(--bg-base)] border-[var(--border-base)] text-[var(--text-base)] hover:border-[var(--primary)] hover:text-[var(--primary)]"}`}>
            <RiBellLine className="text-lg" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center border-2 border-[var(--card-base)]">
                {unread}
              </span>
            )}
          </button>
          {showNotif && (
            <>
              <div onClick={closeAll} className="fixed inset-0 z-40" />
              <div className="absolute right-0 mt-2 w-80 z-50 bg-[var(--card-base)] border border-[var(--border-base)] rounded-2xl shadow-2xl p-3 animate-slideUp">
                <div className="flex justify-between items-center pb-2.5 border-b border-[var(--border-base)] mb-2.5">
                  <span className="text-xs font-black text-[var(--text-base)]">Notifications {unread > 0 && <span className="ml-1 bg-rose-500/15 text-rose-400 text-[10px] px-1.5 py-0.5 rounded-full font-black">{unread} new</span>}</span>
                  {unread > 0 && <button onClick={markAll} className="text-[10px] font-bold text-[var(--primary)] hover:underline cursor-pointer">Mark all read</button>}
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notifications.length === 0
                    ? <p className="py-8 text-center text-xs text-[var(--text-base)] opacity-40 font-semibold">No notifications</p>
                    : notifications.map((n) => (
                      <div key={n._id || n.id} className={`p-3 rounded-xl border text-xs transition-all relative ${n.read ? "border-[var(--border-base)]/40 opacity-50" : "border-[var(--primary)]/20 bg-[var(--primary)]/5"}`}>
                        {!n.read && <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />}
                        <p className="font-semibold text-[var(--text-base)] pr-4 leading-relaxed">{n.content}</p>
                        <p className="text-[10px] opacity-40 mt-1.5 font-bold">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${currentUser?.avatarColor || "from-indigo-500 to-purple-600"} flex items-center justify-center font-black text-white text-sm uppercase shrink-0`}>
          {currentUser?.name?.charAt(0)}
        </div>
      </div>
    </header>
  );
}
