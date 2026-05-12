import React, { useState, useRef } from "react";
import { RiEditLine, RiMailLine, RiLockPasswordLine, RiUserLine, RiInformationLine, RiCameraLine, RiCheckLine } from "react-icons/ri";
import toast from "react-hot-toast";
import { useApp } from "../../context/AppContext";
import { api } from "../../utils/api";

export default function Profile() {
  const { currentUser, setCurrentUser } = useApp();
  
  const [form, setForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    bio: currentUser?.bio || "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please select a valid image file");
    }

    setUploading(true);
    try {
      const uploadRes = await api.uploadImage(file);
      const updatedUser = await api.updateProfile({ avatarUrl: uploadRes.url });
      setCurrentUser(updatedUser);
      toast.success("Profile picture updated!");
    } catch (err) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await api.updateProfile(form);
      setCurrentUser(updatedUser);
      toast.success("Profile updated successfully!");
      setForm((prev) => ({ ...prev, password: "" })); // Clear password field
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn pb-16 relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-40 right-10 w-64 h-64 bg-[var(--secondary)]/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="px-4 sm:px-8 md:px-4 pt-4 relative z-10">
        <div className="flex flex-col md:flex-row items-end gap-6 justify-between">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full md:w-auto">
            {/* Interactive Avatar */}
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] blur-md opacity-40 group-hover:opacity-75 transition-opacity" />
              {currentUser.avatarUrl ? (
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.name} 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] object-cover shadow-2xl border-4 border-[var(--card-base)] relative z-10"
                />
              ) : (
                <div className={`w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-gradient-to-tr ${currentUser.avatarColor || "from-indigo-500 to-purple-600"} flex items-center justify-center font-black text-white text-5xl uppercase shadow-2xl border-4 border-[var(--card-base)] relative z-10`}>
                  {currentUser.name.charAt(0)}
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white z-20 border-4 border-transparent">
                {uploading ? (
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <div className="bg-white/20 p-2 rounded-full mb-2 backdrop-blur-md">
                      <RiCameraLine className="text-2xl" />
                    </div>
                    <span className="text-xs font-black tracking-wider uppercase">Update</span>
                  </>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {/* Profile Info Label */}
            <div className="text-center md:text-left pb-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-3xl md:text-4xl font-black text-[var(--text-base)] tracking-tight drop-shadow-sm">
                  {currentUser.name}
                </h1>
                <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm">
                  {currentUser.role}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-sm text-[var(--text-base)] opacity-60 font-medium">
                {currentUser.designation && <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" /> {currentUser.designation}</span>}
                {currentUser.department && <span className="opacity-50">| {currentUser.department}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Quick Stats Column */}
          <div className="space-y-6">
            <div className="bg-[var(--card-base)] border border-[var(--border-base)] rounded-3xl p-6 shadow-sm backdrop-blur-md bg-opacity-80 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-[var(--primary)]/10 to-transparent rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-110 duration-700" />
              
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-[var(--text-base)] opacity-40 mb-4">Member Overview</h3>
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-4 bg-[var(--bg-base)]/50 p-3 rounded-2xl border border-[var(--border-base)]/40">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-lg"><RiMailLine /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-[var(--text-base)] opacity-40 uppercase tracking-wider">Registered Email</p>
                    <p className="text-sm font-bold text-[var(--text-base)] truncate">{currentUser.email}</p>
                  </div>
                </div>

                {currentUser.joinDate && (
                  <div className="flex items-center gap-4 bg-[var(--bg-base)]/50 p-3 rounded-2xl border border-[var(--border-base)]/40">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center text-lg"><RiUserLine /></div>
                    <div>
                      <p className="text-[10px] font-bold text-[var(--text-base)] opacity-40 uppercase tracking-wider">Joined on</p>
                      <p className="text-sm font-bold text-[var(--text-base)]">{new Date(currentUser.joinDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                )}

                {currentUser.rating !== undefined && (
                  <div className="flex items-center gap-4 bg-[var(--bg-base)]/50 p-3 rounded-2xl border border-[var(--border-base)]/40">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg">★</div>
                    <div>
                      <p className="text-[10px] font-bold text-[var(--text-base)] opacity-40 uppercase tracking-wider">Performance Index</p>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-black text-[var(--text-base)]">{currentUser.rating.toFixed(1)}</p>
                        <div className="w-24 h-1.5 bg-[var(--border-base)] rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(currentUser.rating / 5) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Config Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--card-base)] border border-[var(--border-base)] rounded-3xl shadow-sm overflow-hidden backdrop-blur-md bg-opacity-90">
              <div className="px-6 py-5 border-b border-[var(--border-base)] flex items-center justify-between bg-[var(--bg-base)]/30">
                <div>
                  <h2 className="font-black text-lg text-[var(--text-base)]">Account Settings</h2>
                  <p className="text-xs font-medium text-[var(--text-base)] opacity-50">Keep your profile data secure and accurate</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center"><RiEditLine className="text-lg" /></div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-base)] opacity-60 flex items-center gap-2">
                      <RiUserLine className="text-[var(--primary)]" /> Full Display Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] text-sm px-4 py-3.5 rounded-xl text-[var(--text-base)] outline-none focus:border-[var(--primary)] focus:ring-4 ring-[var(--primary)]/10 transition-all font-semibold placeholder:opacity-30 shadow-inner bg-opacity-50"
                      placeholder="e.g. John Wick"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-base)] opacity-60 flex items-center gap-2">
                      <RiMailLine className="text-[var(--primary)]" /> Official Contact Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] text-sm px-4 py-3.5 rounded-xl text-[var(--text-base)] outline-none focus:border-[var(--primary)] focus:ring-4 ring-[var(--primary)]/10 transition-all font-semibold placeholder:opacity-30 shadow-inner bg-opacity-50"
                      placeholder="name@company.com"
                      required
                    />
                  </div>
                </div>

                {/* Bio Row */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-base)] opacity-60 flex items-center gap-2">
                    <RiInformationLine className="text-[var(--primary)]" /> Professional Bio / Summary
                  </label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows="4"
                    className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] text-sm px-4 py-3.5 rounded-xl text-[var(--text-base)] outline-none focus:border-[var(--primary)] focus:ring-4 ring-[var(--primary)]/10 transition-all resize-none font-medium placeholder:opacity-30 shadow-inner bg-opacity-50 custom-scrollbar"
                    placeholder="Introduce yourself, your experiences, skills, and philosophy..."
                  />
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 py-2">
                  <div className="h-[1px] bg-[var(--border-base)] flex-1" />
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[var(--text-base)] opacity-30 flex items-center gap-2 shrink-0">
                    <RiLockPasswordLine /> Password Authorization
                  </span>
                  <div className="h-[1px] bg-[var(--border-base)] flex-1" />
                </div>

                {/* Password Section */}
                <div className="bg-[var(--bg-base)]/30 p-5 rounded-2xl border border-dashed border-[var(--border-base)]">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between mb-4">
                    <div className="max-w-xs">
                      <h4 className="text-sm font-black text-[var(--text-base)]">Update Security Key</h4>
                      <p className="text-xs font-medium text-[var(--text-base)] opacity-50">Want to change your portal access code? Write a new one here.</p>
                    </div>
                    <div className="flex-1 md:max-w-md">
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full bg-[var(--card-base)] border border-[var(--border-base)] text-sm px-4 py-3 rounded-xl text-[var(--text-base)] outline-none focus:border-[var(--primary)] focus:ring-4 ring-[var(--primary)]/10 transition-all font-mono placeholder:font-sans placeholder:opacity-40 shadow-sm"
                        placeholder="Enter new password (min 6 char)"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Row */}
                <div className="flex justify-end pt-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="relative group overflow-hidden bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-black py-4 px-8 rounded-2xl shadow-[0_10px_20px_-5px_rgba(var(--primary-glow),0.4)] hover:shadow-[0_15px_25px_-5px_rgba(var(--primary-glow),0.6)] hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] cursor-pointer transition-all disabled:opacity-70 w-full sm:w-auto"
                  >
                    {/* Shiny reflection effect on hover */}
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                    
                    <div className="relative flex items-center justify-center gap-2 uppercase tracking-wider text-xs">
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <RiCheckLine className="text-lg" />
                          Publish Changes
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
