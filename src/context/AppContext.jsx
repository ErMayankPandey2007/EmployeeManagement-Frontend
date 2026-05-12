import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api";

const AppContext = createContext(null);

export const themes = {
  midnight:  { primary: "#6366f1", secondary: "#a855f7", bg: "#0b0f19", card: "#161e2f", text: "#f8fafc", border: "#1e293b", glow: "rgba(99,102,241,0.15)",   isDark: true,  name: "Midnight Slate" },
  ice:       { primary: "#4f46e5", secondary: "#06b6d4", bg: "#f0f4ff", card: "#ffffff", text: "#0f172a", border: "#e2e8f0", glow: "rgba(79,70,229,0.1)",     isDark: false, name: "Ice Light" },
  cyberpunk: { primary: "#ff007f", secondary: "#00f0ff", bg: "#0a0015", card: "#15052d", text: "#f8fafc", border: "#ff007f33", glow: "rgba(255,0,127,0.2)",   isDark: true,  name: "Cyberpunk Neon" },
  forest:    { primary: "#10b981", secondary: "#84cc16", bg: "#051b14", card: "#0a2e22", text: "#ecfdf5", border: "#0f4c3a", glow: "rgba(16,185,129,0.15)",   isDark: true,  name: "Emerald Forest" },
  sunset:    { primary: "#db2777", secondary: "#f97316", bg: "#fff5f5", card: "#ffffff", text: "#431407", border: "#fecdd3", glow: "rgba(219,39,119,0.1)",    isDark: false, name: "Sunset Rose" },
  ocean:     { primary: "#0ea5e9", secondary: "#6366f1", bg: "#020c1b", card: "#0d1f35", text: "#e2f4ff", border: "#0e3a5e", glow: "rgba(14,165,233,0.15)",  isDark: true,  name: "Deep Ocean" },
};

export const fonts = {
  poppins:   { label: "Poppins",        css: "'Poppins', sans-serif",       desc: "Modern & friendly" },
  inter:     { label: "Inter",          css: "'Inter', sans-serif",         desc: "Neutral & clean" },
  outfit:    { label: "Outfit",         css: "'Outfit', sans-serif",        desc: "Elegant geometric" },
  jetbrains: { label: "JetBrains Mono", css: "'JetBrains Mono', monospace", desc: "Technical code style" },
};

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState("midnight");
  const [selectedFont, setSelectedFont]   = useState("poppins");
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [loading, setLoading]             = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem("apex_token");
    if (token) {
      api.getMe()
        .then((user) => setCurrentUser(user))
        .catch(() => localStorage.removeItem("apex_token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    const t = localStorage.getItem("apex_theme");
    const f = localStorage.getItem("apex_font");
    if (t && themes[t]) setSelectedTheme(t);
    if (f && fonts[f])  setSelectedFont(f);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, []);

  // Apply theme CSS vars
  useEffect(() => {
    const t = themes[selectedTheme];
    if (!t) return;
    localStorage.setItem("apex_theme", selectedTheme);
    const r = document.documentElement;
    r.style.setProperty("--primary",      t.primary);
    r.style.setProperty("--secondary",    t.secondary);
    r.style.setProperty("--bg-base",      t.bg);
    r.style.setProperty("--card-base",    t.card);
    r.style.setProperty("--text-base",    t.text);
    r.style.setProperty("--border-base",  t.border);
    r.style.setProperty("--primary-glow", t.glow);
    t.isDark ? r.classList.add("dark") : r.classList.remove("dark");
  }, [selectedTheme]);

  // Mobile scroll lock
  useEffect(() => {
    if (window.innerWidth < 1024) {
      document.body.style.overflow = sidebarOpen ? "hidden" : "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  // Apply font
  useEffect(() => {
    const f = fonts[selectedFont];
    if (!f) return;
    localStorage.setItem("apex_font", selectedFont);
    document.documentElement.style.setProperty("--font-family", f.css);
  }, [selectedFont]);

  const login = (token, user) => {
    localStorage.setItem("apex_token", token);
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem("apex_token");
    setCurrentUser(null);
  };

  return (
    <AppContext.Provider value={{ currentUser, setCurrentUser, login, logout, loading, selectedTheme, setSelectedTheme, selectedFont, setSelectedFont, sidebarOpen, setSidebarOpen }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
