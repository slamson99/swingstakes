"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { mockParticipants } from "@/lib/mock-data";
import { CheckCircle2, Circle, DollarSign, Users, Award, Target } from "lucide-react";

export function PayoutsView() {
  const [participants, setParticipants] = useState(mockParticipants);
  const [hioHit, setHioHit] = useState(false);

  const togglePaid = (id: string) => {
    setParticipants(p => p.map(x => x.id === id ? { ...x, paid: !x.paid } : x));
  };

  const totalPot = participants.length * 50; // assuming $50 entry
  const baseWinner = 500;
  const runnerUp = 250;
  const teamTotal = 200;
  const hioPrize = 50;

  const actualWinnerPrize = hioHit ? baseWinner : baseWinner + hioPrize;

  const paidCount = participants.filter(p => p.paid).length;
  const totalCollected = paidCount * 50;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Payments Tracker */}
        <div className="flex-1 glass-panel p-6 rounded-2xl border border-[var(--border)]">
          <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
            <DollarSign className="text-[var(--primary)]" />
            Entry Fee Tracking
          </h3>
          <p className="text-sm opacity-60 mb-6">Track who has paid their $50 entry fee.</p>

          <div className="mb-6 bg-black/20 p-4 rounded-xl border border-[var(--border)]">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="opacity-60 uppercase tracking-wider font-bold">Collected</span>
              <span className="font-bold">${totalCollected} / ${totalPot}</span>
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--primary)] transition-all duration-500" 
                style={{ width: `${(paidCount / participants.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
            {participants.map(p => (
              <button 
                key={p.id}
                onClick={() => togglePaid(p.id)}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${p.paid ? "bg-[var(--primary)]/10 border-[var(--primary)]/50" : "bg-black/20 border-[var(--border)] hover:bg-white/5"}`}
              >
                <span className={`font-medium ${p.paid ? "" : "opacity-70"}`}>{p.name}</span>
                {p.paid ? <CheckCircle2 className="text-[var(--primary)] w-5 h-5" /> : <Circle className="opacity-30 w-5 h-5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Live Payout Simulator */}
        <div className="flex-1 glass-panel p-6 rounded-2xl border border-[var(--border)] flex flex-col">
          <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
            <Award className="text-[var(--primary)]" />
            Live Payout Pool
          </h3>
          <p className="text-sm opacity-60 mb-6">If the tournament ended right now.</p>
          
          <div className="mb-6 flex items-center justify-between bg-black/20 p-4 rounded-xl border border-[var(--border)] cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setHioHit(!hioHit)}>
            <div className="flex items-center gap-3">
              <Target className={hioHit ? "text-[var(--primary)]" : "opacity-30"} />
              <div>
                <p className="font-bold">Hole in One Hit?</p>
                <p className="text-xs opacity-60">Toggle to calculate rollover.</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${hioHit ? "bg-[var(--primary)]" : "bg-black/50"}`}>
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${hioHit ? "left-6" : "left-0.5"}`} />
            </div>
          </div>

          <div className="space-y-4 flex-1">
            <div className="bg-black/20 border border-[var(--border)] p-4 rounded-xl flex justify-between items-center relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400" />
              <div>
                <p className="text-xs uppercase tracking-widest opacity-60 font-bold">Individual Winner</p>
                <p className="font-bold text-lg">Tied Example</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-yellow-400">${actualWinnerPrize}</p>
                {!hioHit && <p className="text-[10px] text-yellow-400/70">+ $50 Rollover Included</p>}
              </div>
            </div>

            <div className="bg-black/20 border border-[var(--border)] p-4 rounded-xl flex justify-between items-center relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-300" />
              <div>
                <p className="text-xs uppercase tracking-widest opacity-60 font-bold">Runner Up</p>
                <p className="font-bold text-lg">Tied Example</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-gray-300">${runnerUp}</p>
              </div>
            </div>

            <div className="bg-black/20 border border-[var(--border)] p-4 rounded-xl flex justify-between items-center relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400" />
              <div>
                <p className="text-xs uppercase tracking-widest opacity-60 font-bold">Lowest Team Total</p>
                <p className="font-bold text-lg">Tied Example</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-blue-400">${teamTotal}</p>
              </div>
            </div>

            <div className={`bg-black/20 border border-[var(--border)] p-4 rounded-xl flex justify-between items-center relative overflow-hidden transition-opacity ${!hioHit ? "opacity-30" : ""}`}>
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-400" />
              <div>
                <p className="text-xs uppercase tracking-widest opacity-60 font-bold">Hole in One Pool</p>
                <p className="font-bold text-sm">First to Hit HIO</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-green-400">${hioPrize}</p>
                {!hioHit && <p className="text-[10px] uppercase">Rolled Over</p>}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
