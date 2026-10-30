import { Check, ShieldCheck } from 'lucide-react';

interface WelcomeScreenProps { onSignIn: () => void; }

export function WelcomeScreen({ onSignIn }: WelcomeScreenProps) {
  return <main className="welcome-shell"><div className="welcome-card surface"><div className="welcome-mark"><ShieldCheck size={30} /><span><Check size={15} /></span></div><span className="eyebrow">مساحتك اليومية الهادئة</span><h1>Tamer <em>Do List</em></h1><p>رتّب ما يدور في بالك، وخلّي تركيزك على الخطوة التالية فقط.</p><button className="google-button" onClick={onSignIn}><span className="google-letter">G</span> تسجيل الدخول باستخدام حساب Google</button><small className="demo-note">يمكنك الدخول الآن بوضع Demo المحلي للتجربة الفورية.</small></div></main>;
}
