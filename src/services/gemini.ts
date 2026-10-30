import { GoogleGenAI } from '@google/genai';
import { isValidDateKey, todayKey, getDayName } from '../lib/date';
import { localHeuristicParse } from '../lib/taskParser';
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

