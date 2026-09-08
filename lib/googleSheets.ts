// ---------------------------------------------------------------------------
// Minimal Google Sheets writer using a service account, with no external
// googleapis dependency — just a signed JWT + the Sheets REST API. This
// keeps the project lightweight for a portfolio build while still being a
// real, working integration once real credentials are supplied.
//
// Required env vars (see .env.example):
//   GOOGLE_SHEETS_CLIENT_EMAIL
//   GOOGLE_SHEETS_PRIVATE_KEY   (escape newlines as \n in .env)
//   GOOGLE_SHEETS_SPREADSHEET_ID
//   GOOGLE_SHEETS_SHEET_NAME    (defaults to "Leads")
// ---------------------------------------------------------------------------

import crypto from "crypto";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getAccessToken(): Promise<string | null> {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_SHEETS_PRIVATE_KEY;

  if (!clientEmail || !privateKeyRaw) {
    return null; // Not configured — caller should no-op gracefully.
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);

  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: clientEmail,
      scope: SHEETS_SCOPE,
      aud: TOKEN_URL,
      exp: now + 3600,
      iat: now,
    })
  );

  const signInput = `${header}.${payload}`;
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(signInput)
    .sign(privateKey);
  const jwt = `${signInput}.${base64url(signature)}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    console.error("Google Sheets auth failed:", await res.text());
    return null;
  }

  const data = await res.json();
  return data.access_token as string;
}

export async function appendRowToSheet(row: (string | number)[]): Promise<boolean> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || "Leads";

  if (!spreadsheetId) {
    console.warn("GOOGLE_SHEETS_SPREADSHEET_ID not set — skipping sheet sync.");
    return false;
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.warn("Google Sheets not configured — skipping sheet sync.");
    return false;
  }

  const range = encodeURIComponent(`${sheetName}!A1`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [row] }),
  });

  if (!res.ok) {
    console.error("Google Sheets append failed:", await res.text());
    return false;
  }

  return true;
}
