"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { mockDraft, mockParticipants } from "@/lib/mock-data";
import { Search } from "lucide-react";

interface Golfer {
  id: string;
  name: string;
  headshot: string;
  flag: string;
  position: string;
  score: string;
  r1: string;
  r2: string;
  r3: string;
  r4: string;
  isCut: boolean;
  status: string;
  thru: string;
}

export function LeaderboardView() {
  const [golfers, setGolfers] = useState<Golfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOwner, setSearchOwner] = useState("All");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/golf-data");
        const json = await res.json();
        if (json.leaderboard) {
          setGolfers(json.leaderboard);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const calculateScoreValue = (scoreStr: string) => {
    if (!scoreStr || scoreStr === "E") return 0;
    if (scoreStr.startsWith("+")) return parseInt(scoreStr.replace("+", ""));
    if (scoreStr.startsWith("-")) return parseInt(scoreStr);
    return 0; // fallback if it's "CUT" from espn, but we use the isCut flag
  };

  const getOwnerName = (golferName: string) => {
    const draft = mockDraft.find(d => d.golfers.includes(golferName));
    if (draft) {
      const p = mockParticipants.find(p => p.id === draft.participantId);
      return p ? p.name : "Unowned";
    }
    return "Unowned";
  };

  const parseScore = (s: string) => parseInt(s) || 0;

  // Process mapping for individual golfers, adding missed cut logic visually
  const processedGolfers = useMemo(() => {
    return golfers.map(g => {
      let finalScoreDisplay = g.score;
      let finalScoreVal = calculateScoreValue(g.score);
      const owner = getOwnerName(g.name);
      
      // If cut, we simulate their final score: (r1 + r2) * 2 - (Par * 4)
      // Since ESPN 'score' relative to par might stop updating, we can display exactly what the rule says:
      // (R1+R2)*2. If Par is 72, Par for 4 rounds is 288.
      // (R1+R2) * 2 - 288 = Final Relation to Par.
      // Let's assume par is 72 for now, or just use the ESPN score but add a penalty... 
      // Actually, if we just multiply their relative "E/+2" by 2, it works roughly assuming they played par the second two days! 
      // But the math: (r1 + r2) * 2 is exact.
      
      let missedCutSimulatedPar = finalScoreVal; // exact calculation needs the course par. 
      // Fast approx for missed cut relation to par: Double their current relative score if they missed cut after 2 rounds.
      if (g.isCut) {
        finalScoreVal = finalScoreVal * 2; 
        finalScoreDisplay = finalScoreVal > 0 ? `+${finalScoreVal}` : finalScoreVal === 0 ? "E" : `${finalScoreVal}`;
      }

      return { ...g, owner, finalScoreVal, finalScoreDisplay };
    }).filter(g => searchOwner === "All" || g.owner === searchOwner);
  }, [golfers, searchOwner]);

  if (loading) {
     return <div className="p-12 text-center animate-pulse text-xl">Loading Live Leaderboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-wider mb-2">Live Leaderboard</h2>
          <p className="opacity-60 text-sm">Real-time data synced via ESPN.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <label className="text-xs uppercase tracking-widest opacity-50 mb-1 block">Filter by Owner</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 opacity-50" />
            <select 
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              value={searchOwner}
              onChange={e => setSearchOwner(e.target.value)}
            >
              <option value="All">All Golfers</option>
              {mockParticipants.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
              <option value="Unowned">Unowned Field</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] glass-panel">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/20 text-xs uppercase tracking-wider">
              <th className="p-4 w-16 text-center">Pos</th>
              <th className="p-4">Golfer</th>
              <th className="p-4 hidden md:table-cell">Owner</th>
              <th className="p-4 text-center">R1</th>
              <th className="p-4 text-center">R2</th>
              <th className="p-4 text-center">R3</th>
              <th className="p-4 text-center">R4</th>
              <th className="p-4 text-center">Thru</th>
              <th className="p-4 text-right font-bold text-[var(--primary)]">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {processedGolfers.map((g, i) => (
              <motion.tr 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.02 }}
                key={g.id} 
                className={`hover:bg-white/5 transition-colors ${g.isCut ? "opacity-50" : ""}`}
              >
                <td className="p-4 text-center font-bold">{g.position}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={g.flag} alt="flag" className="w-6 h-4 object-cover border border-black/20" onError={(e) => e.currentTarget.style.display = 'none'} />
                    <span className="font-semibold">{g.name}</span>
                    {g.isCut && <span className="text-[10px] bg-red-900/50 text-red-200 uppercase px-2 py-0.5 rounded-full font-bold ml-2">CUT</span>}
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell font-medium opacity-80">{g.owner}</td>
                <td className="p-4 text-center opacity-60">{g.r1 || "-"}</td>
                <td className="p-4 text-center opacity-60">{g.r2 || "-"}</td>
                <td className="p-4 text-center opacity-60">{g.r3 || "-"}</td>
                <td className="p-4 text-center opacity-60">{g.r4 || "-"}</td>
                <td className="p-4 text-center text-sm">{g.thru || "-"}</td>
                <td className={`p-4 text-right font-bold text-lg ${g.finalScoreVal < 0 ? 'text-red-400' : ''}`}>
                  {g.isCut ? <span title="Missing Cut Logic: (R1+R2)*2">{g.finalScoreDisplay}*</span> : g.finalScoreDisplay}
                </td>
              </motion.tr>
            ))}
            {processedGolfers.length === 0 && (
              <tr>
                <td colSpan={9} className="p-12 text-center opacity-50">No golfers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
