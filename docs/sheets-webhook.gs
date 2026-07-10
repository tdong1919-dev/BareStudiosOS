/**
 * Google Apps Script — demo-request lead capture for the salon platform.
 *
 * Setup (one time, ~5 min):
 *   1. Create a Google Sheet (sheets.new) and copy its ID from the URL:
 *        https://docs.google.com/spreadsheets/d/<THIS_IS_THE_ID>/edit
 *      Paste it into SHEET_ID below.
 *   2. Apps Script editor: paste this file, Save.
 *   3. (Optional) set SECRET to match SHEETS_WEBHOOK_SECRET in your app env.
 *   4. Deploy → New deployment → "Web app" (Execute as: Me, Access: Anyone).
 *      Authorize when prompted, copy the Web app URL (ends in /exec).
 *   5. Put that URL in your app env as SHEETS_WEBHOOK_URL.
 *
 * Using openById (not getActiveSpreadsheet) means this works whether the script
 * is standalone or bound to the sheet.
 */

var SHEET_ID = 'PASTE_YOUR_SHEET_ID_HERE'; // from the sheet URL between /d/ and /edit
var SHEET_NAME = ''; // '' = first tab, or set a specific tab name
var SECRET = ''; // must match SHEETS_WEBHOOK_SECRET (or '' to disable)
var HEADERS = ['Timestamp', 'Name', 'Email', 'Salon', 'Phone', 'Website', 'Priority', 'Notes', 'Source'];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (SECRET && data.secret !== SECRET) {
      return json({ ok: false, error: 'unauthorized' });
    }

    var ss = SpreadsheetApp.openById(SHEET_ID);

    // Structured path: write a row to a named tab (financial agent, etc.).
    // Body: { tab: "Staff", headers: [...], row: [...] }
    if (data.tab && data.row) {
      var tab = ss.getSheetByName(data.tab) || ss.insertSheet(data.tab);
      if (tab.getLastRow() === 0 && data.headers) {
        tab.appendRow(data.headers);
      }
      tab.appendRow(data.row);
      return json({ ok: true });
    }

    // Default path: demo-request lead append to the Leads / first tab.
    var sheet = (SHEET_NAME && ss.getSheetByName(SHEET_NAME)) || ss.getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    sheet.appendRow([
      data.created_at || new Date().toISOString(),
      data.name || '',
      data.email || '',
      data.salon_name || '',
      data.phone || '',
      data.website || '',
      data.priority || '',
      data.message || '',
      data.source || '',
    ]);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
