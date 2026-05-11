export const initialEmployees = [
  { id: "admin", name: "Mayank Pandey", email: "admin@apex.com", password: "admin123", role: "Admin", rating: 4.9, bio: "Senior Operations Director.", avatarColor: "from-indigo-500 to-purple-600", department: "Management", joinDate: "2022-01-10" },
  { id: "emp101", name: "Alex Rivera", email: "alex@apex.com", password: "emp123", role: "Employee", designation: "Software Developer", rating: 4.8, bio: "Full Stack Engineer.", avatarColor: "from-blue-500 to-cyan-500", department: "Engineering", joinDate: "2023-03-15" },
  { id: "emp102", name: "Elena Rostova", email: "elena@apex.com", password: "emp123", role: "Employee", designation: "UI/UX Designer", rating: 4.7, bio: "Creative lead.", avatarColor: "from-pink-500 to-rose-500", department: "Design", joinDate: "2023-05-20" },
  { id: "emp103", name: "Marcus Chen", email: "marcus@apex.com", password: "emp123", role: "Employee", designation: "QA Engineer", rating: 4.5, bio: "Detail-oriented tester.", avatarColor: "from-emerald-500 to-teal-500", department: "Quality", joinDate: "2023-07-01" }
];

export const initialTasks = [
  { id: "task_1", employeeId: "emp101", employeeName: "Alex Rivera", name: "Develop Login & Auth Page", description: "Create a fully responsive glassmorphic login interface with role detection.", status: "Completed", deadline: "2026-05-12", priority: "High", createdAt: "2026-05-05", category: "Development" },
  { id: "task_2", employeeId: "emp102", employeeName: "Elena Rostova", name: "Design Premium Color Palettes", description: "Draft five modern CSS colorways and configure them inside Tailwind variables.", status: "In Progress", deadline: "2026-05-14", priority: "Medium", createdAt: "2026-05-06", category: "Design" },
  { id: "task_3", employeeId: "emp101", employeeName: "Alex Rivera", name: "Connect State Persistence Engine", description: "Wire up local storage handlers to dynamically save, modify, and delete data.", status: "In Progress", deadline: "2026-05-15", priority: "High", createdAt: "2026-05-08", category: "Development" },
  { id: "task_4", employeeId: "emp103", employeeName: "Marcus Chen", name: "Perform Visual UI Audits", description: "Verify font switching, responsiveness on iPad and iPhones.", status: "Pending", deadline: "2026-05-18", priority: "Low", createdAt: "2026-05-09", category: "QA" },
  { id: "task_5", employeeId: "emp102", employeeName: "Elena Rostova", name: "Create Onboarding Illustrations", description: "Design SVG illustrations for the onboarding flow screens.", status: "Pending", deadline: "2026-05-20", priority: "Medium", createdAt: "2026-05-10", category: "Design" },
  { id: "task_6", employeeId: "emp103", employeeName: "Marcus Chen", name: "Write E2E Test Suite", description: "Automate end-to-end tests for login, task CRUD, and report submission.", status: "Pending", deadline: "2026-05-22", priority: "High", createdAt: "2026-05-10", category: "QA" }
];

export const initialReports = [
  { id: "report_1", employeeId: "emp101", employeeName: "Alex Rivera", taskId: "task_1", taskName: "Develop Login & Auth Page", hours: 8, date: "2026-05-08", summary: "Built out the fully styled Login.jsx component with demo accounts quick-switch toggle drawer.", status: "Approved", adminComment: "Fantastic attention to detail!" },
  { id: "report_2", employeeId: "emp102", employeeName: "Elena Rostova", taskId: "task_2", taskName: "Design Premium Color Palettes", hours: 6, date: "2026-05-09", summary: "Refined Cyberpunk Neon and Sunset Rose hex codes. Programmed the variable injection system.", status: "Under Review", adminComment: "" }
];

export const initialNotifications = [
  { id: "notif_1", content: "Welcome to Apex Management System! Explore your customizable dashboard.", date: "2026-05-09T10:00:00.000Z", read: false },
  { id: "notif_2", content: "Mayank Pandey approved your daily report for 'Develop Login & Auth Page'.", date: "2026-05-08T18:30:00.000Z", read: false, employeeId: "emp101" }
];

export const getStorage = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
};

export const setStorage = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

export const initStorage = () => {
  if (!localStorage.getItem("apex_employees")) setStorage("apex_employees", initialEmployees);
  if (!localStorage.getItem("apex_tasks")) setStorage("apex_tasks", initialTasks);
  if (!localStorage.getItem("apex_reports")) setStorage("apex_reports", initialReports);
  if (!localStorage.getItem("apex_notifications")) setStorage("apex_notifications", initialNotifications);
};
