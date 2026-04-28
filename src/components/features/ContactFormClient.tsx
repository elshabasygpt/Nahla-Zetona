'use client';

import { useState } from 'react';

export default function ContactFormClient({ t }: { t: any }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-8 rounded-2xl text-center space-y-4">
        <span className="material-symbols-outlined text-6xl text-emerald-500 block mb-2">mark_email_read</span>
        <h3 className="text-2xl font-bold">تم إرسال رسالتك بنجاح!</h3>
        <p>شكراً لتواصلك معنا، سنقوم بالرد عليك في أقرب وقت ممكن.</p>
        <button 
          onClick={() => setStatus('idle')} 
          className="bg-emerald-600 text-white px-6 py-2 rounded-xl mt-4 font-bold hover:bg-emerald-700 transition"
        >
          إرسال رسالة أخرى
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === 'error' && (
        <div className="bg-error/10 text-error p-4 rounded-xl font-bold flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          عذراً، حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى أو الاتصال بنا مباشرة.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-stone-600 mb-2">{t.name}</label>
          <input 
            required 
            name="name"
            value={formData.name}
            onChange={handleChange}
            type="text" 
            className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-stone-600 mb-2">{t.email}</label>
          <input 
            required 
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email" 
            className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-left" 
            dir="ltr" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-stone-600 mb-2">رقم الموبايل (اختياري)</label>
          <input 
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            type="tel" 
            className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-stone-600 mb-2">{t.subject}</label>
          <input 
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            type="text" 
            className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-stone-600 mb-2">{t.message}</label>
        <textarea 
          required
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={6} 
          className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
        ></textarea>
      </div>

      <div className="pt-2">
        <button 
          type="submit" 
          disabled={status === 'loading'}
          className="bg-stone-800 hover:bg-stone-900 justify-center disabled:opacity-70 text-white font-bold py-4 px-10 rounded-xl transition-colors w-full md:w-auto shadow-md active:scale-95 flex gap-2 items-center"
        >
          {status === 'loading' ? (
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
          ) : (
            <>
              <span>{t.send}</span>
              <span className="material-symbols-outlined rtl:-scale-x-100">send</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
