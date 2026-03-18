/**
 * Quick & dirty tests for frontend logic.
 * Pure functions extracted from Index.html.
 */

// ── Pure functions (mirrors Index.html) ──

function pad(n) { return String(n).padStart(2, '0'); }

function formatCountdown(seconds) {
  return pad(Math.floor(seconds / 60)) + ':' + pad(seconds % 60);
}

function resolveResultState(res) {
  if (res.status !== 'SUCCESS') {
    return { flash: 'flash-red', showResult: false };
  }
  const isEntry = res.direction === 'entry';
  return {
    flash:       isEntry ? 'flash-green'  : 'flash-yellow',
    badgeClass:  isEntry ? 'badge-entry'  : 'badge-exit',
    badgeText:   isEntry ? '⬆ כניסה'     : '⬇ יציאה',
    countdownColor: isEntry ? '#00e676'   : '#ffd740',
    showResult:  true
  };
}

function isCountdownUrgent(seconds) { return seconds <= 30; }

// ── Tests ──

describe('pad', () => {
  test('single digit', () => expect(pad(5)).toBe('05'));
  test('double digit', () => expect(pad(42)).toBe('42'));
  test('zero',         () => expect(pad(0)).toBe('00'));
});

describe('formatCountdown', () => {
  test('5:00',  () => expect(formatCountdown(300)).toBe('05:00'));
  test('0:00',  () => expect(formatCountdown(0)).toBe('00:00'));
  test('0:59',  () => expect(formatCountdown(59)).toBe('00:59'));
  test('1:00',  () => expect(formatCountdown(60)).toBe('01:00'));
  test('4:59',  () => expect(formatCountdown(299)).toBe('04:59'));
});

describe('resolveResultState — entry', () => {
  const res = { status: 'SUCCESS', direction: 'entry', id: '123456' };
  test('flash green',   () => expect(resolveResultState(res).flash).toBe('flash-green'));
  test('badge-entry',   () => expect(resolveResultState(res).badgeClass).toBe('badge-entry'));
  test('shows result',  () => expect(resolveResultState(res).showResult).toBe(true));
});

describe('resolveResultState — exit', () => {
  const res = { status: 'SUCCESS', direction: 'exit', id: '123456' };
  test('flash yellow',  () => expect(resolveResultState(res).flash).toBe('flash-yellow'));
  test('badge-exit',    () => expect(resolveResultState(res).badgeClass).toBe('badge-exit'));
});

describe('resolveResultState — errors', () => {
  test('NOT_FOUND → red',   () => expect(resolveResultState({ status: 'NOT_FOUND'   }).flash).toBe('flash-red'));
  test('INVALID_KEY → red', () => expect(resolveResultState({ status: 'INVALID_KEY' }).flash).toBe('flash-red'));
  test('ERROR → red',       () => expect(resolveResultState({ status: 'ERROR'       }).flash).toBe('flash-red'));
});

describe('isCountdownUrgent', () => {
  test('30s = urgent',  () => expect(isCountdownUrgent(30)).toBe(true));
  test('10s = urgent',  () => expect(isCountdownUrgent(10)).toBe(true));
  test('31s = normal',  () => expect(isCountdownUrgent(31)).toBe(false));
  test('300s = normal', () => expect(isCountdownUrgent(300)).toBe(false));
});
