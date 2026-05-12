"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, ExternalLink, Music, User, History, Send, ChevronRight } from "lucide-react";

interface Artist {
  id: string;
  artistName: string;
  genre: string | null;
  subgenre: string | null;
  spotifyUrl: string | null;
  instagram: string | null;
  createdAt: any;
}

interface Props {
  artists: Artist[];
  locale: string;
}

export default function IndustryArtistsClient({ artists, locale }: Props) {
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(
    artists.length > 0 ? artists[0].id : null
  );

  const selectedArtist = artists.find(a => a.id === selectedArtistId);

  return (
    <div className="flex h-[calc(100vh-160px)] -mt-8 -mx-8 overflow-hidden">
      {/* Sidebar: Artist List */}
      <div className="w-80 bg-black border-r-4 border-white/10 flex flex-col h-full overflow-hidden">
        <div className="p-8 border-b-4 border-white/10 bg-[#F5E000] text-black flex justify-between items-center">
          <h2 className="font-sans text-2xl font-black uppercase tracking-tighter">ROSTER</h2>
          <Link 
            href={`/${locale}/industry/artists/new`}
            className="w-10 h-10 bg-black text-[#F5E000] flex items-center justify-center border-2 border-black hover:scale-110 transition-transform"
          >
            <PlusCircle size={20} strokeWidth={3} />
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {artists.map((artist) => (
            <button
              key={artist.id}
              onClick={() => setSelectedArtistId(artist.id)}
              className={`w-full text-left p-6 border-b-2 border-white/5 transition-all flex items-center justify-between group ${
                selectedArtistId === artist.id ? "bg-[#F5E000] text-black border-l-[12px] border-l-black pl-3" : "hover:bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              <div className="min-w-0">
                <p className="font-sans text-lg font-black uppercase tracking-tighter truncate leading-none mb-1">
                  {artist.artistName}
                </p>
                <p className={`font-sans text-[9px] font-bold uppercase tracking-widest truncate ${selectedArtistId === artist.id ? 'text-black/60' : 'text-black/40 group-hover:text-white/60'}`}>
                  {artist.genre || "GENERALIST"}
                </p>
              </div>
              <ChevronRight size={16} className={selectedArtistId === artist.id ? "opacity-100 text-black" : "opacity-0 group-hover:opacity-100"} />
            </button>
          ))}
          
          {artists.length === 0 && (
            <div className="p-10 text-center text-white/20">
              <p className="font-sans text-[10px] font-black uppercase tracking-widest italic">Empty Roster</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Panel: Artist Details */}
      <div className="flex-1 bg-black overflow-y-auto p-12">
        {!selectedArtist ? (
          <div className="h-full flex items-center justify-center text-white/10">
            <div className="text-center">
              <User size={64} strokeWidth={3} className="mx-auto mb-4 opacity-10" />
              <p className="font-sans text-xl font-black uppercase tracking-tighter">SELECT AN ARTIST</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl space-y-12 animate-reveal">
            {/* Artist Header Card */}
            <div className="bg-black border-4 border-white/10 p-10 shadow-[12px_12px_0px_0px_rgba(245,224,0,0.1)]">
              <div className="flex items-start justify-between mb-8">
                <div className="w-24 h-24 bg-black flex items-center justify-center text-[#F5E000] shadow-[6px_6px_0px_0px_rgba(245,224,0,1)]">
                  <Music size={48} strokeWidth={3} />
                </div>
                <div className="flex gap-4">
                  {selectedArtist.spotifyUrl && (
                    <a href={selectedArtist.spotifyUrl} target="_blank" className="btn-secondary !p-3">
                      <ExternalLink size={20} />
                    </a>
                  )}
                  <Link href={`/${locale}/industry/artists/${selectedArtist.id}`} className="btn-primary !px-6 !text-[10px]">
                    EDIT PROFILE
                  </Link>
                </div>
              </div>
              
              <h1 className="font-sans text-6xl font-black text-white tracking-tighter uppercase leading-none mb-2">
                {selectedArtist.artistName}
              </h1>
              <p className="font-sans text-xs font-black uppercase tracking-[0.3em] text-white/40">
                {selectedArtist.genre} {selectedArtist.subgenre ? `· ${selectedArtist.subgenre}` : ""}
              </p>
            </div>

            {/* Quick Stats / Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black border-4 border-white/10 p-6 shadow-[8px_8px_0px_0px_rgba(245,224,0,0.05)]">
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">TOTAL SUBMISSIONS</p>
                <p className="text-4xl font-black text-white">0</p>
              </div>
              <div className="bg-black border-4 border-white/10 p-6 shadow-[8px_8px_0px_0px_rgba(245,224,0,0.05)]">
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">ACTIVE CAMPAIGNS</p>
                <p className="text-4xl font-black text-[#F5E000]">0</p>
              </div>
              <div className="bg-black border-4 border-white/10 p-6 shadow-[8px_8px_0px_0px_rgba(245,224,0,0.05)]">
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">SUCCESS RATE</p>
                <p className="text-4xl font-black text-white">0%</p>
              </div>
            </div>

            {/* Main Tabs / Content */}
            <div className="space-y-8">
              <div className="flex gap-4 border-b-4 border-white/10">
                <button className="px-6 py-4 bg-[#F5E000] text-black font-black text-xs uppercase tracking-widest">
                  RECENT SUBMISSIONS
                </button>
                <button className="px-6 py-4 bg-black text-white/40 font-black text-xs uppercase tracking-widest hover:text-white transition-opacity">
                  PERFORMANCE
                </button>
              </div>

              <div className="bg-black border-4 border-white/10 p-10 min-h-[300px] flex flex-col items-center justify-center text-center shadow-[8px_8px_0px_0px_rgba(245,224,0,0.05)]">
                <Send size={48} className="text-white/10 mb-4" />
                <p className="font-sans text-sm font-black uppercase tracking-widest text-white/20 mb-8">
                  NO SUBMISSIONS RECORDED FOR THIS ARTIST.
                </p>
                <Link 
                  href={`/${locale}/industry/submit?artistId=${selectedArtist.id}`}
                  className="btn-primary"
                >
                  SUBMIT TRACK NOW
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
