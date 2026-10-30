import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, WandSparkles } from 'lucide-react';

interface SmartInputProps {
  busy: boolean;
  onParse: (text: string) => Promise<void>;
}

export function SmartInput({ busy, onParse }: SmartInputProps) {
  const [open, setOpen] = useState(true);
  const [text, setText] = useState('');

  const submit = async () => {
    if (!text.trim() || busy) return;
    await onParse(text);
    setText('');
  };

  return (
    <section className="smart-card surface">
      <button className="smart-heading" onClick={() => setOpen((value) => !value)}>
        <span className="smart-heading-icon"><Sparkles size={18} /></span>
        <span><strong>إضافة ملخص المهام بالذكاء الاصطناعي ✨</strong><small>اكتب ملخص يومك وسيحوّله إلى مهام موزعة تلقائيًا</small></span>
        {open ? <ChevronUp size={19} /> : <ChevronDown size={19} />}
      </button>
      {open && <div className="smart-body">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="اكتب ملخص المهام هنا، مثلاً: غدًا اجتماع الساعة 10، وكل جمعة قراءة، ويوم 15 سداد الفاتورة، واليوم شراء مستلزمات البيت..."
          rows={4}
        />
        <div className="smart-footer">
          <span><WandSparkles size={14} /> يفهم التواريخ والتكرار تلقائيًا</span>
          <button className="primary-button" disabled={!text.trim() || busy} onClick={submit}>
            {busy ? 'جاري توزيع المهام...' : 'قسّم الملخص وأضف المهام ✨'}
          </button>
        </div>
      </div>}
    </section>
  );
}
