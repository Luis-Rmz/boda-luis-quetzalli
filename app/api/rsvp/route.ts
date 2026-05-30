import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import path from 'path';

export interface RSVPPayload {
  token: string;
  groupId: number;
  attending: boolean;
  adultsAttending: string[];
  childrenAttending: string[];
  plusOneName?: string;
  restrictions?: string;
  submittedAt: string;
}

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(process.cwd(), 'credentials/google-service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

export async function POST(request: NextRequest) {
  try {
    const body: RSVPPayload = await request.json();

    const sheetId = process.env.GOOGLE_SHEET_ID!;
    const tab = process.env.GOOGLE_SHEET_TAB ?? 'Tokens de Invitación';

    const sheets = await getSheetsClient();

    // Sheet layout:
    // A=# | B=TOKEN | C=ADULTOS_NOMBRES | D=ADULTOS | E=NIÑOS | F=+1 | G=NOTA
    // H=RSVP_CONFIRMADO | I=ADULTOS_ASISTEN | J=NIÑOS_ASISTEN | K=RESTRICCIONES | L=FECHA_RESPUESTA

    // 1. Read column B (tokens) to find the matching row
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${tab}'!B:B`,
    });

    const rows = readRes.data.values ?? [];
    // Row 1 is header, tokens start at row 2 (index 1)
    const rowIndex = rows.findIndex((r, i) => i > 0 && r[0] === body.token);

    if (rowIndex === -1) {
      return NextResponse.json({ ok: false, error: 'Token no encontrado' }, { status: 404 });
    }

    // Sheets rows are 1-indexed
    const sheetRow = rowIndex + 1;

    // 2. Build update values for H–L
    // Sheet layout:
    // H=RSVP_CONFIRMADO | I=ADULTOS_ASISTEN | J=NIÑOS_ASISTEN | K=RESTRICCIONES | L=FECHA_RESPUESTA

    const attending = body.attending ? 'SÍ' : 'NO';
    const allAdults = [...body.adultsAttending];
    if (body.plusOneName) allAdults.push(`${body.plusOneName} (+1)`);
    const adultsStr = allAdults.join(', ');
    const childrenStr = body.childrenAttending.join(', ');
    const restrictionsVal = body.restrictions ?? '';

    const fecha = new Date(body.submittedAt).toLocaleString('es-MX', {
      timeZone: 'America/Mexico_City',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    // Update columns H–L (RSVP_CONFIRMADO through FECHA_RESPUESTA)
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `'${tab}'!H${sheetRow}:L${sheetRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[attending, adultsStr, childrenStr, restrictionsVal, fecha]],
      },
    });

    console.log(`[RSVP] row ${sheetRow} updated — token ${body.token} → ${attending}`);
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error('[RSVP] error', err);
    return NextResponse.json({ ok: false, error: 'Error al procesar' }, { status: 500 });
  }
}
