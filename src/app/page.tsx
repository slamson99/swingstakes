"use client";

import React, { useState } from "react";
import { StandardLayout } from "@/components/ui/Layout";
import { LeaderboardView } from "@/components/LeaderboardView";
import { HallOfFameView } from "@/components/HallOfFame";
import { PayoutsView } from "@/components/PayoutsView";

export default function Home() {
  const [currentTab, setCurrentTab] = useState("leaderboard");

  return (
    <StandardLayout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {currentTab === "leaderboard" && <LeaderboardView />}
      {currentTab === "payouts" && <PayoutsView />}
      {currentTab === "halloffame" && <HallOfFameView />}
    </StandardLayout>
  );
}
