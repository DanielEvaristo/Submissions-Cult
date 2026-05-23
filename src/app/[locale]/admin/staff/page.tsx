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
    <div className="max-w-6xl mx-auto px-8 py-12 space-y-12 animate-reveal text-black">
      <div className="mb-12 flex items-end justify-between gap-6 border-b-4 border-black bg-white px-4 py-5">
        <div className="text-black">
          <span className="mb-4 block text-[10px] font-black uppercase tracking-[0.4em] text-black">
            ADMINISTRATION
          </span>
          <h1 className="font-sans text-6xl font-black uppercase leading-none tracking-tighter text-black">
            STAFF<br/>MANAGEMENT
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <div className="border-4 border-black bg-white text-black p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="mb-8 flex items-center gap-3 border-b-2 border-black pb-4 font-sans text-xl font-black uppercase tracking-widest text-black">
              <Plus size={20} strokeWidth={3} /> ADD NEW STAFF
            </h2>
            <form onSubmit={handleCreate} className="space-y-6 text-black">
              <div>
                <label className="mb-2 block font-sans text-[10px] font-black uppercase tracking-[0.2em] text-black">FULL NAME</label>
                <input
                  type="text"
                  required
                  className="w-full border-2 border-black bg-[#F5F5F5] p-4 font-sans text-sm font-bold uppercase tracking-tight text-black placeholder:text-black/40 focus:bg-white focus:outline-none"
                  placeholder="EX. JOHN DOE"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-2 block font-sans text-[10px] font-black uppercase tracking-[0.2em] text-black">EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  className="w-full border-2 border-black bg-[#F5F5F5] p-4 font-sans text-sm font-bold uppercase tracking-tight text-black placeholder:text-black/40 focus:bg-white focus:outline-none"
                  placeholder="STAFF@CULTMACHINE.COM"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-2 block font-sans text-[10px] font-black uppercase tracking-[0.2em] text-black">ACCESS KEY (TEMP PW)</label>
                <input
                  type="text"
                  required
                  className="w-full border-2 border-black bg-[#F5F5F5] p-4 font-sans text-sm font-bold uppercase tracking-tight text-black placeholder:text-black/40 focus:bg-white focus:outline-none"
                  placeholder="TEMPORARY PASSWORD"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-black/75">MUST BE RESET ON FIRST LOGIN.</p>
              </div>

              <div>
                <label className="mb-2 block font-sans text-[10px] font-black uppercase tracking-[0.2em] text-black">SECURITY CLEARANCE</label>
                <select
                  className="w-full appearance-none border-2 border-black bg-[#F5F5F5] p-4 font-sans text-sm font-bold uppercase tracking-tight text-black focus:bg-white focus:outline-none"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                >
                  <option value="CURATOR">CURATOR (L1)</option>
                  <option value="MASTER_CURATOR">MASTER CURATOR (L2)</option>
                </select>
              </div>

              {form.role === "CURATOR" && (
                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <label className="block font-sans text-[10px] font-black uppercase tracking-[0.2em] text-black">GENRE SPECIALISATION</label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, assignedGenres: [...GENRES] })}
                      className="bg-black px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white transition-colors hover:bg-[#F5E000] hover:text-black"
                    >
                      ASSIGN ALL
                    </button>
                  </div>
                  <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto border-2 border-black bg-[#F5F5F5] p-4">
                    {GENRES.map(g => (
                      <label key={g} className="flex cursor-pointer items-center gap-3 group">
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
                          className="h-4 w-4 cursor-pointer rounded-none border-2 border-black text-black focus:ring-0"
                        />
                        <span className="px-1 font-sans text-[10px] font-black uppercase tracking-widest text-black group-hover:bg-[#F5E000]">
                          {g}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {message && (
                <div className={`border-2 border-black p-4 font-sans text-[10px] font-black uppercase tracking-[0.2em] ${message.type === "success"
                  ? "bg-[#F5E000] text-black"
                  : "bg-[#FF0000] text-white"
                }`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={creating}
                className="flex w-full items-center justify-center gap-3 bg-black py-6 font-sans text-xs font-black uppercase tracking-[0.3em] text-white transition-all hover:bg-[#F5E000] hover:text-black"
              >
                {creating ? <Loader2 size={16} className="animate-spin" /> : "CREATE ACCESS"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="border-4 border-black bg-white text-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between border-b-4 border-black bg-black px-8 py-6 text-white">
              <div className="flex items-center gap-3 text-white">
                <Users size={20} strokeWidth={3} />
                <h2 className="font-sans text-xl font-black uppercase tracking-widest text-white">ACTIVE ROSTER</h2>
              </div>
              <span className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-white/75">
                {staff.length} PERSONNEL
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center p-20 text-black">
                <Loader2 className="animate-spin text-black" size={32} strokeWidth={3} />
              </div>
            ) : staff.length === 0 ? (
              <div className="p-20 text-center font-sans text-xs font-black uppercase tracking-widest text-black/60">
                ROSTER EMPTY.
              </div>
            ) : (
              <div className="divide-y-2 divide-black/10">
                {staff.map(member => (
                  <div key={member.id} className="group flex items-center justify-between border-l-[12px] border-l-transparent p-8 transition-all hover:border-l-black hover:bg-[#F5F5F5]">
                    <div className="min-w-0">
                      <p className="mb-1 truncate font-sans text-xl font-black uppercase tracking-tighter text-black">
                        {member.name || "UNNAMED"}
                      </p>
                      <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-black/75">
                        {member.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="hidden text-right sm:block">
                        <span className={`inline-block border-2 border-black px-3 py-1 font-sans text-[9px] font-black uppercase tracking-widest ${member.isMasterCurator
                          ? "bg-[#F5E000] text-black"
                          : "bg-white text-black"
                        }`}>
                          {member.isMasterCurator ? "LEVEL 2 / MASTER" : "LEVEL 1 / CURATOR"}
                        </span>
                        <p className="mt-2 font-sans text-[9px] font-black uppercase tracking-widest text-black/60">
                          EST. {formatDate(member.createdAt)}
                        </p>
                      </div>
                      <div className="border-l-2 border-black/10 pl-6">
                        <button
                          onClick={() => handleDelete(member.id, member.name)}
                          disabled={deletingId === member.id}
                          className="flex h-12 w-12 items-center justify-center border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-[#FF0000] hover:text-white hover:shadow-none"
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
