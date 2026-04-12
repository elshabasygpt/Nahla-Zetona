'use client';

import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface ActionCardProps {
  icon: string;
  iconColor: string;
  bgColor: string;
  title: string;
  description: string;
  buttonLabel: string;
  buttonColor: string;
  onAction: () => Promise<any>;
}

export default function SeoActionCard({
  icon, iconColor, bgColor, title, description, buttonLabel, buttonColor, onAction
}: ActionCardProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleAction = async () => {
    setStatus('loading');
    setError('');
    setResult(null);
    try {
      const res = await onAction();
      setResult(res);
      setStatus('success');
    } catch (e: any) {
      setError(e.message || 'حدث خطأ');
      setStatus('error');
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden`}>
      {/* Header */}
      <div className={`${bgColor} p-5 flex items-center gap-4`}>
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <span className={`material-symbols-outlined text-2xl ${iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
            {icon}
          </span>
        </div>
        <div>
          <h3 className="font-bold text-stone-900 text-lg">{title}</h3>
          <p className="text-stone-500 text-sm">{description}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {status === 'success' && result && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
            <p className="font-bold mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
              تمت العملية بنجاح
            </p>
            {result.urlsSubmitted && (
              <p>تم إرسال <strong>{result.urlsSubmitted}</strong> رابط لمحركات البحث</p>
            )}
            {result.revalidated && (
              <p>تم تحديث <strong>{result.revalidated.length}</strong> صفحة</p>
            )}
            {result.timestamp && (
              <p className="text-emerald-600 font-mono text-xs mt-1">{new Date(result.timestamp).toLocaleString('ar-EG')}</p>
            )}
            {result.engines && (
              <div className="mt-2 space-y-1">
                {Object.entries(result.engines).map(([key, val]: any) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${val?.ok ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    <span className="font-bold capitalize">{key}:</span>
                    <span>{val?.ok ? 'تم بنجاح' : val?.error || `كود ${val?.status}`}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            <p className="font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </p>
          </div>
        )}

        <button
          onClick={handleAction}
          disabled={status === 'loading'}
          className={`${buttonColor} text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2 w-full justify-center`}
        >
          {status === 'loading' ? (
            <>
              <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
              جاري التنفيذ...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">{icon}</span>
              {buttonLabel}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
