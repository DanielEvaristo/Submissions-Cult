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
    <div className="max-w-6xl mx-auto px-8 py-10 space-y-10">

      {/* Header */}
      <div>
        <h1 className="font-sans text-3xl font-bold text-cm-text-primary tracking-tight">
          Staff Management
        </h1>
        <p className="font-sans text-base text-cm-text-secondary mt-2">
          Create and manage curator accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Creation Form */}
        <div className="lg:col-span-1">
          <div className="bg-bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="font-sans text-lg font-bold text-cm-text-primary mb-4 flex items-center gap-2">
              <Plus size={18} /> Add New Staff
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  required
                  className="input"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Temporary Password</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="secret123"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <p className="text-[11px] text-cm-text-muted mt-1">They can change this after logging in.</p>
              </div>

              <div>
                <label className="label">Role</label>
                <select
                  className="input"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                >
                  <option value="CURATOR">Curator (Level 1)</option>
                  <option value="MASTER_CURATOR">Master Curator (Level 2)</option>
                </select>
              </div>

              {form.role === "CURATOR" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label mb-0">Assigned Genres</label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, assignedGenres: [...GENRES] })}
                      className="text-[10px] uppercase font-bold text-accent-red hover:bg-accent-red/10 px-2 py-1 rounded transition-colors"
                    >
                      Assign All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-bg-elevated border border-border rounded-md">
                    {GENRES.map(g => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer group">
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
                          className="rounded border-border text-accent-red focus:ring-accent-red/20 bg-bg cursor-pointer"
                        />
                        <span className="font-sans text-xs text-cm-text-secondary group-hover:text-cm-text-primary transition-colors">{g}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-[10px] text-cm-text-muted mt-2 leading-tight">
                    Select genres this curator handles. If empty, they are considered a "Generalist" and can receive any genre if no specialist is available.
                  </p>
                </div>
              )}

              {message && (
                <div className={`p-3 rounded-md text-sm font-medium border ${message.type === "success"
                    ? "bg-ok/10 text-ok border-ok/20"
                    : "bg-danger/10 text-danger border-danger/20"
                  }`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={creating}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 size={16} className="animate-spin" /> : "Create Account"}
              </button>
            </form>
          </div>
        </div>

        {/* Staff List */}
        <div className="lg:col-span-2">
          <div className="bg-bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border flex items-center gap-2">
              <Users size={18} className="text-cm-text-secondary" />
              <h2 className="font-sans text-lg font-bold text-cm-text-primary">Current Staff</h2>
            </div>

            {loading ? (
              <div className="p-10 flex justify-center">
                <Loader2 className="animate-spin text-cm-text-muted" size={24} />
              </div>
            ) : staff.length === 0 ? (
              <div className="p-10 text-center text-cm-text-muted">
                No staff members found.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {staff.map(member => (
                  <div key={member.id} className="p-5 flex items-center justify-between hover:bg-bg-elevated transition-colors">
                    <div>
                      <p className="font-sans text-sm font-bold text-cm-text-primary">
                        {member.name}
                      </p>
                      <p className="font-sans text-xs text-cm-text-secondary">
                        {member.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${member.isMasterCurator
                          ? "bg-accent-red/10 text-accent-red border border-accent-red/20"
                          : "bg-bg-elevated text-cm-text-secondary border border-border"
                        }`}>
                        {member.isMasterCurator ? "Master Curator" : "Curator"}
                      </span>
                      <p className="font-sans text-[10px] text-cm-text-muted mt-1">
                        Added {formatDate(member.createdAt)}
                      </p>
                      {/* Show genres if L1 Curator */}
                      {!member.isMasterCurator && member.isCurator && (
                        <p className="font-sans text-[10px] text-cm-text-secondary mt-1">
                          {member.assignedGenres && member.assignedGenres.length > 0
                            ? member.assignedGenres.length === GENRES.length
                              ? "All Genres"
                              : member.assignedGenres.join(", ")
                            : "Generalist (All)"}
                        </p>
                      )}
                    </div>
                    <div className="pl-4 ml-4 border-l border-border flex items-center justify-center">
                      <button
                        onClick={() => handleDelete(member.id, member.name)}
                        disabled={deletingId === member.id}
                        className="p-2 text-cm-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
                        title="Delete Account"
                      >
                        {deletingId === member.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
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
