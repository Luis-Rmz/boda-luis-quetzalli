const { google } = require('googleapis');
const path = require('path');

async function test() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve('./credentials/google-service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1HRjw_PrkLCPfcq2_2feRDVscl30t4GAU',
    range: "'Tokens de Invitación'!A1:K2",
  });
  console.log(res.data.values);
}

test().catch(console.error);
