'use client';

import { useState } from "react";

export default function ProductTabs({ dict }: { dict: any }) {
  const [activeTab, setActiveTab] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewText, setNewReviewText] = useState("");
  const [visibleCount, setVisibleCount] = useState(4);
  const [reviews, setReviews] = useState(dict.productDetail.mockReviews || []);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewText.trim()) return;

    const newReview = {
      name: newReviewName,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      rating,
      text: newReviewText
    };

    setReviews([newReview, ...reviews]);
    setShowReviewForm(false);
    setNewReviewName("");
    setNewReviewText("");
    setRating(5);
  };

  return (
    <section className="mt-24">
      <div className="border-b border-stone-200">
        <nav className="flex gap-8 overflow-x-auto whitespace-nowrap hide-scrollbar">
          {[0, 1, 2].map((idx) => (
            <button 
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${
                activeTab === idx 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {dict.productDetail.tabs[idx]}
            </button>
          ))}
        </nav>
      </div>

      <div className="py-12 min-h-[400px]">
        {/* Tab 0: Benefits (Superfood) */}
        {activeTab === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h3 className="text-3xl font-serif text-primary mb-6">{dict.productDetail.superfoodTitle}</h3>
              <div className="space-y-6">
                {[
                  { icon: 'bolt' },
                  { icon: 'self_improvement' },
                  { icon: 'psychology' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-secondary-container/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary">{item.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-800 mb-1">{dict.productDetail.superfood[idx].title}</h4>
                      <p className="text-stone-500 text-sm leading-relaxed">{dict.productDetail.superfood[idx].desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-surface-container-low p-2 rounded-2xl">
              <img className="rounded-xl w-full h-80 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCw7rvCvpuCRO8s3y3nFrxHg-B8TUlr2OWuWibd7McVSWmSDWrkdD9RYlQDTog0DnsCxIADefL7gj2vPmiphtbU5onf49JkBfRyjOTU5tC-MGFr83sdOeJOMBf4-nBhH3OyfjxSIjAkUIF7PklLdUw042d92wLTxrEQ55x-ZRH7yMfI3xN2_5Be2aap3VZbpMPJ5s7O7XM8qulrCNXE_1v47N838U7sLMMEynWU30q2-UqvIZM7oIJbIfZAjD5tY95AsSJDrS2oJmY" alt="Artistic macro photo of honeycomb drips" />
            </div>
          </div>
        )}

        {/* Tab 1: Usage Instructions */}
        {activeTab === 1 && (
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h3 className="text-3xl font-serif text-primary mb-8">{dict.productDetail.tabs[1]}</h3>
             <ul className="space-y-6">
                {(dict.productDetail.usageInstructions || []).map((instruction: any, idx: number) => {
                  const colors = [
                    'bg-primary/10 text-primary',
                    'bg-secondary/10 text-secondary',
                    'bg-stone-100 text-stone-500'
                  ];
                  return (
                    <li key={idx} className="flex gap-6 items-start bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30">
                      <div className={`${colors[idx % colors.length]} w-12 h-12 rounded-full flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined">{instruction.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-800 mb-2 truncate">{instruction.title}</h4>
                        <p className="text-stone-600 leading-relaxed text-sm">{instruction.desc}</p>
                      </div>
                    </li>
                  )
                })}
             </ul>
          </div>
        )}

        {/* Tab 2: Reviews */}
        {activeTab === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-end justify-between mb-10 pb-6 border-b border-stone-200">
              <div>
                <h3 className="text-3xl font-serif text-primary mb-2">{dict.productDetail.reviewsTab?.title || "Customer Reviews"}</h3>
                <div className="flex items-center gap-4">
                  <div className="flex text-secondary-container rtl:flex-row-reverse text-xl">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined rtl:-scale-x-100">star_half</span>
                  </div>
                  <span className="font-bold text-stone-700">4.8 / 5 {dict.productDetail.reviewsTab?.basedOn} {reviews.length + 124} {dict.productDetail.reviewsTab?.reviewsWord}</span>
                </div>
              </div>
              <button 
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold hover:bg-primary-container transition-colors shadow-md"
              >
                {showReviewForm ? dict.productDetail.reviewsTab?.cancel : dict.productDetail.reviewsTab?.writeReview}
              </button>
            </div>

            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="bg-surface-container-low p-8 rounded-2xl mb-10 animate-in fade-in slide-in-from-top-4">
                <h4 className="text-xl font-serif text-primary mb-6">{dict.productDetail.reviewsTab?.writeReview}</h4>
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-bold text-stone-700">{dict.productDetail.reviewsTab?.ratingLabel}</span>
                  <div className="flex text-secondary-container rtl:flex-row-reverse cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span 
                        key={star} 
                        onClick={() => setRating(star)}
                        className="material-symbols-outlined hover:scale-110 transition-transform" 
                        style={{ fontVariationSettings: `'FILL' ${rating >= star ? 1 : 0}` }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-stone-600 mb-2">{dict.productDetail.reviewsTab?.nameLabel}</label>
                    <input 
                      type="text" 
                      required
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary outline-none" 
                      placeholder={dict.productDetail.reviewsTab?.namePlaceholder} 
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-stone-600 mb-2">{dict.productDetail.reviewsTab?.reviewLabel}</label>
                  <textarea 
                    required
                    rows={4}
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none" 
                    placeholder={dict.productDetail.reviewsTab?.reviewPlaceholder}
                  ></textarea>
                </div>
                <button type="submit" className="bg-secondary text-on-secondary px-8 py-3 rounded-full font-bold hover:bg-secondary/80 transition-colors shadow-md">
                  {dict.productDetail.reviewsTab?.submit}
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reviews.slice(0, visibleCount).map((review: any, rIdx: number) => (
                <div key={rIdx} className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/20">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-stone-800">{review.name}</h4>
                      <span className="text-xs text-stone-400 font-medium">{review.date}</span>
                    </div>
                    <div className="flex text-secondary-container rtl:flex-row-reverse text-sm">
                      {Array.from({length: 5}).map((_, i) => (
                        <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: `\'FILL\' ${i < review.rating ? 1 : 0}` }}>star</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
            
            {visibleCount < reviews.length && (
              <div className="mt-8 text-center">
                 <button 
                   onClick={() => setVisibleCount(visibleCount + 4)}
                   className="text-primary font-bold text-sm underline decoration-2 underline-offset-8 hover:text-secondary mb-4"
                 >
                   {dict.productDetail.reviewsTab?.loadMore}
                 </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
