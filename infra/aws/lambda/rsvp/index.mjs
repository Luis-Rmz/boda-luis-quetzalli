import crypto from 'node:crypto';

let cachedAccessToken = null;
let cachedAccessTokenExpiresAt = 0;

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
  },
  body: JSON.stringify(body),
});

const base64url = (value) => Buffer.from(value).toString('base64url');

function getServiceAccount() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not configured');
  return JSON.parse(raw);
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && cachedAccessTokenExpiresAt - 60 > now) {
    return cachedAccessToken;
  }

  const serviceAccount = getServiceAccount();
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const unsignedJwt = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(unsignedJwt), serviceAccount.private_key);
  const assertion = `${unsignedJwt}.${signature.toString('base64url')}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error(`Google token request failed: ${response.status}`);
  }

  const data = await response.json();
  cachedAccessToken = data.access_token;
  cachedAccessTokenExpiresAt = now + Number(data.expires_in ?? 3600);
  return cachedAccessToken;
}

async function sheetsRequest(path, init = {}) {
  const token = await getAccessToken();
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sheets request failed: ${response.status} ${body}`);
  }

  return response.json();
}

function sheetRange(range) {
  return encodeURIComponent(`'${process.env.GOOGLE_SHEET_TAB ?? 'Tokens de Invitacion'}'!${range}`);
}

async function findTokenRow(token) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const data = await sheetsRequest(`${sheetId}/values/${sheetRange('B:B')}`);
  const rows = data.values ?? [];
  const rowIndex = rows.findIndex((row, index) => index > 0 && row[0] === token);

  return rowIndex === -1 ? null : rowIndex + 1;
}

async function getExistingRSVP(token) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sheetRow = await findTokenRow(token);
  if (!sheetRow) return null;

  const data = await sheetsRequest(`${sheetId}/values/${sheetRange(`H${sheetRow}`)}`);
  const normalized = data.values?.[0]?.[0]?.trim().toUpperCase() ?? '';

  if (!normalized || normalized === 'PENDIENTE') return null;
  if (normalized !== 'SÍ' && normalized !== 'SI' && normalized !== 'NO') return null;

  return { attending: normalized === 'SÍ' || normalized === 'SI' };
}

async function updateRSVP(payload) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sheetRow = await findTokenRow(payload.token);
  if (!sheetRow) return false;

  const adults = [...(payload.adultsAttending ?? [])];
  if (payload.plusOneName) adults.push(`${payload.plusOneName} (+1)`);

  const date = new Date(payload.submittedAt).toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  await sheetsRequest(
    `${sheetId}/values/${sheetRange(`H${sheetRow}:L${sheetRow}`)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      body: JSON.stringify({
        values: [[
          payload.attending ? 'SÍ' : 'NO',
          adults.join(', '),
          (payload.childrenAttending ?? []).join(', '),
          payload.restrictions ?? '',
          date,
        ]],
      }),
    },
  );

  return true;
}

export async function handler(event) {
  try {
    const method = event.requestContext?.http?.method ?? event.httpMethod;

    if (method === 'OPTIONS') {
      return json(204, {});
    }

    if (method === 'GET') {
      const token = event.queryStringParameters?.token;
      if (!token) return json(400, { ok: false, error: 'Token requerido' });

      return json(200, { ok: true, existingRSVP: await getExistingRSVP(token) });
    }

    if (method === 'POST') {
      const payload = JSON.parse(event.body ?? '{}');
      if (!payload.token) return json(400, { ok: false, error: 'Token requerido' });

      const updated = await updateRSVP(payload);
      if (!updated) return json(404, { ok: false, error: 'Token no encontrado' });

      return json(200, { ok: true });
    }

    return json(405, { ok: false, error: 'Metodo no permitido' });
  } catch (error) {
    console.error('[rsvp]', error);
    return json(500, { ok: false, error: 'Error al procesar' });
  }
}
