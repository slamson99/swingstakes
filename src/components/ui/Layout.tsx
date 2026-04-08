"use client";

import React, { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Settings, BarChart2, Award, DollarSign } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function StandardLayout({ children, currentTab, setCurrentTab }: { children: React.ReactNode, currentTab: string, setCurrentTab: (t: string) => void }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center opacity-10">
        <div className="w-[80vw] h-[80vw] bg-[var(--primary)] rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <nav className="relative z-10 glass-panel border-b px-6 py-4 flex items-center justify-between sticky top-0">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black tracking-tight uppercase" style={{ color: "var(--primary)" }}>
            Swingstakes
          </h1>
          <select 
            className="ml-4 bg-transparent border border-[var(--border)] rounded px-3 py-1 text-sm outline-none cursor-pointer focus:ring-2 focus:ring-[var(--primary)]"
            value={theme}
            onChange={(e: any) => setTheme(e.target.value)}
          >
            <option value="masters">The Masters</option>
            <option value="pga">PGA Championship</option>
            <option value="usopen">US Open</option>
            <option value="open">The Open</option>
          </select>
        </div>
        
        <div className="flex items-center gap-8 text-sm font-medium">
          <button 
            onClick={() => setCurrentTab("leaderboard")}
            className={`flex items-center gap-2 transition-all ${currentTab === "leaderboard" ? "text-[var(--primary)]" : "opacity-60 hover:opacity-100"}`}
          >
            <BarChart2 className="w-4 h-4" /> Leaderboard
          </button>
          <button 
            onClick={() => setCurrentTab("payouts")}
            className={`flex items-center gap-2 transition-all ${currentTab === "payouts" ? "text-[var(--primary)]" : "opacity-60 hover:opacity-100"}`}
          >
            <DollarSign className="w-4 h-4" /> Payouts
          </button>
          <button 
            onClick={() => setCurrentTab("halloffame")}
            className={`flex items-center gap-2 transition-all ${currentTab === "halloffame" ? "text-[var(--primary)]" : "opacity-60 hover:opacity-100"}`}
          >
            <Award className="w-4 h-4" /> Hall of Fame
          </button>
          
          <div className="w-px h-6 bg-[var(--border)] mx-2" />
          
          <Link href="/admin" className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-all">
            <Settings className="w-4 h-4" /> Admin
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex-1 p-2 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
