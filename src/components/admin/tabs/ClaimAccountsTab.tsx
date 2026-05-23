"use client";

import { Loader2, BadgeCheck, X, UserCheck } from "lucide-react";
import { SectionHeader } from "../AdminShared";

interface Props {
  claimAccounts: any[];
  claimTotal: number;
  claimLoading: boolean;
  claimSearch: string;
  setClaimSearch: (v: string) => void;
  claimPage: number;
  setClaimPage: (p: number | ((prev: number) => number)) => void;
  claimLimit: number;
  approvedResult: { email: string; tempPassword: string } | null;
  setApprovedResult: (result: { email: string; tempPassword: string } | null) => void;
  processingId: string | null;
  handleClaimAction: (userId: string, action: "APPROVE" | "REJECT") => void;
}

export default function ClaimAccountsTab({
  claimAccounts,
  claimTotal,
  claimLoading,
  claimSearch,
  setClaimSearch,
  claimPage,
  setClaimPage,
  claimLimit,
  approvedResult,
  setApprovedResult,
  processingId,
  handleClaimAction,
}: Props) {
  return (
    <div className="space-y-10 animate-reveal">
      <SectionHeader
        icon={UserCheck}
        title="CLAIM ACCOUNTS"
        subtitle="Cuentas importadas desde legacy esperando ser reclamadas"
      />

      {/* Approved password modal */}
      {approvedResult && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-8">
          <div className="bg-black border-4 border-[#F5E000] p-10 max-w-md w-full space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-black text-xs uppercase tracking-[0.3em] text-[#F5E000] mb-2">
                  CUENTA ACTIVADA
                </p>
                <p className="font-black text-2xl text-white">
                  {approvedResult.email}
                </p>
              </div>
              <button
                onClick={() => setApprovedResult(null)}
                className="text-white/40 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="border-4 border-white/10 p-6 bg-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                CONTRASEÑA TEMPORAL
              </p>
              <p className="font-black text-3xl text-[#F5E000] tracking-widest">
                {approvedResult.tempPassword}
              </p>
            </div>
            <p className="text-xs text-white/40 font-bold uppercase tracking-widest leading-relaxed">
              Comparte esta contraseña con el artista. Deberá cambiarla en su primer login.
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(approvedResult.tempPassword);
              }}
              className="w-full py-4 bg-[#F5E000] text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-white transition-all"
            >
              COPIAR CONTRASEÑA
            </button>
          </div>
        </div>
      )}

      {claimLoading && claimAccounts.length === 0 ? (
        <div className="flex items-center gap-4 py-16 text-white">
          <Loader2 size={32} className="animate-spin" />
          <span className="font-black uppercase tracking-widest text-sm">
            CARGANDO...
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
              {claimTotal} cuenta{claimTotal !== 1 ? "s" : ""} pendiente
              {claimTotal !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-4 w-full md:w-1/3">
              <input
                type="text"
                placeholder="BUSCAR CORREO..."
                value={claimSearch}
                onChange={(e) => {
                  setClaimSearch(e.target.value);
                  setClaimPage(1); // Reset to first page on search
                }}
                className="w-full p-4 border-2 border-white/10 bg-black text-white font-black text-xs uppercase placeholder:text-white/20 focus:border-[#F5E000] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {claimAccounts.length === 0 ? (
            <div className="border-4 border-white/10 p-16 text-center">
              <BadgeCheck size={48} className="mx-auto mb-4 text-[#00FF00]" />
              <p className="font-black text-xl uppercase tracking-tighter text-white">
                SIN RESULTADOS
              </p>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mt-2">
                No se encontraron cuentas con esos filtros.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4 relative">
                {claimLoading && (
                  <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-[#F5E000]" />
                  </div>
                )}
                {claimAccounts.map((u) => (
                  <div
                    key={u.id}
                    className="border-4 border-white/10 p-6 bg-black flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#F5E000]/30 transition-colors relative z-0"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-lg text-white">
                          {u.artistName || u.name || "Sin Nombre"}
                        </span>
                        <span className="px-2 py-0.5 bg-[#F5E000]/20 text-[#F5E000] text-[9px] font-black uppercase tracking-widest">
                          PENDING CLAIM
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white/50">{u.email}</p>
                      <div className="flex gap-6 text-[9px] font-black uppercase tracking-widest text-white/30 mt-2">
                        {u.country && (
                          <span>
                            {u.country}
                            {u.city ? `, ${u.city}` : ""}
                          </span>
                        )}
                        {u.genre && <span>{u.genre}</span>}
                        <span>
                          {u._count?.submissions ?? 0} submission
                          {(u._count?.submissions ?? 0) !== 1 ? "s" : ""}
                        </span>
                        <span>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <button
                        id={`admin-approve-${u.id}`}
                        onClick={() => handleClaimAction(u.id, "APPROVE")}
                        disabled={processingId === u.id || claimLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-[#00FF00] text-black font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
                      >
                        {processingId === u.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <BadgeCheck size={14} />
                        )}
                        APROBAR
                      </button>
                      <button
                        id={`admin-reject-${u.id}`}
                        onClick={() => handleClaimAction(u.id, "REJECT")}
                        disabled={processingId === u.id || claimLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-[#FF0000] text-white font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50"
                      >
                        <X size={14} />
                        RECHAZAR
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {claimTotal > claimLimit && (
                <div className="flex items-center justify-between border-t-2 border-white/10 pt-6 mt-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    MOSTRANDO {(claimPage - 1) * claimLimit + 1} -{" "}
                    {Math.min(claimPage * claimLimit, claimTotal)} DE {claimTotal}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setClaimPage((p) => Math.max(1, p - 1))}
                      disabled={claimPage === 1 || claimLoading}
                      className="px-6 py-3 border-2 border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:border-[#F5E000] hover:text-[#F5E000] disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-white transition-colors"
                    >
                      ANTERIOR
                    </button>
                    <button
                      onClick={() =>
                        setClaimPage((p) =>
                          p * claimLimit < claimTotal ? p + 1 : p
                        )
                      }
                      disabled={
                        claimPage * claimLimit >= claimTotal || claimLoading
                      }
                      className="px-6 py-3 border-2 border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:border-[#F5E000] hover:text-[#F5E000] disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-white transition-colors"
                    >
                      SIGUIENTE
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
