import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Check, ChevronLeft, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { Task } from '../types';
import { formatShortArabicDate, todayKey } from '../lib/date';
import { recurrenceLabels } from '../types';

interface TaskRowProps {
  task: Task;
  overdue?: boolean;
  completed?: boolean;
  onToggle: (id: string) => void;
  onMoveToToday?: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskRow({ task, overdue, completed, onToggle, onMoveToToday, onEdit, onDelete }: TaskRowProps) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: completed ? 0.58 : 1, y: 0 }}
      exit={{ opacity: 0, x: -18, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className={`task-row ${completed ? 'task-row-completed' : ''} ${overdue ? 'task-row-overdue' : ''}`}
    >
      <button className={`check-button ${completed ? 'checked' : ''}`} onClick={() => onToggle(task.id)} aria-label={completed ? 'إلغاء الإنجاز' : 'إنجاز المهمة'}>
        <AnimatePresence mode="wait" initial={false}>
          {completed && <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check size={16} strokeWidth={3} /></motion.span>}
        </AnimatePresence>
      </button>
      <div className="task-copy">
        <p className="task-title">{task.title}</p>
        <div className="task-meta">
          {overdue && <span className="meta-date overdue-date"><CalendarDays size={13} /> فاتت في {formatShortArabicDate(task.dueDate)}</span>}
          {!overdue && task.dueDate !== todayKey() && !completed && <span className="meta-date"><CalendarDays size={13} /> {formatShortArabicDate(task.dueDate)}</span>}
          {task.recurrence !== 'once' && <span className="recurrence-pill">{recurrenceLabels[task.recurrence]}</span>}
        </div>
      </div>
      <div className="task-actions">
        {overdue && onMoveToToday && <button className="row-action move-action" onClick={() => onMoveToToday(task.id)}><ChevronLeft size={15} /> نقل لليوم</button>}
        <button className="icon-button subtle" onClick={() => onEdit(task)} aria-label="تعديل"><Pencil size={16} /></button>
        <button className="icon-button subtle danger" onClick={() => onDelete(task.id)} aria-label="حذف"><Trash2 size={16} /></button>
        <MoreHorizontal size={18} className="more-icon" />
      </div>
    </motion.article>
  );
}
