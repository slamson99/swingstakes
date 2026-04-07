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
    console.warn("[Sheets Access] Environment Variables not populated natively.");
    throw new Error("Google Sheets Environment Variables Missing (SHEET_ID, CLIENT_EMAIL, PRIVATE_KEY).");
  }

  if (!cachedDoc) {
    const jwt = new JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    cachedDoc = new GoogleSpreadsheet(SHEET_ID, jwt);
    try {
      await cachedDoc.loadInfo();
    } catch (e: any) {
      throw new Error("Google Sheets API Error loading doc info: " + e.message);
    }
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
  
  const sheetTitle = getTabName(context).trim();
  console.log(`[Sheets API] Attempting to connect to Google Sheets workbook with exact Tab mapping: "${sheetTitle}"`);
  
  const sheet = doc.sheetsByTitle[sheetTitle];
  if (!sheet) {
    throw new Error(`Google Sheets API Error: Tab "${sheetTitle}" physically does not exist inside connected doc space!`);
  }

  const rows = await sheet.getRows();
  console.log(`[Sheets API] Execution Success! Extracted exactly ${rows.length} rows directly from "${sheetTitle}" tab.`);
  
  return rows.map((row, index) => {
    const data = row.toObject();
    if (index === 0) {
      console.log("Raw Row Data (Row 1):", data);
    }
    
    // Lenient extraction to defeat invisible whitespaces or case sensitivity bugs
    const lenientGet = (searchStr: string) => {
      const matchKey = Object.keys(data).find(k => k.trim().toLowerCase() === searchStr.trim().toLowerCase());
      return matchKey ? data[matchKey] : '';
    };

    return {
      id: lenientGet('Sweeper No'),
      name: lenientGet('Sweeper Name'),
      tier1: lenientGet('Tier 1'),
      tier2: lenientGet('Tier 2'),
      tier3: lenientGet('Tier 3'),
      tier4: lenientGet('Tier 4'),
      paid: String(lenientGet('Paid')).toLowerCase() === 'true' || lenientGet('Paid') === 'TRUE'
    };
  });
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
