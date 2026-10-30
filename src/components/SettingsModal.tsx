import { AnimatePresence, motion } from 'framer-motion';
import { KeyRound, Moon, Save, Settings2, Sun, X } from 'lucide-react';
import type { AppSettings } from '../types';

interface SettingsModalProps { open: boolean; settings: AppSettings; onChange: (settings: AppSettings) => void; onClose: () => void; onSave: () => void; }

export function SettingsModal({ open, settings, onChange, onClose, onSave }: SettingsModalProps) {
  return <AnimatePresence>
    {open && <div className="modal-layer"><motion.div className="modal-card surface" initial={{ opacity: 0, scale: .96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .96, y: 10 }}>
      <div className="modal-header"><span className="modal-title"><Settings2 size={18} /> إعدادات التطبيق</span><button className="icon-button" onClick={onClose}><X size={18} /></button></div>
      <p className="modal-description">إعداد Gemini اختياري. مفتاح Gemini يبقى في ذاكرة الجلسة ولا يُحفظ في التخزين المحلي. إعداد Firebase يتم عبر متغيرات البيئة في ملف .env.local.</p>
      <label className="field-label"><span><KeyRound size={15} /> Gemini API Key</span><input type="password" value={settings.geminiApiKey} onChange={(event) => onChange({ ...settings, geminiApiKey: event.target.value })} placeholder="اختياري — لا تضعه في الكود" /></label>
      <div className="theme-toggle"><span>المظهر</span><div><button className={settings.theme === 'light' ? 'active' : ''} onClick={() => onChange({ ...settings, theme: 'light' })}><Sun size={15} /> فاتح</button><button className={settings.theme === 'dark' ? 'active' : ''} onClick={() => onChange({ ...settings, theme: 'dark' })}><Moon size={15} /> داكن</button></div></div>
      <button className="primary-button full-button" onClick={onSave}><Save size={16} /> حفظ الإعدادات</button>
    </motion.div></div>}
  </AnimatePresence>;
}
