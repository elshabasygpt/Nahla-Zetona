'use client';

import { useState } from 'react';

export default function ContactWidget({ phoneNumber }: { phoneNumber?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const contactNumber = phoneNumber || '01115533537';
  
  // Format the number for international WhatsApp link (assuming Egypt +20)
  const whatsappNumber = contactNumber.startsWith('0') 
    ? `2${contactNumber}` 
    : contactNumber;

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-3">
      
      {/* Expanded Menu */}
      <div 
        className={`flex flex-col gap-3 transition-all duration-300 origin-bottom ${
          isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
        }`}
      >
        <a 
          href={`tel:${contactNumber}`}
          className="bg-sky-500 hover:bg-sky-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
          title="اتصال هاتفي"
        >
          <span className="material-symbols-outlined text-[28px]">call</span>
        </a>
        
        <a 
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] hover:bg-[#128C7E] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
          title="تواصل عبر واتساب"
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
             <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z" />
          </svg>
        </a>
      </div>

      {/* Main Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary hover:bg-primary-container hover:text-primary text-white h-14 px-6 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex items-center justify-center gap-2 transition-transform active:scale-95 z-50 font-bold border-2 border-white/20 animate-bounce"
        style={{ animationDuration: '3s' }}
        title="تواصل معنا"
      >
        <div className="relative w-7 h-7 flex items-center justify-center">
          <span className={`material-symbols-outlined transition-transform duration-300 text-[28px] ${isOpen ? 'rotate-180 scale-0' : 'rotate-0 scale-100'} absolute`}>forum</span>
          <span className={`material-symbols-outlined transition-transform duration-300 text-[28px] ${isOpen ? 'rotate-0 scale-100' : '-rotate-180 scale-0'} absolute`}>close</span>
        </div>
        <span className="text-base font-bold whitespace-nowrap">تواصل معنا</span>
      </button>

    </div>
  );
}
