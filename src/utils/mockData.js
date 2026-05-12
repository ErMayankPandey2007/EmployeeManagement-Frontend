// localStorage utilities — only used for theme/font preferences now
// All app data (employees, tasks, reports, notifications) is served from MongoDB via API

export const getStorage = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
};

export const setStorage = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};
