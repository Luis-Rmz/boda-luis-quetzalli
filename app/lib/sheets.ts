import { google } from 'googleapis';
import path from 'path';

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(process.cwd(), 'credentials/google-service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

export interface GuestGroup {
  id: number;
  token: string;
  adults: string[];
  children: string[];
  allowPlusOne: boolean;
}

export interface ExistingRSVP {
  attending: boolean;
}

/**
 * Parses children names from the NOTA column (G).
 * Example: "Incluye 3 niño(s): Kevin Macías, Oliver Macías, Lucas Macias"
 */
function parseChildren(nota: string): string[] {
  if (!nota) return [];
  const match = nota.match(/:\s*(.+)$/);
  if (!match) return [];
  return match[1].split(',').map((n) => n.trim()).filter(Boolean);
}

/**
 * Returns all guest groups from the sheet.
 * Columns: A=# | B=TOKEN | C=ADULTOS_NOMBRES | D=ADULTOS | E=NIÑOS | F=+1 | G=NOTA
 */
export async function getGuestGroups(): Promise<GuestGroup[]> {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID!;
    const tab = process.env.GOOGLE_SHEET_TAB ?? 'Tokens de Invitacion';
    const sheets = await getSheetsClient();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${tab}'!A:G`,
    });

    const rows = res.data.values ?? [];

    return rows
      .slice(1) // skip header
      .filter((r) => r[1]) // must have token
      .map((r) => ({
        id: parseInt(r[0]) || 0,
        token: r[1]?.trim() ?? '',
        adults: (r[2] ?? '').split(',').map((n: string) => n.trim()).filter(Boolean),
        children: parseChildren(r[6] ?? ''),
        allowPlusOne: (r[5] ?? '').toString().toUpperCase() === 'SÍ' || r[5] === '1',
      }));
  } catch (err) {
    console.error('[sheets] getGuestGroups error', err);
    return [];
  }
}

/**
 * Returns a single guest group by token, or null if not found.
 */
export async function getGroupByTokenFromSheet(token: string): Promise<GuestGroup | null> {
  const groups = await getGuestGroups();
  return groups.find((g) => g.token === token) ?? null;
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
