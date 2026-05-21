import { Loader2, Send, Link2 } from "lucide-react";

interface Props {
  publishModalId: string | null;
  setPublishModalId: (id: string | null) => void;
  publicationUrl: string;
  setPublicationUrl: (url: string) => void;
  publishError: string | null;
  publishLoading: boolean;
  handlePublish: () => void;
}

export function PublishModal({
  publishModalId,
  setPublishModalId,
  publicationUrl,
  setPublicationUrl,
  publishError,
  publishLoading,
  handlePublish,
}: Props) {
  if (!publishModalId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
      <div className="bg-black border-4 border-[#F5E000] p-10 w-full max-w-md shadow-[12px_12px_0px_0px_rgba(245,224,0,0.2)]">
        <h2 className="font-sans text-2xl font-black uppercase tracking-tighter text-white mb-2">
          MARK AS PUBLISHED
        </h2>
        <p className="font-sans text-[10px] font-black uppercase tracking-widest text-white/40 mb-8">
          Enter the publication link (Instagram post, Spotify playlist, etc.)
        </p>
        <div className="flex items-center gap-3 bg-white/5 border-2 border-white/10 focus-within:border-[#F5E000] transition-all mb-4">
          <Link2 size={16} className="ml-4 text-white/40 shrink-0" strokeWidth={2.5} />
          <input
            type="url"
            value={publicationUrl}
            onChange={(e) => setPublicationUrl(e.target.value)}
            placeholder="https://instagram.com/p/..."
            className="w-full p-4 bg-transparent font-sans text-sm font-bold text-white placeholder:text-white/20 focus:outline-none"
            autoFocus
          />
        </div>
        {publishError && (
          <p className="font-sans text-[10px] font-black uppercase tracking-widest text-[#FF0000] mb-4">
            {publishError}
          </p>
        )}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => {
              setPublishModalId(null);
              setPublicationUrl("");
            }}
            className="flex-1 py-4 bg-white/10 text-white font-sans font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all"
          >
            CANCEL
          </button>
          <button
            onClick={handlePublish}
            disabled={!publicationUrl || publishLoading}
            className="flex-1 py-4 bg-[#F5E000] text-black font-sans font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {publishLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <Send size={14} strokeWidth={3} /> CONFIRM
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
