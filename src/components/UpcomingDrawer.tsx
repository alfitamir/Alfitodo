import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpLeft, CalendarClock, X } from 'lucide-react';
import type { Task } from '../types';
import { formatShortArabicDate, todayKey } from '../lib/date';
import { recurrenceLabels } from '../types';

interface UpcomingDrawerProps { open: boolean; tasks: Task[]; onClose: () => void; onEdit: (task: Task) => void; }

export function UpcomingDrawer({ open, tasks, onClose, onEdit }: UpcomingDrawerProps) {
  return <AnimatePresence>
    {open && <>
      <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.aside className="upcoming-drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 26, stiffness: 260 }}>
        <div className="drawer-header"><div><span className="eyebrow">خارج نطاق اليوم</span><h2>جدول المهام المستقبلية</h2></div><button className="icon-button" onClick={onClose}><X size={19} /></button></div>
        <div className="drawer-list">
          {tasks.length === 0 ? <div className="empty-drawer"><CalendarClock size={30} /><p>لا توجد مهام مجدولة بعد.</p><small>أضف تاريخًا مستقبليًا من شريط الإضافة السريعة.</small></div> : tasks.map((task) => <button className="upcoming-item" key={task.id} onClick={() => onEdit(task)}><span className="upcoming-date">{formatShortArabicDate(task.dueDate)}</span><strong>{task.title}</strong><span className="upcoming-type">{task.recurrence !== 'once' ? recurrenceLabels[task.recurrence] : 'مهمة واحدة'} <ArrowUpLeft size={13} /></span></button>)}
        </div>
        <div className="drawer-tip">اليوم هو <strong>{formatShortArabicDate(todayKey())}</strong>. اترك الشاشة الرئيسية للتركيز فقط.</div>
      </motion.aside>
    </>}
  </AnimatePresence>;
}
