// Chik-Check — GAS Backend
//
// Sheet structure (both tabs in the same Google Spreadsheet):
//
//   Tab "Guests"  — Column A: authorized ID numbers (row 1 = header, data from row 2)
//   Tab "Config"  — A1: "ENTRY_KEY"  B1: <value>
//                   A2: "EXIT_KEY"   B2: <value>
//
// To change gate keys: just edit cells B1/B2 in the Config tab. No editor needed.

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Chik-Check ⚡')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * @param {string} idNumber
 * @param {string} gateKey
 * @returns {{ status: 'SUCCESS'|'NOT_FOUND'|'INVALID_KEY'|'ERROR',
 *             id?: string, direction?: 'entry'|'exit', message?: string }}
 */
function checkIn(idNumber, gateKey) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // --- Read keys from Config tab ---
    const configSheet = ss.getSheetByName('Config');
    if (!configSheet) return { status: 'ERROR', message: 'Tab "Config" not found. Create it with ENTRY_KEY and EXIT_KEY in column A, values in column B.' };

    const config = configSheet.getRange(1, 1, 2, 2).getValues();
    const entryKey = String(config[0][1]).trim();
    const exitKey  = String(config[1][1]).trim();

    if (!entryKey || !exitKey) return { status: 'ERROR', message: 'ENTRY_KEY or EXIT_KEY is empty in the Config tab.' };

    const key = String(gateKey).trim();
    let direction;
    if      (key === entryKey) direction = 'entry';
    else if (key === exitKey)  direction = 'exit';
    else return { status: 'INVALID_KEY' };

    // --- Check ID against Guests tab ---
    const id = String(idNumber).trim();
    if (!id) return { status: 'NOT_FOUND' };

    const guestsSheet = ss.getSheetByName('Guests');
    if (!guestsSheet) return { status: 'ERROR', message: 'Tab "Guests" not found.' };

    const lastRow = guestsSheet.getLastRow();
    if (lastRow < 2) return { status: 'NOT_FOUND' };

    const ids = guestsSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]).trim() === id) {
        return { status: 'SUCCESS', id, direction };
      }
    }

    return { status: 'NOT_FOUND' };
  } catch (err) {
    return { status: 'ERROR', message: err.message };
  }
}
