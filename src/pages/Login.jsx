import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";
import toast from "react-hot-toast";
import { useApp } from "../context/AppContext";
import { api } from "../utils/api";

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [userId, setUserId]     = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  const validate = () => {
    const e = {};
    if (!userId.trim())   e.userId   = "ID or Email is required";
    if (!password.trim()) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { token, user } = await api.login(userId.trim(), password);
      login(token, user);
      toast.success(`Welcome, ${user.name}!`);
      navigate(user.role === "Admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setPassword("");
      setErrors({ password: err.message || "Invalid credentials" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] px-4">
      <div className="w-full max-w-[360px] space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-[var(--text-base)]">Employee Login</h1>
          <p className="text-sm text-[var(--text-base)] opacity-40 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3" noValidate>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-base)] opacity-50">Employee ID or Email</label>
            <div className="relative">
              <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-base)] opacity-30 text-sm" />
              <input type="text" placeholder="Enter your ID or email" value={userId}
                onChange={(e) => { setUserId(e.target.value); setErrors((p) => ({ ...p, userId: "" })); }}
                className={`w-full bg-[var(--card-base)] border ${errors.userId ? "border-rose-500" : "border-[var(--border-base)] focus:border-[var(--primary)]"} text-[var(--text-base)] py-2.5 pl-10 pr-4 rounded-xl outline-none text-sm transition-all`}
              />
            </div>
            {errors.userId && <p className="text-rose-400 text-xs">⚠ {errors.userId}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-base)] opacity-50">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-base)] opacity-30 text-sm" />
              <input type={showPass ? "text" : "password"} placeholder="••••••••" value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                className={`w-full bg-[var(--card-base)] border ${errors.password ? "border-rose-500" : "border-[var(--border-base)] focus:border-[var(--primary)]"} text-[var(--text-base)] py-2.5 pl-10 pr-10 rounded-xl outline-none text-sm transition-all`}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-base)] opacity-30 hover:opacity-60 cursor-pointer transition-all">
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && <p className="text-rose-400 text-xs">⚠ {errors.password}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[var(--primary)] hover:brightness-110 active:scale-[0.98] disabled:opacity-60 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all text-sm">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><FiLogIn /> Sign In</>}
          </button>
        </form>
      </div>
    </div>
  );
}
