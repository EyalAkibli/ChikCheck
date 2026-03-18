/**
 * Tests for pure functions in Index.html.
 * These functions are defined on window in the browser; here we redefine them
 * identically so tests stay in sync with production. If you change a function
 * in Index.html, update the copy here too.
 */

// ── Production-identical pure functions ───────────────────────────────────────

function pad(n) { return String(Math.max(0, Math.floor(n))).padStart(2, '0'); }

function formatCountdown(totalSeconds) {
  var s = Math.max(0, Math.floor(totalSeconds));
  return pad(Math.floor(s / 60)) + ':' + pad(s % 60);
}

function resolveDirection(res) {
  var isEntry = res.direction === 'entry';
  return {
    bgClass:        isEntry ? 'bg-entry'    : 'bg-exit',
    flashClass:     isEntry ? 'flash-green' : 'flash-amber',
    badgeClass:     isEntry ? 'badge-entry' : 'badge-exit',
    badgeText:      isEntry ? '⬆ כניסה'    : '⬇ יציאה',
    msg:            isEntry ? 'כניסה מאושרת ✓' : 'יציאה מאושרת ✓',
    countdownColor: isEntry ? '#69f0ae'     : '#ffca28'
  };
}

// ── pad ───────────────────────────────────────────────────────────────────────
describe('pad', () => {
  test('single digit',  () => expect(pad(5)).toBe('05'));
  test('double digit',  () => expect(pad(42)).toBe('42'));
  test('zero',          () => expect(pad(0)).toBe('00'));
  test('negative → 00', () => expect(pad(-1)).toBe('00'));  // Math.max(0,-1)=0
  test('float → floor', () => expect(pad(4.9)).toBe('04')); // Math.floor(4.9)=4
});

// ── formatCountdown ───────────────────────────────────────────────────────────
describe('formatCountdown', () => {
  test('5:00',               () => expect(formatCountdown(300)).toBe('05:00'));
  test('0:00',               () => expect(formatCountdown(0)).toBe('00:00'));
  test('0:59',               () => expect(formatCountdown(59)).toBe('00:59'));
  test('1:00',               () => expect(formatCountdown(60)).toBe('01:00'));
  test('4:59',               () => expect(formatCountdown(299)).toBe('04:59'));
  test('negative → 00:00',   () => expect(formatCountdown(-1)).toBe('00:00'));
  test('float rounds down',  () => expect(formatCountdown(59.9)).toBe('00:59'));
});

// ── resolveDirection — entry ──────────────────────────────────────────────────
describe('resolveDirection — entry', () => {
  var res = { status: 'SUCCESS', direction: 'entry', id: '123456789' };

  test('bgClass',        () => expect(resolveDirection(res).bgClass).toBe('bg-entry'));
  test('flashClass',     () => expect(resolveDirection(res).flashClass).toBe('flash-green'));
  test('badgeClass',     () => expect(resolveDirection(res).badgeClass).toBe('badge-entry'));
  test('countdownColor', () => expect(resolveDirection(res).countdownColor).toBe('#69f0ae'));
  test('msg',            () => expect(resolveDirection(res).msg).toBe('כניסה מאושרת ✓'));
});

// ── resolveDirection — exit ───────────────────────────────────────────────────
describe('resolveDirection — exit', () => {
  var res = { status: 'SUCCESS', direction: 'exit', id: '123456789' };

  test('bgClass',        () => expect(resolveDirection(res).bgClass).toBe('bg-exit'));
  test('flashClass',     () => expect(resolveDirection(res).flashClass).toBe('flash-amber'));
  test('badgeClass',     () => expect(resolveDirection(res).badgeClass).toBe('badge-exit'));
  test('countdownColor', () => expect(resolveDirection(res).countdownColor).toBe('#ffca28'));
  test('msg',            () => expect(resolveDirection(res).msg).toBe('יציאה מאושרת ✓'));
});

// ── handleSubmit guard — empty fields ────────────────────────────────────────
// Pure version of the validation logic (no DOM)
function validateSubmitInputs(id, key) {
  // mirrors handleSubmit: trim first, then check
  if (!id.trim() || !key.trim()) return 'יש למלא את כל השדות.';
  return null;
}

describe('submit input validation', () => {
  test('both empty',        () => expect(validateSubmitInputs('', '')).toBeTruthy());
  test('only id empty',     () => expect(validateSubmitInputs('', 'abc')).toBeTruthy());
  test('only key empty',    () => expect(validateSubmitInputs('123', '')).toBeTruthy());
  test('whitespace id',     () => expect(validateSubmitInputs('   ', 'abc')).toBeTruthy());
  test('whitespace key',    () => expect(validateSubmitInputs('123', '   ')).toBeTruthy());
  test('both valid',        () => expect(validateSubmitInputs('123', 'abc')).toBeNull());
});

// ── Countdown urgency threshold ───────────────────────────────────────────────
function isUrgent(remainingSec) { return remainingSec <= 30; }

describe('countdown urgency', () => {
  test('0 → urgent',   () => expect(isUrgent(0)).toBe(true));
  test('30 → urgent',  () => expect(isUrgent(30)).toBe(true));
  test('31 → normal',  () => expect(isUrgent(31)).toBe(false));
  test('300 → normal', () => expect(isUrgent(300)).toBe(false));
});
