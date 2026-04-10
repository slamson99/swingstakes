import { NextResponse } from 'next/server';
import { formatAEST } from '@/lib/time';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const url = 'http://site.api.espn.com/apis/site/v2/sports/golf/leaderboard';
  
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch from ESPN');
    }
    const data = await res.json();
    
    // Safety check
    if (!data || !data.events || data.events.length === 0) {
      return NextResponse.json({ error: 'No active events found' }, { status: 404 });
    }

    const event = data.events[0];
    const tournamentName = event.name;
    const competitors = event.competitions[0].competitors;

    // Map into simplified array
    const leaderboard = competitors.map((c: any) => {
      const athlete = c.athlete;
      const scores = c.linescores || [];
      const scoreToday = c.score || "E";
      const status = c.status || {}; // Contains current hole, etc.
      
      // ESPN indicates missed cut usually in status.type.description = "Cut" or similar
      const isCut = status.type?.description === "Cut" || status.type?.id === "3";
      
      const r1 = scores[0]?.value || 0;
      const r2 = scores[1]?.value || 0;
      const r3 = scores[2]?.value || 0;
      const r4 = scores[3]?.value || 0;
      // Calculate movement
      const movement = c.movement || 0;
      
      const fullLinescores = scores.map((s: any) => ({
        period: s.period,
        value: s.value,
        displayValue: s.displayValue,
        inScore: s.inScore,
        outScore: s.outScore,
      }));

      return {
        id: athlete.id,
        name: athlete.displayName,
        headshot: athlete.headshot?.href || '',
        flag: athlete.flag?.href || '',
        position: c.status?.position?.displayName || "-",
        movement,
        score: c.score || "E", // Total related to par
        r1, r2, r3, r4,
        linescores: fullLinescores,
        isCut,
        status: status.type?.description || "Active",
        statusObj: status, // Send the full status object for deeper contextual tracking (hole, play state, etc.)
        thru: status.displayValue || "",
      };
    });

    const eventStatus = event.status?.type?.id || "1";
    const eventStatusName = event.status?.type?.name || "STATUS_SCHEDULED";
    const isFinal = eventStatus === "3" || eventStatusName === "STATUS_FINAL";

    return NextResponse.json({
      tournamentName,
      leaderboard,
      isFinal,
      lastSynced: formatAEST(new Date()),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
