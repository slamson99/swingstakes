"use client";

import React from "react";
import { motion } from "framer-motion";
import { mockHallOfFame } from "@/lib/mock-data";
import { Trophy, Star, Medal } from "lucide-react";

export function HallOfFameView() {
  return (
    <div className="space-y-8 pb-12">
      <div className="text-center space-y-4 pt-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full p-4 mb-4 shadow-lg shadow-[var(--primary)]/20"
        >
          <Trophy size={48} />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-black uppercase tracking-widest text-[var(--foreground)] drop-shadow-md"
        >
          Hall of Fame
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg opacity-80 max-w-2xl mx-auto"
        >
          A historical record of legendary sweeps, heroic team victories, and infamous tragedies across the majors.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {mockHallOfFame.map((entry, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
          >
            <div className="absolute -right-6 -top-6 text-[var(--primary)] opacity-10 group-hover:opacity-20 transition-opacity">
              <Medal size={120} />
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">{entry.major}</h3>
              <span className="text-[var(--primary)] font-black text-xl">{entry.year}</span>
            </div>

            <div className="space-y-4 relative z-10">
              {entry.indiWinner && (
                <div className="flex items-start gap-3">
                  <Trophy className="w-5 h-5 mt-1 text-[var(--primary)]" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-60">Indi Winner</p>
                    <p className="font-semibold text-[1.1rem] leading-tight">{entry.indiWinner}</p>
                  </div>
                </div>
              )}
              
              {entry.teamWinner && (
                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 mt-1 text-[var(--primary)]" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-60">Team Winner</p>
                    <p className="font-semibold text-[1.1rem] leading-tight">{entry.teamWinner}</p>
                  </div>
                </div>
              )}

              <div className="h-px bg-[var(--border)] my-4 w-full" />

              {entry.indiRunner && (
                 <div className="flex justify-between items-center text-sm">
                   <span className="opacity-60">Runner Up</span>
                   <span className="font-medium text-right">{entry.indiRunner}</span>
                 </div>
              )}

              {entry.noteable && (
                 <div className="flex justify-between items-center text-sm">
                   <span className="opacity-60">Noteable</span>
                   <span className="font-medium italic text-right break-words w-48">{entry.noteable}</span>
                 </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
