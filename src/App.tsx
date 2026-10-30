import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronDown, Download, LogOut, MoreHorizontal, Settings, ShieldCheck, Sparkles, Sun, Moon, UserRound, X } from 'lucide-react';
import { SmartInput } from './components/SmartInput';
import { QuickAdd } from './components/QuickAdd';
import { TaskRow } from './components/TaskRow';
import { UpcomingDrawer } from './components/UpcomingDrawer';
import { SettingsModal } from './components/SettingsModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import { useSettings } from './hooks/useSettings';
import { useTasks } from './hooks/useTasks';
import { formatArabicLongDate, todayKey } from './lib/date';
import { parseBrainDump } from './services/gemini';
import { isFirebaseConfigured } from './services/firebase';
import { signInDemo, signInWithGoogle, signOutUser, subscribeToAuth } from './services/auth';
import type { DemoUser, Task, TaskInput } from './types';

const emptyInput = (): TaskInput => ({ title: '', dueDate: todayKey(), recurrence: 'once' });

function App() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const signedIn = Boolean(user);
  useEffect(() => subscribeToAuth(setUser), []);
  const [profileOpen, setProfileOpen] = useState(false);
  const [upcomingOpen, setUpcomingOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [completedOpen, setCompletedOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [quickInput, setQuickInput] = useState<TaskInput>(emptyInput);
  const [toast, setToast] = useState<{ message: string; undoIds?: string[] } | null>(null);
  const { settings, setSettings } = useSettings();
  const { ready: tasksReady, groups, addTask, addTasks, toggleTask, updateTask, deleteTask, moveToToday, moveAllToToday } = useTasks(user?.uid ?? 'demo-user');
  const { canInstall, install } = useInstallPrompt();

  const progress = useMemo(() => {
    const total = groups.today.length + groups.completed.length;
    return total ? Math.round((groups.completed.length / total) * 100) : 0;
  }, [groups]);

  const showToast = (message: string, undoIds?: string[]) => {
    setToast({ message, undoIds });
    window.setTimeout(() => setToast(null), 5200);
  };

  const handleQuickAdd = () => {
    if (!quickInput.title.trim()) return;
    addTask({ ...quickInput, title: quickInput.title.trim() });
    setQuickInput(emptyInput());
    showToast('أُضيفت المهمة إلى يومك.');
  };

  const handleBrainDump = async (text: string) => {
    setBusy(true);
    try {
      const parsed = await parseBrainDump(text, settings.geminiApiKey);
      if (!parsed.length) {
        showToast('لم أجد مهام واضحة في النص. جرّب كتابة كل مهمة في سطر.');
        return;
      }
      const created = addTasks(parsed);
      showToast(`تمت إضافة ${created.length} مهام إلى جدولك.`, created.map((task) => task.id));
    } catch {
      showToast('تعذر تحليل النص الآن. تأكد من مفتاح Gemini أو استخدم الوضع المحلي.');
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = (task: Task) => {
    const title = window.prompt('عدّل عنوان المهمة', task.title);
    if (title?.trim()) updateTask(task.id, { title: title.trim() });
  };

  const handleSaveSettings = () => {
    setSettings(settings);
    setSettingsOpen(false);
    showToast('تم حفظ إعداداتك على هذا الجهاز.');
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    setProfileOpen(false);
  };

  const handleSignIn = async () => {
    try {
      const signedInUser = await signInWithGoogle();
      setUser(signedInUser);
    } catch (error) {
      console.error('Google sign-in failed', error);
      window.alert('تعذر تسجيل الدخول باستخدام Google. تحقق من إعداد Firebase والنطاقات المصرّح بها ثم حاول مجددًا.');
    }
  };

  const handleDemoSignIn = async () => setUser(await signInDemo());

  if (!signedIn) return <WelcomeScreen onSignIn={handleSignIn} onDemoSignIn={handleDemoSignIn} firebaseAvailable={isFirebaseConfigured} />;
  if (!tasksReady) return <main className="welcome-shell"><div className="welcome-card surface"><span className="eyebrow">جارٍ تحميل مهامك من Firebase…</span></div></main>;

  return <div className="app-shell">
    <div className="app-container">
      <header className="app-header">
        <div className="brand-lockup"><div className="brand-mark"><ShieldCheck size={24} /><span><Sparkles size={10} /></span></div><div><strong>Tamer <em>Do List</em></strong><small>وضوح أكثر. يوم أخف.</small></div></div>
        <div className="header-actions">
          {canInstall && <button className="header-action install-action" onClick={install}><Download size={16} /> <span>تثبيت التطبيق</span></button>}
          <button className="icon-button header-icon" onClick={() => setUpcomingOpen(true)} aria-label="جدول المهام المستقبلية"><CalendarDays size={19} /><span className="action-dot" /></button>
          <div className="profile-wrap">
            <button className="profile-button" onClick={() => setProfileOpen((value) => !value)}><span className="avatar">T</span><ChevronDown size={15} /></button>
            {profileOpen && <div className="profile-menu surface"><div className="profile-summary"><span className="avatar large">T</span><div><strong>{user?.displayName ?? 'User'}</strong><small>{user?.isDemo ? 'وضع Demo المحلي' : user?.email}</small></div></div><button onClick={() => { setSettingsOpen(true); setProfileOpen(false); }}><Settings size={16} /> إعدادات وتكاملات</button><button onClick={() => setSettings((value) => ({ ...value, theme: value.theme === 'light' ? 'dark' : 'light' }))}>{settings.theme === 'light' ? <Moon size={16} /> : <Sun size={16} />} تبديل المظهر</button><button className="danger-text" onClick={handleSignOut}><LogOut size={16} /> تسجيل الخروج</button></div>}
          </div>
        </div>
      </header>

      <section className="greeting-row"><div><span className="eyebrow">{formatArabicLongDate()}</span><h1>خلّينا نرتّب يومك <span>بخطوة واحدة.</span></h1></div><div className="progress-card soft-surface"><div className="progress-ring"><span>{progress}%</span></div><div><strong>{progress === 100 ? 'يوم مكتمل' : 'تركيز اليوم'}</strong><small>{groups.completed.length} منجزة · {groups.today.length} متبقية</small></div></div></section>

      <main className="focus-layout">
        <SmartInput busy={busy} onParse={handleBrainDump} />
        <QuickAdd value={quickInput} onChange={setQuickInput} onSubmit={handleQuickAdd} />

        {groups.overdue.length > 0 && <section className="task-section overdue-section"><div className="section-heading"><div className="section-title-wrap"><span className="section-icon amber"><CalendarDays size={17} /></span><div><h2>مهام متأخرة <span className="warning-mark">⚠</span></h2><small>خطوة صغيرة الآن أفضل من تأجيل جديد</small></div><span className="count-badge amber-count">{groups.overdue.length}</span></div><button className="text-button" onClick={moveAllToToday}>نقل الكل لليوم</button></div><div className="task-list">{groups.overdue.map((task) => <TaskRow key={task.id} task={task} overdue onToggle={toggleTask} onMoveToToday={moveToToday} onEdit={handleEdit} onDelete={deleteTask} />)}</div></section>}

        <section className="task-section today-section"><div className="section-heading"><div className="section-title-wrap"><span className="section-icon mint"><Sparkles size={17} /></span><div><h2>مهام اليوم الحالي <span className="target-mark">🎯</span></h2><small>المهام التي تستحق انتباهك الآن</small></div><span className="count-badge">{groups.today.length}</span></div><span className="section-note">{groups.today.length ? 'ركّز على واحدة فقط' : 'أحسنت، المساحة هادئة'}</span></div>{groups.today.length ? <div className="task-list">{groups.today.map((task) => <TaskRow key={task.id} task={task} onToggle={toggleTask} onEdit={handleEdit} onDelete={deleteTask} />)}</div> : <div className="calm-empty"><div className="empty-orbit"><ShieldCheck size={31} /></div><strong>كل شيء في مكانه.</strong><p>أنجزت مهام اليوم أو لم تضف مهامًا بعد. خذ نفسًا واحتفل بالتقدم.</p></div>}</section>

        <section className="task-section completed-section"><button className="completed-heading" onClick={() => setCompletedOpen((value) => !value)}><div className="section-title-wrap"><span className="section-icon done"><ShieldCheck size={17} /></span><div><h2>المهام المنجزة <span>✅</span></h2><small>المنجزة اليوم ({groups.completed.length})</small></div></div><div className="completed-toggle"><MoreHorizontal size={17} /> <ChevronDown size={17} className={completedOpen ? 'rotated' : ''} /></div></button>{completedOpen && <div className="task-list">{groups.completed.length ? groups.completed.map((task) => <TaskRow key={task.id} task={task} completed onToggle={toggleTask} onEdit={handleEdit} onDelete={deleteTask} />) : <div className="completed-empty">ستظهر هنا المهام التي تنجزها اليوم.</div>}</div>}</section>
      </main>

      <footer className="app-footer"><span><span className="footer-dot" /> {user?.isDemo ? 'وضع Demo المحلي مفعّل' : 'مزامنة Firebase مفعّلة'}</span><span>{user?.isDemo ? 'بياناتك محفوظة على هذا الجهاز' : 'بياناتك مرتبطة بحسابك'}</span></footer>
    </div>
    <UpcomingDrawer open={upcomingOpen} tasks={groups.upcoming} onClose={() => setUpcomingOpen(false)} onEdit={handleEdit} />
    <SettingsModal open={settingsOpen} settings={settings} onChange={setSettings} onClose={() => setSettingsOpen(false)} onSave={handleSaveSettings} />
    {toast && <div className="toast surface"><span>{toast.message}</span>{toast.undoIds?.length ? <button onClick={() => { toast.undoIds?.forEach(deleteTask); setToast(null); }}>تراجع</button> : <button onClick={() => setToast(null)} aria-label="إغلاق"><X size={15} /></button>}</div>}
  </div>;
}

export default App;
