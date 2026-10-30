import { GoogleGenAI } from '@google/genai';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

initializeApp();

const db = getFirestore();
const geminiApiKey = defineSecret('GEMINI_API_KEY');
const recurrenceValues = ['once', 'daily', 'weekly', 'monthly', 'yearly'] as const;

function validDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

async function enforceRateLimit(uid: string): Promise<void> {
  const ref = db.collection('_functionRateLimits').doc(uid);
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 12;
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const data = snapshot.data();
    const startedAt = typeof data?.startedAt === 'number' ? data.startedAt : 0;
    const count = typeof data?.count === 'number' ? data.count : 0;
    if (now - startedAt < windowMs && count >= maxRequests) {
      throw new HttpsError('resource-exhausted', 'Too many task parsing requests. Please wait one minute.');
    }
    transaction.set(ref, now - startedAt >= windowMs
      ? { startedAt: now, count: 1 }
      : { startedAt, count: count + 1 });
  });
}

export const parseTasks = onCall(
  { region: 'us-central1', secrets: [geminiApiKey], timeoutSeconds: 30, memory: '256MiB', maxInstances: 3 },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in to use AI task parsing.');
    const text = request.data?.text;
    if (typeof text !== 'string' || !text.trim() || text.length > 8_000) {
      throw new HttpsError('invalid-argument', 'Task text must contain 1–8000 characters.');
    }

    await enforceRateLimit(request.auth.uid);

    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey.value() });
      const dateParts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Riyadh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(new Date());
      const datePart = (type: string) => dateParts.find((part) => part.type === type)?.value ?? '';
      const today = `${datePart('year')}-${datePart('month')}-${datePart('day')}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `حلّل النص التالي إلى مهام. تاريخ اليوم المحلي في السعودية هو ${today}. أعد JSON فقط كمصفوفة من العناصر التي تحتوي title وdueDate بصيغة YYYY-MM-DD وrecurrence من once أو daily أو weekly أو monthly أو yearly. إذا لم يذكر المستخدم تاريخًا فاجعل dueDate تاريخ اليوم. حافظ على لغة كل مهمة. النص: ${text}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                dueDate: { type: 'string' },
                recurrence: { type: 'string', enum: [...recurrenceValues] },
              },
              required: ['title', 'dueDate', 'recurrence'],
            },
          },
        },
      });

      const parsed: unknown = JSON.parse(response.text ?? '[]');
      if (!Array.isArray(parsed)) throw new Error('Expected a task array.');
      return parsed.slice(0, 50).flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const task = item as Record<string, unknown>;
        if (typeof task.title !== 'string' || !task.title.trim()) return [];
        return [{
          title: task.title.trim().slice(0, 240),
          dueDate: validDateKey(task.dueDate) ? task.dueDate : today,
          recurrence: recurrenceValues.includes(task.recurrence as typeof recurrenceValues[number])
            ? task.recurrence
            : 'once',
        }];
      });
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      console.error('Gemini task parsing failed', error);
      throw new HttpsError('internal', 'Unable to parse tasks right now. Please try again.');
    }
  },
);
