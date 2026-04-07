import { NextResponse } from 'next/server';

export async function GET() {
  const url = 'http://site.api.espn.com/apis/site/v2/sports/golf/leaderboard';
  
  try {
    const res = await fetch(url, { next: { revalidate: 60 } }); // Cache 60s
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
      
      // Calculate missing cut logic for sweepstakes: (r1 + r2) * 2
      // Actually we will do this on the frontend or backend. Better to pass raw scores to frontend.
      
      return {
        id: athlete.id,
        name: athlete.displayName,
        headshot: athlete.headshot?.href || '',
        flag: athlete.flag?.href || '',
        position: c.status?.position?.displayName || "-",
        score: c.score || "E", // Total related to par
        r1, r2, r3, r4,
        isCut,
        status: status.type?.description || "Active", // e.g. "Active", "Cut", "Finished"
        thru: status.displayValue || "", // e.g. "F", "18", "12*"
      };
    });

    return NextResponse.json({
      tournamentName,
      leaderboard,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
