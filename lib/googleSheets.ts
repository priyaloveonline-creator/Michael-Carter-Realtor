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

/**
 * Retries a fetch on transient network failures (connection resets, DNS
 * hiccups, TLS handshake drops) that occasionally happen from serverless
 * functions reaching external hosts. Does not retry on ordinary HTTP error
 * responses (4xx/5xx) — only on the fetch call itself throwing, since a
 * non-ok response is usually a real error (bad auth, bad range) that
 * retrying won't fix.
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  attempts = 3
): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        // Exponential backoff: 300ms, 900ms, ...
        await new Promise((r) => setTimeout(r, 300 * Math.pow(3, i)));
      }
    }
  }
  throw lastError;
}

async function getAccessToken(): Promise<string | null> {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_SHEETS_PRIVATE_KEY;

  if (!clientEmail || !privateKeyRaw) {
    return null; // Not configured — caller should no-op gracefully.
  }

  try {
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

    const res = await fetchWithRetry(TOKEN_URL, {
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
  } catch (err) {
    console.error("Google Sheets auth request failed after retries:", err);
    return null;
  }
}

export async function appendRowToSheet(row: (string | number)[]): Promise<boolean> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || "Leads";

  if (!spreadsheetId) {
    console.warn("GOOGLE_SHEETS_SPREADSHEET_ID not set — skipping sheet sync.");
    return false;
  }

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      console.warn("Google Sheets not configured — skipping sheet sync.");
      return false;
    }

    const range = encodeURIComponent(`${sheetName}!A1`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

    const res = await fetchWithRetry(url, {
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
  } catch (err) {
    console.error("Google Sheets append request failed after retries:", err);
    return false;
  }
}

/**
 * Writes a row keyed by a stable conversationId: if a row with that ID
 * already exists (tracked in the last column), its cells are overwritten in
 * place; otherwise a new row is appended. This lets a single conversation's
 * sheet row evolve as the AI learns more over the course of the chat,
 * instead of creating a new row every time.
 *
 * Sheet layout expected: A:Timestamp B:Name C:Email D:Phone E:Intent
 * F:Area G:Budget H:Timeline I:Summary J:ConversationId (J is a bookkeeping
 * column — safe to hide/narrow in the Sheet UI, but don't delete it, or
 * matching breaks and every message will append a new row instead of
 * updating).
 */
export async function upsertLeadRow(
  conversationId: string,
  row: {
    timestamp: string;
    name: string;
    email: string;
    phone: string;
    intent: string;
    area: string;
    budget: string;
    timeline: string;
    summary: string;
  }
): Promise<boolean> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || "Leads";

  if (!spreadsheetId) {
    console.warn("GOOGLE_SHEETS_SPREADSHEET_ID not set — skipping sheet sync.");
    return false;
  }

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      console.warn("Google Sheets not configured — skipping sheet sync.");
      return false;
    }

    const values = [
      row.timestamp,
      row.name,
      row.email,
      row.phone,
      row.intent,
      row.area,
      row.budget,
      row.timeline,
      row.summary,
      conversationId,
    ];

    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // 1. Read the ConversationId column (J) to find an existing row for this
    //    conversation. Sheets is the source of truth here — no local cache —
    //    so concurrent visitors never clobber each other's rows.
    const readRange = encodeURIComponent(`${sheetName}!J:J`);
    const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${readRange}`;

    const readRes = await fetchWithRetry(readUrl, { headers: authHeader });
    if (!readRes.ok) {
      console.error("Google Sheets read failed:", await readRes.text());
      return false;
    }

    const readData = await readRes.json();
    const columnJ: string[][] = readData.values || [];
    // Row 1 is the header, so data starts at index 1 (sheet row 2).
    const existingRowIndex = columnJ.findIndex(
      (cell, idx) => idx > 0 && cell[0] === conversationId
    );

    if (existingRowIndex > 0) {
      // Update the existing row in place (sheet rows are 1-indexed).
      const sheetRowNumber = existingRowIndex + 1;
      const updateRange = encodeURIComponent(`${sheetName}!A${sheetRowNumber}:J${sheetRowNumber}`);
      const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${updateRange}?valueInputOption=USER_ENTERED`;

      const updateRes = await fetchWithRetry(updateUrl, {
        method: "PUT",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [values] }),
      });

      if (!updateRes.ok) {
        console.error("Google Sheets update failed:", await updateRes.text());
        return false;
      }
      return true;
    }

    // No existing row for this conversation yet — append a new one.
    const appendRange = encodeURIComponent(`${sheetName}!A1`);
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${appendRange}:append?valueInputOption=USER_ENTERED`;

    const appendRes = await fetchWithRetry(appendUrl, {
      method: "POST",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [values] }),
    });

    if (!appendRes.ok) {
      console.error("Google Sheets append failed:", await appendRes.text());
      return false;
    }

    return true;
  } catch (err) {
    console.error("Google Sheets upsert request failed after retries:", err);
    return false;
  }
}
