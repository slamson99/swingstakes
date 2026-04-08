"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronUp, ChevronDown, User, Users, Download } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { formatAESTShort } from "@/lib/time";

interface Golfer {
  id: string;
  name: string;
  headshot: string;
  flag: string;
  position: string;
  score: string;
  movement: number;
  r1: string;
  r2: string;
  r3: string;
  r4: string;
  linescores: any[];
  isCut: boolean;
  status: string;
  statusObj: any;
  thru: string;
}

interface Sweeper {
  id: string;
  name: string;
  tier1: string;
  tier2: string;
  tier3: string;
  tier4: string;
  paid: boolean;
}

type SortKey = "position" | "name" | "owner" | "r1" | "r2" | "r3" | "r4" | "thru" | "score";
type SortDirection = "asc" | "desc";

export function LeaderboardView() {
  const { theme } = useTheme();
  const [golfers, setGolfers] = useState<Golfer[]>([]);
  const [sweepers, setSweepers] = useState<Sweeper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOwner, setSearchOwner] = useState("All");
  const [viewMode, setViewMode] = useState<"Individual" | "Teams">("Individual");
  const [isFinal, setIsFinal] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: "position",
    direction: "asc"
  });

  const [lastSynced, setLastSynced] = useState<string>("");

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function fetchData() {
      try {
        const [espnRes, sweepersRes] = await Promise.all([
          fetch("/api/golf-data"),
          fetch(`/api/sweepers?tournament=${theme}`)
        ]);
        
        const espnData = await espnRes.json();
        const sweepersData = await sweepersRes.json();

        if (espnData.leaderboard) setGolfers(espnData.leaderboard);
        if (espnData.lastSynced) setLastSynced(espnData.lastSynced);
        if (espnData.isFinal) setIsFinal(true);
        if (sweepersData.sweepers) setSweepers(sweepersData.sweepers);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    if (!isFinal) {
      intervalId = setInterval(fetchData, 30000); // 30 sec polling when active
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [theme, isFinal]);

  const safeRender = (val: any): string | number => {
    if (val == null) return "-";
    if (typeof val === "object") {
      return val.displayValue || val.value || val.displayName || val.name || JSON.stringify(val);
    }
    return val;
  };

  const calculateScoreValue = (rawScore: any) => {
    if (rawScore == null) return 0;
    const scoreStr = String(rawScore).trim();
    if (scoreStr === "" || scoreStr === "E") return 0;
    if (scoreStr.startsWith("+")) return parseInt(scoreStr.replace("+", ""), 10) || 0;
    if (scoreStr.startsWith("-")) return parseInt(scoreStr, 10) || 0;
    const parsed = parseInt(scoreStr, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const parseNum = (val: any) => {
    const parsed = parseInt(String(val), 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const getOwnerInfo = (golferName: string) => {
    const cleanGolfer = (golferName || "").trim().toLowerCase();
    const sweeper = sweepers.find(s => 
      (s.tier1 || "").trim().toLowerCase() === cleanGolfer ||
      (s.tier2 || "").trim().toLowerCase() === cleanGolfer ||
      (s.tier3 || "").trim().toLowerCase() === cleanGolfer ||
      (s.tier4 || "").trim().toLowerCase() === cleanGolfer
    );
    if (sweeper) {
      let tier = "";
      if ((sweeper.tier1 || "").trim().toLowerCase() === cleanGolfer) tier = "T1";
      if ((sweeper.tier2 || "").trim().toLowerCase() === cleanGolfer) tier = "T2";
      if ((sweeper.tier3 || "").trim().toLowerCase() === cleanGolfer) tier = "T3";
      if ((sweeper.tier4 || "").trim().toLowerCase() === cleanGolfer) tier = "T4";
      return { owner: sweeper.name, tier };
    }
    return { owner: "Unowned", tier: "" };
  };

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const processedGolfers = useMemo(() => {
    const list = golfers.map(g => {
      let finalScoreDisplay = g.score;
      let finalScoreVal = calculateScoreValue(g.score);
      const { owner, tier } = getOwnerInfo(g.name);
      
      const r1Num = parseNum(g.r1);
      const r2Num = parseNum(g.r2);
      const r3Num = parseNum(g.r3);
      const r4Num = parseNum(g.r4);
      let totalStrokes = r1Num + r2Num + r3Num + r4Num;
      
      if (g.isCut) {
        const missedCutStrokes = (r1Num + r2Num) * 2;
        if (missedCutStrokes > 0) {
           totalStrokes = missedCutStrokes;
           finalScoreVal = finalScoreVal * 2; 
           finalScoreDisplay = finalScoreVal > 0 ? `+${finalScoreVal}` : finalScoreVal === 0 ? "E" : `${finalScoreVal}`;
        }
      }

      let displayThru = g.thru;
      const tState = g.statusObj?.type?.state;
      const tId = g.statusObj?.type?.id;
      
      if (isFinal || tId === "3" || g.statusObj?.type?.name === "STATUS_FINAL") {
        displayThru = "F";
      } else if (tState === "in") {
        if (g.statusObj?.hole) {
          displayThru = `Hole ${g.statusObj.hole}`;
        } else if (displayThru && !displayThru.toLowerCase().includes("hole")) {
           const match = displayThru.match(/\d+/);
           if (match) displayThru = `Hole ${match[0]}`;
        }
      } else if (tState === "pre") {
        const teeTimeStr = g.statusObj?.teeTime || displayThru;
        if (teeTimeStr && teeTimeStr.includes("T") && teeTimeStr.endsWith("Z")) {
          try {
            displayThru = formatAESTShort(teeTimeStr);
          } catch(e) {
            displayThru = teeTimeStr;
          }
        } else {
          displayThru = teeTimeStr;
        }
      }

      const isActive = tState === "in" && !g.isCut && !isFinal;

      return { 
        ...g, 
        owner, 
        tier, 
        finalScoreVal, 
        finalScoreDisplay, 
        totalStrokes,
        displayThru,
        isActive,
        r1Num, r2Num, r3Num, r4Num,
        posVal: parseNum(g.position.replace('T', '')) || 999 
      };
    }).filter(g => searchOwner === "All" || g.owner === searchOwner);

    return list.sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA: any = a[key as keyof typeof a];
      let valB: any = b[key as keyof typeof b];

      if (key === "position") { valA = a.posVal; valB = b.posVal; }
      if (key === "score") { valA = a.finalScoreVal; valB = b.finalScoreVal; }
      if (key === "r1") { valA = a.r1Num; valB = b.r1Num; }
      if (key === "r2") { valA = a.r2Num; valB = b.r2Num; }
      if (key === "r3") { valA = a.r3Num; valB = b.r3Num; }
      if (key === "r4") { valA = a.r4Num; valB = b.r4Num; }
      
      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [golfers, searchOwner, sortConfig, sweepers, isFinal]);

  const teamLeaderboard = useMemo(() => {
    if (viewMode !== "Teams") return [];
    const teams = sweepers.map(sweeper => {
      const teamMates = [
        golfers.find(g => (g.name || "").trim().toLowerCase() === (sweeper.tier1 || "").trim().toLowerCase()),
        golfers.find(g => (g.name || "").trim().toLowerCase() === (sweeper.tier2 || "").trim().toLowerCase()),
        golfers.find(g => (g.name || "").trim().toLowerCase() === (sweeper.tier3 || "").trim().toLowerCase()),
        golfers.find(g => (g.name || "").trim().toLowerCase() === (sweeper.tier4 || "").trim().toLowerCase()),
      ];
      let teamAggregatePar = 0;
      let playersCounted = 0;
      let hasCutPlayer = false;
      
      const details = teamMates.map((g, index) => {
        if (!g) return { name: sweeper[`tier${index + 1}` as keyof Sweeper] as string, score: "N/A", val: 0, isCut: false, isActive: false };
        let val = calculateScoreValue(g.score);
        let display = safeRender(g.score);

        if (g.isCut) {
          hasCutPlayer = true;
          val = val * 2;
          display = val > 0 ? `+${val}*` : val === 0 ? "E*" : `${val}*`;
        }

        const tState = g.statusObj?.type?.state;
        const isActive = (tState === "in" || g.statusObj?.period > 0) && !g.isCut && !isFinal;
        
        teamAggregatePar += val;
        playersCounted++;
        return { name: g.name, score: display, val, isCut: g.isCut, isActive };
      });

      return {
        sweeperName: sweeper.name,
        paid: sweeper.paid,
        teamAggregatePar,
        teamAggregateDisplay: teamAggregatePar > 0 ? `+${teamAggregatePar}` : teamAggregatePar === 0 ? "E" : `${teamAggregatePar}`,
        playersCounted,
        hasCutPlayer,
        details
      };
    });
    return teams.sort((a, b) => a.teamAggregatePar - b.teamAggregatePar);
  }, [sweepers, golfers, viewMode, isFinal]);

  const SortIcon = ({ colKey }: { colKey: SortKey }) => {
    if (sortConfig.key !== colKey) return <span className="opacity-0 w-3 inline-block" />;
    return sortConfig.direction === "asc" ? <ChevronUp className="w-3 h-3 inline-block ml-1" /> : <ChevronDown className="w-3 h-3 inline-block ml-1" />;
  };

  const handleDownloadCSV = () => {
    const csvContent = "Golfer Name,Current Score\n"
      + processedGolfers.map(g => `"${g.name}","${g.finalScoreDisplay}"`).join("\n");
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const encodedUri = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `swingstakes_field_${theme}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(encodedUri);
  };

  if (loading) {
     return <div className="p-12 text-center animate-pulse text-xl">Loading Live Leaderboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-wider mb-2">{isFinal ? "Final Results" : "Live Leaderboard"}</h2>
          <p className="opacity-60 text-sm">Real-time data synced via ESPN. {lastSynced && `Last Synced: ${lastSynced}`}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-end flex-wrap justify-between">
          <div className="flex bg-black/20 p-1 rounded-lg border border-[var(--border)] w-full sm:w-auto mt-2 sm:mt-0">
            <button 
              onClick={() => setViewMode("Individual")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === "Individual" ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm" : "opacity-60 hover:opacity-100"}`}
            >
              <User className="w-4 h-4" /> Individuals
            </button>
            <button 
              onClick={() => setViewMode("Teams")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === "Teams" ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm" : "opacity-60 hover:opacity-100"}`}
            >
              <Users className="w-4 h-4" /> Teams
            </button>
          </div>

          <button
            onClick={handleDownloadCSV}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-black/20 border border-[var(--border)] rounded-lg text-sm font-bold hover:bg-white/5 transition-colors"
          >
            <Download className="w-4 h-4" /> CSV
          </button>

          {viewMode === "Individual" && (
            <div className="relative w-full sm:w-48 mt-2 sm:mt-0">
              <label className="text-xs uppercase tracking-widest opacity-50 mb-1 block">Filter</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 opacity-50" />
                <select 
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm md:text-base outline-none cursor-pointer"
                  value={searchOwner}
                  onChange={e => setSearchOwner(e.target.value)}
                >
                  <option value="All">All Golfers</option>
                  {sweepers.length > 0 && Array.from(new Set(sweepers.map(s => (s.name || "").trim()))).filter(Boolean).sort().map(ownerName => (
                    <option key={ownerName} value={ownerName}>{ownerName}</option>
                  ))}
                  <option value="Unowned">Unowned Field</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {viewMode === "Individual" ? (
        <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-[var(--border)] glass-panel">
          <table className="w-full text-left border-collapse min-w-max text-sm md:text-base">
            <thead>
              <tr className="bg-black/20 text-xs uppercase tracking-wider cursor-pointer">
                <th className="p-3 md:p-4 w-16 md:w-20 text-center hover:bg-white/5" onClick={() => handleSort("position")}>Pos <SortIcon colKey="position" /></th>
                <th className="p-3 md:p-4 hover:bg-white/5" onClick={() => handleSort("name")}>Golfer <SortIcon colKey="name" /></th>
                <th className="p-3 md:p-4 hidden md:table-cell hover:bg-white/5" onClick={() => handleSort("owner")}>Owner <SortIcon colKey="owner" /></th>
                <th className="p-3 md:p-4 text-center hidden md:table-cell hover:bg-white/5" onClick={() => handleSort("r1")}>R1 <SortIcon colKey="r1" /></th>
                <th className="p-3 md:p-4 text-center hidden md:table-cell hover:bg-white/5" onClick={() => handleSort("r2")}>R2 <SortIcon colKey="r2" /></th>
                <th className="p-3 md:p-4 text-center hidden md:table-cell hover:bg-white/5" onClick={() => handleSort("r3")}>R3 <SortIcon colKey="r3" /></th>
                <th className="p-3 md:p-4 text-center hidden md:table-cell hover:bg-white/5" onClick={() => handleSort("r4")}>R4 <SortIcon colKey="r4" /></th>
                <th className="p-3 md:p-4 text-center hover:bg-white/5" onClick={() => handleSort("thru")}>Thru <SortIcon colKey="thru" /></th>
                <th className="p-3 md:p-4 text-right hover:bg-white/5" onClick={() => handleSort("score")}>Score <SortIcon colKey="score" /></th>
                <th className="p-3 md:p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {processedGolfers.map((g, i) => (
                <React.Fragment key={g.id}>
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.02 }}
                    onClick={() => setExpandedRow(expandedRow === g.id ? null : g.id)}
                    className={`hover:bg-green-900/20 cursor-pointer transition-colors ${g.isCut ? "opacity-50" : ""} ${expandedRow === g.id ? "bg-white/5" : ""}`}
                  >
                    <td className="p-3 md:p-4 text-center font-bold">
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <span>{safeRender(g.position)}</span>
                        {(g.movement || 0) > 0 && <span className="text-green-400 text-[10px] flex items-center leading-none"><ChevronUp className="w-3 h-3"/>{g.movement}</span>}
                        {(g.movement || 0) < 0 && <span className="text-red-400 text-[10px] flex items-center leading-none"><ChevronDown className="w-3 h-3"/>{Math.abs(g.movement)}</span>}
                        {(g.movement || 0) === 0 && <span className="text-gray-500 text-[10px] font-mono leading-none">-</span>}
                      </div>
                    </td>
                    <td className="p-3 md:p-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <img src={g.flag} alt="flag" className="w-5 h-3 md:w-6 md:h-4 object-cover border border-black/20" onError={(e) => e.currentTarget.style.display = 'none'} />
                          <span className="font-semibold">{safeRender(g.name)}</span>
                          {g.tier && <span className="text-[9px] md:text-[10px] bg-[var(--primary)] text-[var(--primary-foreground)] px-1.5 rounded font-bold">{g.tier}</span>}
                          {g.isActive && (
                            <span className="relative flex w-1.5 h-1.5 md:w-2 md:h-2 ml-1" title="Currently Playing">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-green-500"></span>
                            </span>
                          )}
                          {g.isCut && <span className="text-[9px] md:text-[10px] bg-red-900/80 text-red-100 uppercase px-1.5 py-0.5 rounded font-bold tracking-wider">CUT</span>}
                        </div>
                        <span className="text-[10px] text-gray-400 opacity-80 block md:hidden">{safeRender(g.owner)}</span>
                      </div>
                    </td>
                    <td className="p-3 md:p-4 hidden md:table-cell font-medium opacity-80">{safeRender(g.owner)}</td>
                    <td className="p-3 md:p-4 text-center hidden md:table-cell opacity-60">{safeRender(g.r1) || "-"}</td>
                    <td className="p-3 md:p-4 text-center hidden md:table-cell opacity-60">{safeRender(g.r2) || "-"}</td>
                    <td className="p-3 md:p-4 text-center hidden md:table-cell opacity-60">{safeRender(g.r3) || "-"}</td>
                    <td className="p-3 md:p-4 text-center hidden md:table-cell opacity-60">{safeRender(g.r4) || "-"}</td>
                    <td className="p-3 md:p-4 text-center text-xs md:text-sm font-medium opacity-80">{safeRender(g.displayThru) || "-"}</td>
                    <td className={`p-3 md:p-4 text-right font-bold text-base md:text-lg ${g.finalScoreVal < 0 ? 'text-red-400' : ''}`}>
                      {g.isCut ? <span title="Missing Cut Logic: Score * 2">{safeRender(g.finalScoreDisplay)}*</span> : safeRender(g.finalScoreDisplay)}
                    </td>
                    <td className="p-3 md:p-4 text-center">
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 opacity-50 ${expandedRow === g.id ? "rotate-180" : ""}`} />
                    </td>
                  </motion.tr>

                  <AnimatePresence>
                    {expandedRow === g.id && g.linescores && g.linescores.length > 0 && (
                      <tr className="bg-black/30 border-b border-[var(--border)] overflow-hidden">
                        <td colSpan={10} className="p-0">
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: "auto", opacity: 1 }} 
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="p-4 md:p-6"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm w-full">
                              {g.linescores.map((ls, idx) => (
                                <div key={idx} className="bg-black/40 rounded-lg p-3 border border-white/5 shadow-inner">
                                  <div className="text-xs uppercase tracking-wider opacity-60 mb-2 font-bold border-b border-white/10 pb-1">Round {ls.period}</div>
                                  <div className="flex justify-between items-center mb-1 text-gray-300">
                                    <span className="opacity-70">Front 9:</span>
                                    <span className="font-mono bg-black/30 px-2 rounded">{ls.outScore || "-"}</span>
                                  </div>
                                  <div className="flex justify-between items-center mb-2 text-gray-300">
                                    <span className="opacity-70">Back 9:</span>
                                    <span className="font-mono bg-black/30 px-2 rounded">{ls.inScore || "-"}</span>
                                  </div>
                                  <div className="flex justify-between items-center pt-2 border-t border-white/10 mt-2">
                                    <span className="font-bold opacity-90 uppercase text-[10px] tracking-wider">Total</span>
                                    <span className="font-black text-[var(--primary)] text-right">{ls.value || "-"}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
              {processedGolfers.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-12 text-center opacity-50">No golfers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teamLeaderboard.map((team, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={team.sweeperName} 
              className={`glass-panel p-6 rounded-xl border-l-[6px] ${idx === 0 && team.teamAggregatePar < 0 ? 'border-l-[var(--primary)]' : 'border-l-[var(--border)]'}`}
            >
              <div className="flex justify-between items-start border-b border-[var(--border)] pb-4 mb-4">
                <div>
                  <div className="text-xs uppercase tracking-wider opacity-50 mb-1 flex items-center gap-2">
                    Pos {idx + 1}
                    {team.hasCutPlayer && <span className="bg-red-900/80 text-red-100 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">⚠️ Missed Cut</span>}
                  </div>
                  <h3 className="text-xl font-bold">{team.sweeperName}</h3>
                </div>
                <div className={`text-3xl font-black ${team.teamAggregatePar < 0 ? 'text-[var(--primary)]' : ''}`}>
                  {team.teamAggregateDisplay}
                </div>
              </div>

              <div className="space-y-3">
                {team.details.map((d, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                       <span className="opacity-50 text-[10px]">T{i+1}</span>
                       <span className={`font-medium truncate max-w-[120px] ${d.isCut ? 'text-red-400 opacity-60 line-through' : ''}`} title={d.name}>{d.name}</span>
                       {d.isActive && (
                          <span className="relative flex w-1.5 h-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                          </span>
                       )}
                    </div>
                    <span className={`font-bold font-mono ${d.isCut ? 'text-red-400 opacity-60' : ''}`}>{d.score}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
