import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { mockParticipants, mockDraft } from './mock-data';

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '';
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY 
  ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') 
  : '';

let cachedDoc: GoogleSpreadsheet | null = null;

export async function getGoogleSheet() {
  if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    return null; 
  }

  if (!cachedDoc) {
    const jwt = new JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    cachedDoc = new GoogleSpreadsheet(SHEET_ID, jwt);
    await cachedDoc.loadInfo();
  }
  return cachedDoc;
}

export interface Sweeper {
  id: string; // Sweeper No
  name: string;
  tier1: string;
  tier2: string;
  tier3: string;
  tier4: string;
  paid: boolean;
}

// Derive tab name dynamically
function getTabName(context: string): string {
  if (context === "masters") return "Masters 2026";
  if (context === "usopen") return "US Open 2026";
  if (context === "pga") return "PGA Championship 2026";
  if (context === "open") return "The Open 2026";
  return "Masters 2026"; 
}

export async function getTournamentData(context: string): Promise<Sweeper[]> {
  const doc = await getGoogleSheet();
  
  if (!doc) {
    // Fallback to mock data to prevent errors in development
    return mockParticipants.map(mp => {
      const draft = mockDraft.find(d => d.participantId === mp.id);
      return {
        id: mp.id,
        name: mp.name,
        tier1: draft?.golfers[0] || "",
        tier2: draft?.golfers[1] || "",
        tier3: draft?.golfers[2] || "",
        tier4: draft?.golfers[3] || "",
        paid: mp.paid
      };
    });
  }

  try {
    const sheetTitle = getTabName(context);
    const sheet = doc.sheetsByTitle[sheetTitle];
    if (!sheet) throw new Error(`Tab ${sheetTitle} not found`);

    const rows = await sheet.getRows();
    return rows.map(row => {
      const data = row.toObject();
      // Expecting columns: Sweeper No, Sweeper Name, Tier 1, Tier 2, Tier 3, Tier 4, Paid
      return {
        id: data['Sweeper No'] || '',
        name: data['Sweeper Name'] || '',
        tier1: data['Tier 1'] || '',
        tier2: data['Tier 2'] || '',
        tier3: data['Tier 3'] || '',
        tier4: data['Tier 4'] || '',
        // Map common true/false/checkbox strings to boolean
        paid: String(data['Paid']).toLowerCase() === 'true' || data['Paid'] === 'TRUE'
      };
    });
  } catch (error) {
    console.error("Error fetching tournament data from sheets:", error);
    return [];
  }
}

export async function updatePaidStatus(context: string, sweeperId: string, isPaid: boolean, passcode: string) {
  if (passcode !== "5225") throw new Error("Unauthorized");

  const doc = await getGoogleSheet();
  if (!doc) {
    throw new Error("Google Sheets not explicitly connected in Environment. Viewers only.");
  }

  const sheetTitle = getTabName(context);
  const sheet = doc.sheetsByTitle[sheetTitle];
  if (!sheet) throw new Error(`Tab ${sheetTitle} not found`);

  const rows = await sheet.getRows();
  const rowToUpdate = rows.find(r => r.get('Sweeper No') === sweeperId);
  
  if (rowToUpdate) {
    rowToUpdate.set('Paid', isPaid ? 'TRUE' : 'FALSE');
    await rowToUpdate.save();
    return { success: true };
  } else {
    throw new Error("Sweeper not found in spreadsheet");
  }
}
