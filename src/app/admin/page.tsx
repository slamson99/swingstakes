"use client";

import React, { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Settings, Lock, ArrowLeft, Shuffle } from "lucide-react";
import Link from "next/link";
import { mockParticipants } from "@/lib/mock-data";
import { motion } from "framer-motion";

export default function AdminPage() {
  const { theme } = useTheme();
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [draftOutput, setDraftOutput] = useState<any[] | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "swings" || password === "admin") {
      setUnlocked(true);
    } else {
      alert("Incorrect password");
    }
  };

  // 4-Tier randomly allocated Golfer drafting algorithm
  // Rules: 20 Participants. 80 Golfers Field divided into 4 Tiers of 20.
  // Each Participant MUST manually receive EXACTLY one Tier 1, one Tier 2, one Tier 3, one Tier 4.
  const handleDraftGeneration = () => {
    // Generate dummy field for demonstration of logic
    const tiers = {
      1: Array.from({length: 20}).map((_,i) => `T1 Golfer ${i+1}`),
      2: Array.from({length: 20}).map((_,i) => `T2 Golfer ${i+1}`),
      3: Array.from({length: 20}).map((_,i) => `T3 Golfer ${i+1}`),
      4: Array.from({length: 20}).map((_,i) => `T4 Golfer ${i+1}`)
    };

    // Fisher-Yates Shuffle
    const shuffleArray = (array: any[]) => {
      let currentIndex = array.length,  randomIndex;
      while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
      }
      return array;
    };

    const shuffledT1 = shuffleArray([...tiers[1]]);
    const shuffledT2 = shuffleArray([...tiers[2]]);
    const shuffledT3 = shuffleArray([...tiers[3]]);
    const shuffledT4 = shuffleArray([...tiers[4]]);

    const newDraft = mockParticipants.map((p, index) => {
      return {
        participant: p.name,
        golfers: [
          shuffledT1[index],
          shuffledT2[index],
          shuffledT3[index],
          shuffledT4[index]
        ]
      };
    });

    setDraftOutput(newDraft);
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center opacity-10">
          <div className="w-[80vw] h-[80vw] bg-[var(--primary)] rounded-full blur-[120px] mix-blend-screen" />
        </div>
        <form onSubmit={handleLogin} className="glass-panel p-8 rounded-2xl max-w-sm w-full relative z-10 space-y-6 text-center border border-[var(--border)]">
          <Lock className="w-12 h-12 mx-auto text-[var(--primary)]" />
          <h2 className="text-2xl font-black uppercase tracking-wider">Admin Area</h2>
          <p className="opacity-60 text-sm">Enter the commissioner password.</p>
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-black/20 border border-[var(--border)] rounded px-4 py-3 outline-none focus:border-[var(--primary)] text-center transition-colors font-medium"
            placeholder="..."
          />
          <button type="submit" className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] font-bold py-3 rounded hover:opacity-90 transition-opacity uppercase tracking-widest text-sm">
            Unlock
          </button>
          <Link href="/" className="inline-block mt-4 text-xs opacity-60 hover:opacity-100 flex items-center justify-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back to Dashboard
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col p-6 max-w-5xl mx-auto space-y-12 pb-24">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center opacity-5">
        <div className="w-[80vw] h-[80vw] bg-[var(--primary)] rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <header className="relative z-10 mt-8 flex justify-between items-center bg-black/20 p-6 rounded-2xl border border-[var(--border)]">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-[var(--primary)] flex items-center gap-3">
            <Settings /> Commissioner Panel
          </h1>
          <p className="opacity-60 text-sm mt-1">Manage sweeps, runs, rules and overrides.</p>
        </div>
        <Link href="/" className="px-4 py-2 bg-black/20 border border-[var(--border)] rounded-lg hover:bg-white/5 transition-colors flex gap-2 items-center text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Exit
        </Link>
      </header>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tier Auto-Draft Box */}
        <section className="glass-panel p-6 rounded-2xl border border-[var(--border)]">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-[var(--border)] pb-4">
            <Shuffle className="text-[var(--primary)]" /> Trigger Auto-Draft
          </h2>
          <p className="text-sm opacity-70 mb-6 leading-relaxed">
            This module applies the strict 4-tier randomization rule. Provide the field (synced via Google Sheets) and click calculate to allocate exactly ONE golfer from each tier to all 20 participants.
          </p>
          <button 
            onClick={handleDraftGeneration}
            className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] font-bold uppercase tracking-widest text-sm py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-[var(--primary)]/20"
          >
            Run Draft Randomizer
          </button>
        </section>

        {/* Database Config */}
        <section className="glass-panel p-6 rounded-2xl border border-[var(--border)] opacity-60">
          <h2 className="text-xl font-bold mb-4 border-b border-[var(--border)] pb-4">Google Sheet Syncer</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest opacity-50 block mb-1">Sheet ID</label>
              <input disabled type="text" value="1A2B3C4D5E... (env.local)" className="w-full bg-black/20 border border-[var(--border)] rounded p-2 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest opacity-50 block mb-1">Force Sync Tiers</label>
              <button disabled className="px-4 py-2 border border-[var(--border)] bg-black/20 rounded text-sm w-full font-medium">Pull Tiers Tab</button>
            </div>
            <p className="text-xs text-[var(--primary)]">Only active in Production with valid Auth Keys.</p>
          </div>
        </section>
      </div>

      {draftOutput && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 glass-panel p-6 rounded-2xl border border-[var(--border)]">
          <h3 className="text-lg font-bold mb-4 uppercase tracking-widest">Draft Output Result</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {draftOutput.map((d, i) => (
              <div key={i} className="bg-black/20 border border-[var(--border)] p-4 rounded-lg">
                <p className="font-bold border-b border-[var(--border)] pb-2 mb-2 text-[var(--primary)]">{d.participant}</p>
                <ul className="text-sm space-y-1 opacity-80 list-disc list-inside">
                  {d.golfers.map((g: string, j: number) => (
                    <li key={j}>{g}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <button className="mt-8 px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold rounded hover:opacity-90 transition-opacity">Push Draft to Sheets</button>
        </motion.div>
      )}

    </div>
  );
}
