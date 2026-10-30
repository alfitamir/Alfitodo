import { Plus } from 'lucide-react';
import type { Recurrence, TaskInput } from '../types';

interface QuickAddProps {
  value: TaskInput;
  onChange: (value: TaskInput) => void;
  onSubmit: () => void;
}

export function QuickAdd({ value, onChange, onSubmit }: QuickAddProps) {
  return <section className="quick-add surface">
    <div className="quick-add-label"><span className="plus-badge"><Plus size={16} /></span><span><strong>إضافة مهمة سريعة</strong><small>ما الخطوة التالية؟</small></span></div>
    <input value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} onKeyDown={(event) => event.key === 'Enter' && onSubmit()} placeholder="مثلاً: حجز موعد الطبيب" />
    <input className="date-input" type="date" value={value.dueDate} onChange={(event) => onChange({ ...value, dueDate: event.target.value })} aria-label="تاريخ المهمة" />
    <select value={value.recurrence} onChange={(event) => onChange({ ...value, recurrence: event.target.value as Recurrence })} aria-label="تكرار المهمة">
      <option value="once">مرة واحدة (بتاريخ محدد)</option>
      <option value="daily">يومية متكررة</option>
      <option value="weekly">أسبوعية متكررة</option>
      <option value="monthly">شهرية متكررة</option>
      <option value="yearly">سنوية متكررة</option>
    </select>
    <button className="quick-submit" onClick={onSubmit} disabled={!value.title.trim()}><Plus size={20} /></button>
  </section>;
}
