import test from 'node:test';
import assert from 'node:assert/strict';
import { addRecurrence, isCompletedToday, isValidDateKey, parseDateKey } from '../src/lib/date.ts';

test('validates actual calendar dates', () => {
  assert.equal(isValidDateKey('2026-02-28'), true);
  assert.equal(isValidDateKey('2026-02-30'), false);
  assert.equal(isValidDateKey('2026-13-01'), false);
  assert.throws(() => parseDateKey('2026-02-30'), RangeError);
});

test('monthly recurrence clamps month-end dates', () => {
  assert.equal(addRecurrence('2026-01-31', 'monthly'), '2026-02-28');
  assert.equal(addRecurrence('2028-01-31', 'monthly'), '2028-02-29');
});

test('yearly recurrence handles leap day', () => {
  assert.equal(addRecurrence('2024-02-29', 'yearly'), '2025-02-28');
});

test('completion grouping requires a valid completion timestamp', () => {
  assert.equal(isCompletedToday(null), false);
  assert.equal(isCompletedToday('not-a-date'), false);
});
