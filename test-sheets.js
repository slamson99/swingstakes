require('dotenv').config({ path: '.env.local' });
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '';
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY 
  ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') 
  : '';

async function run() {
  if (!SHEET_ID) return console.log("NO ID");
  const jwt = new JWT({ email: CLIENT_EMAIL, key: PRIVATE_KEY, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  const doc = new GoogleSpreadsheet(SHEET_ID, jwt);
  await doc.loadInfo();
  console.log("Found tabs:", Object.keys(doc.sheetsByTitle));
  
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();
  if (rows.length > 0) {
      console.log("Headers:", sheet.headerValues);
      console.log("Row 0:", rows[0].toObject());
  }
}
run();
