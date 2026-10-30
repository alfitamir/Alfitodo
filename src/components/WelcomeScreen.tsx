import { Check, ShieldCheck } from 'lucide-react';

interface WelcomeScreenProps {
  onSignIn: () => void;
  onDemoSignIn: () => void;
  firebaseAvailable: boolean;
}

export function WelcomeScreen({ onSignIn, onDemoSignIn, firebaseAvailable }: WelcomeScreenProps) {
  return <main className="welcome-shell"><div className="welcome-card surface"><div className="welcome-mark"><ShieldCheck size={30} /><span><Check size={15} /></span></div><span className="eyebrow">مساحتك اليومية الهادئة</span><h1>Tamer <em>Do List</em></h1><p>رتّب ما يدور في بالك، وخلّي تركيزك على الخطوة التالية فقط.</p>
    {firebaseAvailable && <button className="google-button" onClick={onSignIn}><span className="google-letter">G</span> تسجيل الدخول باستخدام حساب Google</button>}
    {!firebaseAvailable && <p className="demo-note">لم يتم إعداد Firebase بعد. أضف متغيرات البيئة لتفعيل تسجيل الدخول والمزامنة السحابية.</p>}
    <button className="primary-button full-button" onClick={onDemoSignIn}>المتابعة بوضع Demo المحلي</button>
    <small className="demo-note">بيانات وضع Demo محفوظة محليًا على هذا الجهاز فقط.</small>
  </div></main>;
}
