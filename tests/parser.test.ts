import test from 'node:test';
import assert from 'node:assert/strict';
import { localHeuristicParse } from '../src/lib/taskParser.ts';
import { addRecurrence, todayKey } from '../src/lib/date.ts';

test('Arabic بعد بكرة is parsed as two days ahead', () => {
  const [task] = localHeuristicParse('بعد بكرة مراجعة الملف');
  assert.equal(task.title, 'مراجعة الملف');
  assert.equal(task.dueDate, addRecurrence(addRecurrence(todayKey(), 'daily'), 'daily'));
});

test('Arabic recurrence prefix is removed from the task title', () => {
  const [task] = localHeuristicParse('كل يوم مراجعة البريد');
  assert.equal(task.title, 'مراجعة البريد');
  assert.equal(task.recurrence, 'daily');
});
