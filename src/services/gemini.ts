import { GoogleGenAI } from '@google/genai';
import { todayKey, getDayName } from '../lib/date';
import type { Recurrence, TaskInput } from '../types';

const recurrenceValues: Recurrence[] = ['once', 'daily', 'weekly', 'monthly', 'yearly'];

function normaliseTasks(value: unknown): TaskInput[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => item as Partial<TaskInput>)
    .filter((item) => typeof item.title === 'string' && item.title.trim())
    .map((item) => ({
      title: item.title!.trim(),
      dueDate: /^\d{4}-\d{2}-\d{2}$/.test(item.dueDate ?? '') ? item.dueDate! : todayKey(),
      recurrence: recurrenceValues.includes(item.recurrence as Recurrence) ? item.recurrence as Recurrence : 'once',
    }));
}

export async function parseBrainDump(text: string, apiKey?: string): Promise<TaskInput[]> {
  if (apiKey?.trim()) {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `حلّل النص التالي إلى مهام. تاريخ اليوم المحلي هو ${todayKey()}، واليوم هو ${getDayName()}. أعد JSON فقط كمصفوفة من العناصر التي تحتوي title وdueDate بصيغة YYYY-MM-DD وrecurrence من once أو daily أو weekly أو monthly أو yearly. إذا لم يذكر المستخدم تاريخًا فاجعل dueDate تاريخ اليوم. حافظ على لغة كل مهمة. النص: ${text}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              dueDate: { type: 'string' },
              recurrence: { type: 'string', enum: recurrenceValues },
            },
            required: ['title', 'dueDate', 'recurrence'],
          },
        },
      },
    });
    return normaliseTasks(JSON.parse(response.text ?? '[]'));
  }

  return localHeuristicParse(text);
}

function localHeuristicParse(text: string): TaskInput[] {
  const today = todayKey();
  const segments = text
    .split(/[\n،,؛;]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  return segments.map((segment) => {
    const lower = segment.toLocaleLowerCase('ar');
    const recurrence: Recurrence = /كل يوم|يومياً|يومي/.test(lower)
      ? 'daily'
      : /كل أسبوع|أسبوعياً|أسبوعي|كل جمعة/.test(lower)
        ? 'weekly'
        : /كل شهر|شهرياً|شهري/.test(lower)
          ? 'monthly'
          : /كل سنة|سنوي/.test(lower)
            ? 'yearly'
            : 'once';
    const dueDate = /بكرة|غداً|غدا/.test(lower)
      ? shiftDay(today, 1)
      : /بعد بكرة|بعد غد/.test(lower)
        ? shiftDay(today, 2)
        : today;
    return { title: segment.replace(/^(بكرة|غداً|غدا|اليوم|كل يوم|كل أسبوع|كل شهر)\s*/i, '').trim(), dueDate, recurrence };
  });
}

function shiftDay(key: string, amount: number): string {
  const date = new Date(`${key}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return date.toISOString().slice(0, 10);
}
