/**
 * Bare Studios OS Google Sheets webhook
 *
 * This is the endpoint for Netlify's SHEETS_WEBHOOK_URL.
 *
 * Setup:
 *   1. Create a Google Sheet named "Bare Studios OS Database".
 *   2. In that Sheet, go to Extensions -> Apps Script.
 *   3. Paste this file into Code.gs and save.
 *   4. Optional: Project Settings -> Script Properties:
 *        SHEETS_WEBHOOK_SECRET = the same value you add in Netlify
 *        SPREADSHEET_ID = optional fallback Sheet ID if this script is standalone
 *   5. Deploy -> New deployment -> Web app.
 *        Execute as: Me
 *        Who has access: Anyone
 *   6. Copy the Web app URL ending in /exec and add it to Netlify as:
 *        SHEETS_WEBHOOK_URL
 *   7. Add the Sheet ID from the Sheet URL to Netlify as:
 *        SHEETS_SHEET_ID
 */

function doGet() {
  return json_({
    ok: true,
    app: 'Bare Studios OS Sheets Webhook',
    time: new Date().toISOString()
  });
}

function doPost(e) {
  try {
    var payload = parsePayload_(e);
    verifySecret_(payload);

    var write = normalizeWrite_(payload);
    var sheet = getOrCreateSheet_(write.tab);
    ensureHeaders_(sheet, write.headers);
    var appended = appendMappedRows_(sheet, write.headers, write.rows);

    return json_({
      ok: true,
      tab: write.tab,
      appended: appended,
      time: new Date().toISOString()
    });
  } catch (err) {
    return json_({
      ok: false,
      error: err && err.message ? err.message : String(err)
    });
  }
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Missing POST body');
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (err) {
    throw new Error('POST body must be JSON');
  }
}

function verifySecret_(payload) {
  var expected = PropertiesService.getScriptProperties().getProperty('SHEETS_WEBHOOK_SECRET');
  if (!expected) return;

  if (!payload || payload.secret !== expected) {
    throw new Error('Invalid webhook secret');
  }
}

function normalizeWrite_(payload) {
  if (payload.tab && payload.headers && (payload.row || payload.rows)) {
    if (!Array.isArray(payload.headers)) throw new Error('headers must be an array');
    if (payload.row && !Array.isArray(payload.row)) throw new Error('row must be an array');
    if (payload.rows && !Array.isArray(payload.rows)) throw new Error('rows must be an array');

    var rows = payload.rows || [payload.row];
    rows.forEach(function (row) {
      if (!Array.isArray(row)) throw new Error('each rows item must be an array');
    });

    return {
      tab: cleanName_(payload.tab),
      headers: payload.headers.map(String),
      rows: rows
    };
  }

  return normalizeLead_(payload);
}

function normalizeLead_(payload) {
  var headers = [
    'Created',
    'Salon',
    'Name',
    'Email',
    'Phone',
    'Website',
    'Instagram',
    'Source',
    'Notes',
    'Raw'
  ];

  return {
    tab: cleanName_(payload.tab || 'Leads'),
    headers: headers,
    rows: [[
      payload.created_at || payload.createdAt || new Date().toISOString(),
      payload.salonName || payload.salon_name || payload.salon || '',
      payload.name || '',
      payload.email || '',
      payload.phone || '',
      payload.website || '',
      payload.instagram || '',
      payload.source || 'website',
      payload.notes || payload.message || '',
      JSON.stringify(payload)
    ]]
  };
}

function cleanName_(name) {
  var value = String(name || '').trim();
  if (!value) throw new Error('tab is required');

  return value.substring(0, 99).replace(/[\\/?*\[\]:]/g, '-');
}

function getOrCreateSheet_(name) {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function getSpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Open this script from inside the Google Sheet or set SPREADSHEET_ID in Script Properties');
  }
  return ss;
}

function ensureHeaders_(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    formatHeader_(sheet, headers.length);
    return;
  }

  var width = Math.max(sheet.getLastColumn(), headers.length);
  var current = sheet.getRange(1, 1, 1, width).getValues()[0].map(function (value) {
    return String(value || '').trim();
  });

  var changed = false;
  headers.forEach(function (header) {
    if (current.indexOf(header) === -1) {
      current.push(header);
      changed = true;
    }
  });

  if (changed) {
    sheet.getRange(1, 1, 1, current.length).setValues([current]);
    formatHeader_(sheet, current.length);
  }
}

function appendMappedRows_(sheet, headers, rows) {
  if (!rows || rows.length === 0) return 0;

  var currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function (value) {
    return String(value || '').trim();
  });

  var values = rows.map(function (row) {
    return currentHeaders.map(function (header) {
      var idx = headers.indexOf(header);
      return idx >= 0 ? row[idx] : '';
    });
  });

  sheet.getRange(sheet.getLastRow() + 1, 1, values.length, currentHeaders.length).setValues(values);
  return values.length;
}

function formatHeader_(sheet, width) {
  var range = sheet.getRange(1, 1, 1, width);
  range.setFontWeight('bold');
  range.setBackground('#f6f2ec');
  sheet.setFrozenRows(1);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
