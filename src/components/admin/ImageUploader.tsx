'use client';
import { useState } from 'react';

export default function ImageUploader({ name, defaultValue, label, onChange }: { name: string, defaultValue?: string, label?: string, onChange?: (url: string) => void }) {
  const [url, setUrl] = useState(defaultValue || '');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setUrl(data.url);
        if (onChange) onChange(data.url);
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Upload error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-bold text-stone-600">{label}</label>}
      <div className="flex gap-4 items-center">
        {url && (
          <img src={url} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-stone-200" />
        )}
        <div className="flex-1 space-y-2">
          <input type="hidden" name={name} value={url} />
          <input 
            type="text" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
            placeholder="Image URL" 
            dir="ltr"
            className="w-full bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg outline-none focus:border-primary text-sm font-mono" 
          />
          <div className="relative">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            />
            <button type="button" disabled={isUploading} className="bg-stone-100 text-stone-600 px-4 py-2 rounded-lg text-sm font-bold w-full md:w-auto hover:bg-stone-200 transition-colors">
              {isUploading ? 'جاري الرفع...' : 'أو ارفع صورة من جهازك'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
