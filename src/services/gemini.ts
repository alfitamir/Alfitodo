import { GoogleGenAI } from '@google/genai';
import { isValidDateKey, todayKey, getDayName } from '../lib/date';
import type { Recurrence, TaskInput } from '../types';

const recurrenceValues: Recurrence[] = ['once', 'daily', 'weekly', 'monthly', 'yearly'];

function normaliseTasks(value: unknown): TaskInput[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null && !Array.isArray(item))
    .filter((item) => typeof item.title === 'string' && item.title.trim())
    .map((item) => ({
      title: String(item.title).trim(),
      dueDate: typeof item.dueDate === 'string' && isValidDateKey(item.dueDate) ? item.dueDate : todayKey(),
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

export function localHeuristicParse(text: string): TaskInput[] {
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

    // Match the longer expression first: "بعد بكرة" contains "بكرة".
    const dueDate = /بعد بكرة|بعد غد/.test(lower)
      ? shiftDay(today, 2)
      : /بكرة|غداً|غدا/.test(lower)
        ? shiftDay(today, 1)
        : today;
    const title = segment
      .replace(/^(بعد بكرة|بعد غد|بكرة|غداً|غدا|اليوم)\s*/i, '')
      .replace(/^(كل يوم|يومياً|يومي|كل أسبوع|أسبوعياً|أسبوعي|كل جمعة|كل شهر|شهرياً|شهري|كل سنة|سنوي)\s*/i, '')
      .trim();
    return { title: title || segment, dueDate, recurrence };
  });
}

function shiftDay(key: string, amount: number): string {
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year, month - 1, day + amount, 12, 0, 0, 0);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
