// Chik-Check — GAS Backend
// Sheet "Guests": Column A = authorized ID numbers (header row 1). Read-only.
// Fraud prevention is visual-only (live clock + countdown on client).
// Two gate keys control direction: ENTRY_KEY / EXIT_KEY (Script Properties).

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Chik-Check ⚡')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Validates an ID against the guest list and determines entry/exit direction
 * from the gate key supplied.
 *
 * @param {string} idNumber
 * @param {string} gateKey
 * @returns {{ status: 'SUCCESS'|'NOT_FOUND'|'INVALID_KEY'|'ERROR',
 *             id?: string,
 *             direction?: 'entry'|'exit',
 *             message?: string }}
 */
function checkIn(idNumber, gateKey) {
  try {
    const props = PropertiesService.getScriptProperties();
    const entryKey = props.getProperty('ENTRY_KEY');
    const exitKey  = props.getProperty('EXIT_KEY');

    if (!entryKey || !exitKey) {
      return { status: 'ERROR', message: 'ENTRY_KEY / EXIT_KEY not set in Script Properties.' };
    }

    const key = String(gateKey).trim();
    let direction;
    if      (key === entryKey.trim()) direction = 'entry';
    else if (key === exitKey.trim())  direction = 'exit';
    else return { status: 'INVALID_KEY' };

    const id = String(idNumber).trim();
    if (!id) return { status: 'NOT_FOUND' };

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Guests');
    if (!sheet) return { status: 'ERROR', message: 'Sheet "Guests" not found.' };

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return { status: 'NOT_FOUND' };

    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

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
