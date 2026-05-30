import { google } from 'googleapis';
import path from 'path';

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(process.cwd(), 'credentials/google-service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

export interface ExistingRSVP {
  attending: boolean;
}

/**
 * Returns the existing RSVP for a token, or null if not yet responded.
 * Reads column B (token) and H (RSVP_CONFIRMADO) from the sheet.
 */
export async function getExistingRSVP(token: string): Promise<ExistingRSVP | null> {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID!;
    const tab = process.env.GOOGLE_SHEET_TAB ?? 'Tokens de Invitación';
    const sheets = await getSheetsClient();

    // 1. Find the row by matching token in column B (same as RSVP route)
    const tokenRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${tab}'!B:B`,
    });

    const tokenRows = tokenRes.data.values ?? [];
    const rowIndex = tokenRows.findIndex((r, i) => i > 0 && r[0] === token);

    if (rowIndex === -1) return null;

    const sheetRow = rowIndex + 1; // 1-indexed

    // 2. Read RSVP_CONFIRMADO (column H) for that specific row
    const rsvpRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${tab}'!H${sheetRow}`,
    });

    const rsvpValue = rsvpRes.data.values?.[0]?.[0];


    const normalized = rsvpValue?.trim().toUpperCase() ?? '';
    if (!normalized || normalized === 'PENDIENTE') return null;
    if (normalized !== 'SÍ' && normalized !== 'NO') return null;

    return { attending: normalized === 'SÍ' };
  } catch (err) {
    console.error('[sheets] getExistingRSVP error', err);
    return null;
  }
}
