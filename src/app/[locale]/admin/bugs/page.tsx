"use client";

import { useEffect, useState } from "react";
import { Loader2, Bug, CheckCircle, ExternalLink } from "lucide-react";

type BugReport = {
  id: string;
  description: string;
  url: string | null;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  adminNotes: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
    artistName: string | null;
    accountType: string;
  };
};

export default function AdminBugsPage() {
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBugs = async () => {
    try {
      const res = await fetch("/api/bugs");
      if (res.ok) {
        const data = await res.json();
        setBugs(data.bugs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugs();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/bugs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchBugs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin text-[#F5E000]" size={48} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-reveal space-y-8">
      <div className="flex justify-between items-end border-b-2 border-white/10 pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white">BUG REPORTS</h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2">Manage user-reported issues</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {bugs.length === 0 ? (
          <div className="text-center p-12 border-2 border-white/10 bg-white/5">
            <CheckCircle className="mx-auto text-white/20 mb-4" size={48} />
            <p className="font-black text-white/40 uppercase">No bugs reported!</p>
          </div>
        ) : (
          bugs.map((bug) => (
            <div key={bug.id} className="border-2 border-white/10 bg-black p-6 flex flex-col md:flex-row gap-6 justify-between items-start">
              <div className="space-y-4 max-w-3xl">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest ${
                    bug.status === "OPEN" ? "bg-red-500 text-white" :
                    bug.status === "IN_PROGRESS" ? "bg-[#F5E000] text-black" :
                    "bg-white/10 text-white"
                  }`}>
                    {bug.status}
                  </span>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">
                    {new Date(bug.createdAt).toLocaleString()}
                  </span>
                </div>
                
                <p className="text-sm text-white/90 whitespace-pre-wrap font-mono bg-white/5 p-4 border border-white/10">
                  {bug.description}
                </p>
                
                <div className="text-[10px] font-bold text-white/50 space-y-1">
                  <p>REPORTER: {bug.user.name || bug.user.artistName || "Unknown"} ({bug.user.email}) - {bug.user.accountType}</p>
                  {bug.url && (
                    <p className="flex items-center gap-1">
                      URL: <a href={bug.url} target="_blank" className="text-[#F5E000] hover:underline flex items-center gap-1">{bug.url} <ExternalLink size={10} /></a>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 min-w-[200px] w-full md:w-auto">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Update Status</p>
                <select 
                  className="bg-black border-2 border-white/20 text-xs font-bold uppercase p-2 text-white w-full focus:outline-none focus:border-[#F5E000]"
                  value={bug.status}
                  onChange={(e) => handleUpdateStatus(bug.id, e.target.value)}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
