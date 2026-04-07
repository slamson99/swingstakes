import { NextResponse } from 'next/server';
import { getTournamentData, updatePaidStatus } from '@/lib/sheets';
import { formatAEST } from '@/lib/time';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const context = searchParams.get('tournament') || 'masters';
  
  const sweepers = await getTournamentData(context);
  
  return NextResponse.json({
    sweepers,
    lastSynced: formatAEST(new Date()),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { context, sweeperId, isPaid, passcode } = body;

    if (!context || !sweeperId || typeof isPaid !== 'boolean' || !passcode) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    await updatePaidStatus(context, String(sweeperId), isPaid, passcode);

    return NextResponse.json({ success: true, message: 'Status updated' });
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Invalid Passcode. You must be Admin.' }, { status: 403 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
