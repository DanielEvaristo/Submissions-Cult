"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Users, Trash2 } from "lucide-react";

interface StaffMember {
  id: string;
  name: string | null;
  email: string;
  isCurator: boolean;
  isMasterCurator: boolean;
  createdAt: string;
  assignedGenres?: string[];
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CURATOR",
    assignedGenres: [] as string[]
  });

  const GENRES = [
    "Rock", "Electronic", "Hip-Hop", "R&B / Soul", "Pop",
    "Folk / Acoustic", "Latin", "Jazz", "Metal", "Ambient / Experimental", "Other"
  ];

  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff");
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create staff member");
      }

      setMessage({ type: "success", text: "Staff account created successfully!" });
      setForm({ name: "", email: "", password: "", role: "CURATOR", assignedGenres: [] });
      fetchStaff();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string | null) => {
    if (!confirm(`Are you sure you want to delete the staff account for ${name || "this user"}?`)) {
      return;
    }

    setDeletingId(id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete staff member");
      }

      setMessage({ type: "success", text: "Staff account deleted successfully." });
      setStaff(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

  return (
    <div className="max-w-6xl mx-auto px-8 py-12 space-y-12 animate-reveal">

      {/* Header */}
      <div className="border-b-4 border-black pb-8 mb-12 flex justify-between items-end">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40 mb-4 block">ADMINISTRATION</span>
          <h1 className="font-sans text-6xl font-black text-black tracking-tighter uppercase leading-none">
            STAFF<br/>MANAGEMENT
          </h1>
        </div>
        <div className="hidden md:block text-[10px] font-black uppercase tracking-[0.4em] text-black/10">
          SEC_AUTH_LEVEL_02
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Creation Form */}
        <div className="lg:col-span-1">
          <div className="border-4 border-black bg-white text-black p-8">
            <h2 className="font-sans text-xl font-black uppercase tracking-widest text-black mb-8 border-b-2 border-black pb-4 flex items-center gap-3">
              <Plus size={20} strokeWidth={3} /> ADD NEW STAFF
            </h2>
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block font-sans text-[10px] font-black uppercase tracking-[0.2em] mb-2">FULL NAME</label>
                <input
                  type="text"
                  required
                  className="w-full p-4 bg-[#F5F5F5] border-2 border-black focus:bg-white focus:outline-none font-sans text-sm font-bold uppercase tracking-tight text-black placeholder:text-black/30"
                  placeholder="EX. JOHN DOE"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-sans text-[10px] font-black uppercase tracking-[0.2em] mb-2">EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  className="w-full p-4 bg-[#F5F5F5] border-2 border-black focus:bg-white focus:outline-none font-sans text-sm font-bold uppercase tracking-tight text-black placeholder:text-black/30"
                  placeholder="STAFF@CULTMACHINE.COM"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-sans text-[10px] font-black uppercase tracking-[0.2em] mb-2">ACCESS KEY (TEMP PW)</label>
                <input
                  type="text"
                  required
                  className="w-full p-4 bg-[#F5F5F5] border-2 border-black focus:bg-white focus:outline-none font-sans text-sm font-bold uppercase tracking-tight text-black placeholder:text-black/30"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <p className="text-[9px] font-black uppercase tracking-widest text-black/40 mt-2">MUST BE RESET ON FIRST LOGIN.</p>
              </div>

              <div>
                <label className="block font-sans text-[10px] font-black uppercase tracking-[0.2em] mb-2">SECURITY CLEARANCE</label>
                <select
                  className="w-full p-4 bg-[#F5F5F5] border-2 border-black focus:bg-white focus:outline-none font-sans text-sm font-bold uppercase tracking-tight appearance-none text-black"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                >
                  <option value="CURATOR">CURATOR (L1)</option>
                  <option value="MASTER_CURATOR">MASTER CURATOR (L2)</option>
                </select>
              </div>

              {form.role === "CURATOR" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block font-sans text-[10px] font-black uppercase tracking-[0.2em]">GENRE SPECIALISATION</label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, assignedGenres: [...GENRES] })}
                      className="text-[9px] font-black uppercase tracking-widest bg-black text-white px-2 py-1 hover:bg-[#F5E000] hover:text-black transition-colors"
                    >
                      ASSIGN ALL
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-4 border-2 border-black bg-[#F5F5F5]">
                    {GENRES.map(g => (
                      <label key={g} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={form.assignedGenres.includes(g)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({ ...form, assignedGenres: [...form.assignedGenres, g] });
                            } else {
                              setForm({ ...form, assignedGenres: form.assignedGenres.filter(x => x !== g) });
                            }
                          }}
                          className="w-4 h-4 rounded-none border-2 border-black text-black focus:ring-0 cursor-pointer"
                        />
                        <span className="font-sans text-[10px] font-black uppercase tracking-widest text-black group-hover:bg-[#F5E000] px-1">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {message && (
                <div className={`p-4 font-sans text-[10px] font-black uppercase tracking-[0.2em] ${message.type === "success"
                    ? "bg-[#F5E000] text-black border-2 border-black"
                    : "bg-[#FF0000] text-white border-2 border-black"
                  }`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={creating}
                className="w-full py-6 bg-black text-white font-sans font-black text-xs uppercase tracking-[0.3em] hover:bg-[#F5E000] hover:text-black transition-all flex items-center justify-center gap-3"
              >
                {creating ? <Loader2 size={16} className="animate-spin" /> : "CREATE ACCESS"}
              </button>
            </form>
          </div>
        </div>

        {/* Staff List */}
        <div className="lg:col-span-2">
          <div className="border-4 border-black bg-white text-black">
            <div className="px-8 py-6 border-b-4 border-black bg-black text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users size={20} strokeWidth={3} />
                <h2 className="font-sans text-xl font-black uppercase tracking-widest">ACTIVE ROSTER</h2>
              </div>
              <span className="font-sans text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                {staff.length} PERSONNEL
              </span>
            </div>

            {loading ? (
              <div className="p-20 flex justify-center text-black">
                <Loader2 className="animate-spin" size={32} strokeWidth={3} />
              </div>
            ) : staff.length === 0 ? (
              <div className="p-20 text-center font-sans text-xs font-black uppercase tracking-widest text-black/20">
                ROSTER EMPTY.
              </div>
            ) : (
              <div className="divide-y-2 divide-black/5">
                {staff.map(member => (
                  <div key={member.id} className="p-8 flex items-center justify-between hover:bg-[#F5F5F5] transition-all group border-l-[12px] border-l-transparent hover:border-l-black">
                    <div className="min-w-0">
                      <p className="font-sans text-xl font-black uppercase tracking-tighter text-black truncate mb-1">
                        {member.name || "UNNAMED"}
                      </p>
                      <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-black/40">
                        {member.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <span className={`inline-block px-3 py-1 font-sans text-[9px] font-black uppercase tracking-widest border-2 border-black ${member.isMasterCurator
                            ? "bg-[#F5E000] text-black"
                            : "bg-white text-black"
                          }`}>
                          {member.isMasterCurator ? "LEVEL 2 / MASTER" : "LEVEL 1 / CURATOR"}
                        </span>
                        <p className="font-sans text-[9px] font-black uppercase tracking-widest text-black/20 mt-2">
                          EST. {formatDate(member.createdAt)}
                        </p>
                      </div>
                      <div className="pl-6 border-l-2 border-black/5">
                        <button
                          onClick={() => handleDelete(member.id, member.name)}
                          disabled={deletingId === member.id}
                          className="w-12 h-12 flex items-center justify-center bg-white border-2 border-black text-black hover:bg-[#FF0000] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                        >
                          {deletingId === member.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={18} strokeWidth={3} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
