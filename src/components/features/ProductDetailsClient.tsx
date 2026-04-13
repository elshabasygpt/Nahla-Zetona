'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AddToCartButton from "@/components/features/AddToCartButton";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useCartStore } from "@/store/useCartStore";
import type { Product } from '@prisma/client';
import { trackViewContent, trackAddToCart, trackInitiateCheckout } from '@/lib/pixelEvents';

export default function ProductDetailsClient({ 
  product, 
  dict, 
  lang 
}: { 
  product: Product & { reviews?: any[] };
  dict: any;
  lang: string;
}) {
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, name: reviewName, rating: reviewRating, comment: reviewComment })
      });
      if (res.ok) {
        setReviewSuccess(true);
        setReviewName('');
        setReviewComment('');
        setReviewRating(5);
      }
    } catch {
      alert(lang === 'ar' ? 'فشل إرسال التقييم' : 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };
  const router = useRouter();
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'benefits' | 'usage' | 'reviews'>('desc');
  const [activeImage, setActiveImage] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const name = lang === 'ar' ? product.nameAr : product.nameEn;
  const isRtl = lang === 'ar';

  const isLiquid = name.toLowerCase().includes('oil') || name.toLowerCase().includes('زيت') || product.slug.includes('oil');
  const availableSizes = isLiquid 
    ? (isRtl ? ['٢٥٠ مل', '٥٠٠ مل', '١ لتر'] : ['250ml', '500ml', '1L'])
    : (isRtl ? ['٢٥٠ جم', '٥٠٠ جم', '١ كجم'] : ['250g', '500g', '1kg']);
  const [selectedSize, setSelectedSize] = useState(availableSizes[1]);

  const getPriceMultiplier = (size: string) => {
    const idx = availableSizes.indexOf(size);
    if (idx === 0) return 0.6; // Small size is 60% of base price
    if (idx === 2) return 1.8; // Large size is 180% of base price
    return 1; // Default
  };

  const currentPrice = product.price * getPriceMultiplier(selectedSize);
  const currentOriginalPrice = product.originalPrice ? product.originalPrice * getPriceMultiplier(selectedSize) : null;

  const desc = lang === 'ar' ? product.descAr : product.descEn;
  const badge = lang === 'ar' ? product.badgeAr : product.badgeEn;

  const handleBuyNow = () => {
    addItem({ 
      id: `${product.id}-${selectedSize || 'default'}`, 
      name, 
      price: currentPrice, 
      image: product.img || '', 
      quantity, 
      size: selectedSize 
    });
    // Fire InitiateCheckout on Buy Now
    trackInitiateCheckout(currentPrice * quantity);
    router.push(`/${lang}/checkout`);
  };

  // Fire ViewContent when product page is opened
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    trackViewContent({
      id: product.id,
      name,
      price: product.price,
    });
  }, [product.id]);

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ${dict.common.currency || (isRtl ? 'ج.م' : 'EGP')}`;
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  const bundleItems = product.isBundle 
    ? (isRtl ? product.bundleItemsAr : product.bundleItemsEn) 
    : [];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        
        {/* Left Side: Image Gallery */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-7 relative"
        >
          <div className="sticky top-32">
            <div className="aspect-[4/5] md:aspect-square bg-surface-variant/30 rounded-3xl overflow-hidden relative shadow-2xl ring-1 ring-black/5">
              {badge && (
                <div className={`absolute top-6 ${isRtl ? 'right-6' : 'left-6'} z-10`}>
                  <div className="backdrop-blur-md bg-secondary-container/90 text-on-secondary-container px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                    {badge}
                  </div>
                </div>
              )}
              
              {product.img ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full cursor-zoom-in"
                >
                  <img src={product.img} alt={name} className="w-full h-full object-cover" />
                </motion.div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300">
                  <span className="material-symbols-outlined text-6xl opacity-30">image</span>
                </div>
              )}
            </div>

            {/* Mock Thumbnail Gallery */}
            {product.img && (
              <div className="flex gap-4 mt-6">
                {[product.img, product.img, product.img].map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden ring-2 relative transition-all ${
                      activeImage === i ? 'ring-primary opacity-100 scale-105' : 'ring-transparent opacity-60 hover:opacity-100 hover:ring-primary/50'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${i+1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Side: Product Actions & Info */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="lg:col-span-5"
        >
          <div className="sticky top-32">
            <motion.div variants={fadeInUp} className="mb-8">
              <h1 className="text-4xl md:text-5xl font-serif text-primary leading-tight mb-4 drop-shadow-sm">{name}</h1>
              
              <div className="flex flex-wrap items-baseline gap-4 mb-4">
                <span className="text-5xl font-serif font-bold theme-price-text tracking-tight">
                  {formatPrice(currentPrice)}
                </span>
                {currentOriginalPrice && (
                  <span className="text-xl text-on-surface-variant/60 line-through decoration-1">
                    {formatPrice(currentOriginalPrice)}
                  </span>
                )}
                {currentOriginalPrice && (
                  <span className="bg-error/10 text-error px-3 py-1 rounded-full text-xs font-bold">
                    -{Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Urgency & Trust Signals */}
              <div className="flex flex-col gap-4 mb-8">
                {/* Views Counter */}
                <div className="relative overflow-hidden flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-error/5 to-error/10 border border-error/20 shadow-sm">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-error/50 to-transparent"></div>
                  <div className="w-10 h-10 shrink-0 rounded-full bg-error/10 flex items-center justify-center text-error relative">
                    <span className="absolute inset-0 rounded-full bg-error/20 animate-ping opacity-75"></span>
                    <span className="material-symbols-outlined text-2xl relative z-10 animate-pulse">local_fire_department</span>
                  </div>
                  <div>
                    <span className="block font-bold text-error text-sm mb-0.5">
                      {isRtl ? 'طَلَب عالي جداً!' : 'High Demand!'}
                    </span>
                    <span className="text-on-surface-variant font-medium text-xs md:text-sm">
                      <strong className="text-error font-extrabold px-1">15</strong>
                      {isRtl ? 'شخصاً يشاهدون هذا المنتج الآن' : 'people are looking at this right now'}
                    </span>
                  </div>
                </div>

                {/* Stock Warning with Progress Bar */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/30 border border-amber-200 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-amber-700 font-bold text-sm md:text-base">
                      <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                      <span>{isRtl ? 'أسرع، الكمية توشك على النفاذ!' : 'Hurry, stock is running out!'}</span>
                    </div>
                    <span className="font-bold text-error bg-error/10 px-3 py-1 rounded-full text-xs animate-pulse border border-error/20 whitespace-nowrap">
                      {isRtl ? 'تبقى 5 فقط' : 'Only 5 left'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-amber-200/40 rounded-full overflow-hidden flex">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-error to-amber-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bundle UI */}
            {product.isBundle && bundleItems.length > 0 && (
              <motion.div variants={fadeInUp} className="mb-8 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">inventory_2</span>
                  {dict.cart.bundleIncludes || (isRtl ? 'تحتوي هذه المجموعة على:' : 'This bundle includes:')}
                </h3>
                <ul className="space-y-3">
                  {bundleItems.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-on-surface">
                      <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            <motion.div variants={fadeInUp} className="bg-surface-container-lowest p-8 rounded-[2rem] border border-surface-container shadow-sm mb-12">
              
              {/* Package Size Selector */}
              <div className="mb-6 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-stone-700">
                    {isRtl ? 'العبوة' : 'Package Size'}
                  </label>
                  <span className="text-xs text-primary font-bold">{selectedSize}</span>
                </div>
                <div className="flex items-center gap-3">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`flex-1 py-3 px-2 rounded-xl border text-sm font-bold transition-all shadow-sm ${
                        selectedSize === size 
                          ? 'border-primary bg-primary text-on-primary shadow-primary/20' 
                          : 'border-surface-container bg-surface hover:border-primary/50 text-stone-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6 flex flex-col gap-4">
                <label className="text-sm font-medium text-stone-600 block">
                  {isRtl ? 'الكمية' : 'Quantity'}
                </label>
                <div className="flex items-center w-full bg-surface-variant/30 rounded-2xl p-2 border border-surface-container">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-surface hover:bg-surface-container transition-colors shadow-sm text-lg text-primary"
                  >-</button>
                  <div className="flex-1 text-center font-bold text-xl text-on-surface">
                    {quantity}
                  </div>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-surface hover:bg-surface-container transition-colors shadow-sm text-lg text-primary"
                  >+</button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <AddToCartButton 
                  id={product.id.toString()}
                  name={name}
                  price={currentPrice}
                  image={product.img || ""}
                  quantity={quantity}
                  size={selectedSize}
                  label={dict.cart?.add || (isRtl ? 'أضف إلى السلة' : 'Add to Cart')}
                  successMessage={dict.cart?.success || (isRtl ? 'تمت الإضافة بنجاح' : 'Added successfully')}
                  className="w-full bg-surface-variant text-on-surface py-5 rounded-full font-bold text-xl hover:bg-surface-container-high transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                />
                <button 
                  onClick={handleBuyNow}
                  className="w-full bg-primary text-on-primary py-5 rounded-full font-bold text-xl hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">bolt</span>
                  {isRtl ? 'اشتري الآن' : 'Buy Now'}
                </button>
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4 divide-y sm:divide-y-0 sm:divide-x rtl:sm:divide-x-reverse divide-surface-container text-sm text-stone-500 justify-center">
                <div className="flex items-center gap-3 pt-4 sm:pt-0 sm:px-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                  </div>
                  <span className="font-medium">{isRtl ? 'شحن سريع متاح' : 'Fast Shipping Option'}</span>
                </div>
                <div className="flex items-center gap-3 pt-4 sm:pt-0 sm:px-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                  </div>
                  <span className="font-medium">{isRtl ? 'أصلي وطبيعي 100%' : '100% Genuine & Natural'}</span>
                </div>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>

      {/* Frequently Bought Together */}
      <div className="mt-20 max-w-5xl mx-auto bg-primary/5 rounded-[2rem] p-8 md:p-12 border border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <h2 className="text-3xl font-serif font-bold text-primary mb-8">{isRtl ? 'اشتري معاً واحصل على خصم 15%' : 'Frequently Bought Together'}</h2>
        
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex items-center gap-6 flex-1">
            <div className="w-24 h-24 bg-surface rounded-2xl overflow-hidden shadow-sm border border-surface-container shrink-0 p-2">
              <img src={product.img || ""} alt={name} className="w-full h-full object-cover rounded-xl" />
            </div>
            <span className="material-symbols-outlined text-4xl text-stone-300">add</span>
            <div className="w-24 h-24 bg-surface rounded-2xl overflow-hidden shadow-sm border border-surface-container shrink-0 p-2 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-primary/40">eco</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-4 min-w-[200px]">
            <div className="text-center md:text-end">
              <div className="text-3xl font-bold text-primary block">{formatPrice(currentPrice * 1.8)}</div>
              <div className="text-sm text-stone-500 line-through mt-1">{formatPrice(currentPrice * 2)}</div>
            </div>
            <button className="bg-secondary text-on-secondary px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined">add_shopping_cart</span>
              {isRtl ? 'أضف المجموعة' : 'Add Bundle'}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Tabs - Full Width Centered */}
      <div className="mt-24 max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex overflow-x-auto snap-x hide-scrollbar whitespace-nowrap p-1.5 bg-surface-container-lowest rounded-2xl mb-8 gap-1 shadow-sm border border-surface-container">
            {[
              { id: 'desc', label: isRtl ? 'الوصف' : 'Description', icon: 'info' },
              { id: 'benefits', label: isRtl ? 'الفوائد' : 'Benefits', icon: 'verified' },
              { id: 'usage', label: isRtl ? 'طريقة الاستخدام' : 'Usage', icon: 'menu_book' },
              { id: 'reviews', label: isRtl ? 'التقييمات' : 'Reviews', icon: 'star' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[120px] py-4 lg:px-6 px-2 rounded-xl text-base font-bold transition-all relative flex items-center justify-center gap-2 z-10 ${
                  activeTab === tab.id ? 'text-on-primary' : 'text-stone-500 hover:text-stone-700 hover:bg-surface-variant/50'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-md"
                    transition={{ duration: 0.3 }}
                  />
                )}
                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="prose prose-stone text-on-surface-variant bg-surface-container-lowest p-8 md:p-12 rounded-[2rem] border border-surface-container shadow-sm min-h-[250px] mx-auto w-full max-w-none"
            >
              {activeTab === 'desc' && (
                <p className="text-xl leading-relaxed text-center md:text-start">{desc}</p>
              )}
              {activeTab === 'benefits' && (
                <ul className="space-y-5 mt-4 text-xl">
                  <li className="flex gap-4 items-center"><span className="material-symbols-outlined text-primary text-2xl">check_circle</span> {isRtl ? 'يعزز المناعة ويحسن الصحة العامة لاحتوائه على مضادات الأكسدة.' : 'Boosts immunity and improves overall health with antioxidants.'}</li>
                  <li className="flex gap-4 items-center"><span className="material-symbols-outlined text-primary text-2xl">check_circle</span> {isRtl ? 'طبيعي 100% وخالي من السكر الصناعي والمواد الحافظة.' : '100% natural, free from artificial sugars and preservatives.'}</li>
                  <li className="flex gap-4 items-center"><span className="material-symbols-outlined text-primary text-2xl">check_circle</span> {isRtl ? 'يساعد في تحسين عملية الهضم عند تناوله بانتظام.' : 'Helps improve digestion when consumed regularly.'}</li>
                </ul>
              )}
              {activeTab === 'usage' && (
                <div className="space-y-6 mt-4 text-xl">
                  <p className="font-bold mb-6 text-primary">{isRtl ? 'يمكنك استخدام هذا المنتج بأكثر من طريقة للاستفادة القصوى:' : 'You can use this product in multiple ways to get the maximum benefit:'}</p>
                  <ul className="space-y-5 ps-2 border-s-4 border-primary/20 rtl:border-s-0 rtl:border-r-4 rtl:pr-6">
                    <li><strong className="text-on-surface">{isRtl ? 'الاستخدام اليومي:' : 'Daily Use:'}</strong> {isRtl ? 'ملعقة صغيرة على الريق صباحاً.' : 'One teaspoon on an empty stomach in the morning.'}</li>
                    <li><strong className="text-on-surface">{isRtl ? 'مع المشروبات:' : 'With Beverages:'}</strong> {isRtl ? 'أضفه إلى الشاي الدافئ أو المشروبات العشبية بدلاً من السكر.' : 'Add to warm tea or herbal drinks as a sugar alternative.'}</li>
                    <li><strong className="text-on-surface">{isRtl ? 'في العناية الشخصية:' : 'Personal Care:'}</strong> {isRtl ? 'يمكن استخدامه في بعض الوصفات الطبيعية للعناية بالبشرة.' : 'Can be used in natural recipes for skincare.'}</li>
                  </ul>
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="mt-4">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="text-6xl font-bold text-primary">
                      {product.reviews && product.reviews.length > 0
                        ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
                        : "5.0"}
                    </div>
                    <div>
                      <div className="flex text-amber-400 text-2xl mb-2">
                        <span className="material-symbols-outlined filled">star</span>
                        <span className="material-symbols-outlined filled">star</span>
                        <span className="material-symbols-outlined filled">star</span>
                        <span className="material-symbols-outlined filled">star</span>
                        <span className="material-symbols-outlined filled">star</span>
                      </div>
                      <span className="text-base text-stone-500 font-medium">
                        {isRtl ? `بناءً على ${product.reviews?.length || 0} تقييم` : `Based on ${product.reviews?.length || 0} reviews`}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {product.reviews && product.reviews.length > 0 ? (
                      product.reviews.map(review => (
                        <div key={review.id} className="p-6 bg-surface border border-surface-container rounded-2xl shadow-sm">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-primary/20 text-primary flex items-center justify-center rounded-full font-bold text-lg">
                               {review.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                               <span className="font-bold text-lg block">{review.name}</span>
                               <span className="text-sm text-stone-400">
                                 {new Date(review.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                               </span>
                            </div>
                            <div className="flex text-amber-400 text-sm">
                               {Array.from({ length: review.rating }).map((_, i) => (
                                 <span key={i} className="material-symbols-outlined filled">star</span>
                               ))}
                            </div>
                          </div>
                          <p className="text-base leading-relaxed">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-stone-500 col-span-2 text-center py-6">{isRtl ? 'لا توجد مراجعات حتى الآن. كن أول من يقيّم المنتج!' : 'No reviews yet. Be the first to review!'}</p>
                    )}
                  </div>

                  {/* Submit Review Form */}
                  <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container">
                    <h3 className="text-xl font-bold text-primary mb-4">{isRtl ? 'أضف تقييمك' : 'Write a Review'}</h3>
                    {reviewSuccess ? (
                      <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-center gap-3">
                        <span className="material-symbols-outlined">check_circle</span>
                        <p>{isRtl ? 'شكراً لتقييمك! تم إرساله وجاري مراجعته من الإدارة قبل النشر.' : 'Thank you! Your review has been submitted for moderation.'}</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                             <label className="block text-sm font-bold text-stone-600 mb-1">{isRtl ? 'الاسم' : 'Name'}</label>
                             <input required value={reviewName} onChange={e => setReviewName(e.target.value)} type="text" className="w-full bg-white border border-stone-200 px-4 py-3 rounded-xl outline-none focus:border-primary" />
                          </div>
                          <div>
                             <label className="block text-sm font-bold text-stone-600 mb-1">{isRtl ? 'التقييم' : 'Rating'}</label>
                             <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} className="w-full bg-white border border-stone-200 px-4 py-3 rounded-xl outline-none focus:border-primary">
                               {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} {isRtl ? 'نجوم' : 'Stars'}</option>)}
                             </select>
                          </div>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-stone-600 mb-1">{isRtl ? 'رأيك بالمنتج' : 'Comment'}</label>
                           <textarea required value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={3} className="w-full bg-white border border-stone-200 px-4 py-3 rounded-xl outline-none focus:border-primary"></textarea>
                        </div>
                        <button disabled={isSubmittingReview} type="submit" className="bg-secondary text-white font-bold px-8 py-3 rounded-xl hover:bg-secondary/90 transition-colors disabled:opacity-50">
                           {isSubmittingReview ? (isRtl ? 'جاري الإرسال...' : 'Submitting...') : (isRtl ? 'إرسال التقييم' : 'Submit Review')}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* FAQ Accordion */}
      <div className="mt-24 max-w-4xl mx-auto">
        <h2 className="text-3xl font-serif text-center mb-12 text-primary">
          {isRtl ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
        </h2>
        <div className="space-y-4">
          {[
            { q: isRtl ? 'متى يصل الطلب؟' : 'When will my order arrive?', a: isRtl ? 'عادة ما يستغرق الشحن من 2 إلى 4 أيام عمل لكافة المحافظات.' : 'Shipping usually takes 2 to 4 business days to all areas.' },
            { q: isRtl ? 'هل المنتج طبيعي بالكامل؟' : 'Is the product completely natural?', a: isRtl ? 'نعم، مسجل ومصرح وخالي من أي إضافات كيميائية أو مواد حافظة.' : 'Yes, registered, certified, and free from any chemical additives or preservatives.' },
            { q: isRtl ? 'كيف أقوم بتخزين المنتج؟' : 'How should I store the product?', a: isRtl ? 'يُحفظ في مكان بارد وجاف بعيداً عن أشعة الشمس المباشرة للحفاظ على خواصه الطبيعية.' : 'Store in a cool, dry place away from direct sunlight to maintain its natural properties.' }
          ].map((faq, i) => (
            <div 
              key={i} 
              className={`border transition-all duration-300 rounded-2xl overflow-hidden ${openFaq === i ? 'bg-primary/5 border-primary/30 shadow-md transform -translate-y-1' : 'bg-surface-container-lowest border-surface-container hover:border-primary/30 shadow-sm'}`}
            >
              <button 
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-start p-5 md:p-6 flex items-center gap-4 transition-colors"
              >
                <div className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full transition-colors ${openFaq === i ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-variant text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[20px]">help_outline</span>
                </div>
                
                <span className={`flex-1 font-bold text-base md:text-lg transition-colors ${openFaq === i ? 'text-primary' : 'text-stone-700'}`}>{faq.q}</span>
                
                <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-full transition-colors ${openFaq === i ? 'bg-primary/20 text-primary' : 'bg-surface text-stone-400'}`}>
                   <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}>expand_more</span>
                </div>
              </button>
              
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-0">
                       <div className="ps-14 text-on-surface-variant text-base md:text-lg leading-relaxed border-t border-primary/10 pt-4">
                         {faq.a}
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-24 pt-16 border-t border-surface-container"
      >
        <h2 className="text-3xl font-serif text-center mb-12 text-primary">
          {isRtl ? 'لماذا تختار منتجاتنا؟' : 'Why Choose Our Products?'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 bg-surface-container-lowest rounded-3xl border border-surface-container shadow-sm hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl">compost</span>
            </div>
            <h3 className="text-xl font-bold mb-3">{isRtl ? 'عضوي وطبيعي' : 'Organic & Natural'}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              {isRtl 
                ? 'منتجاتنا خالية تماماً من المواد الكيميائية والإضافات الصناعية لضمان أقصى فائدة صحية.' 
                : 'Our products are completely free of chemicals and artificial additives to ensure maximum health benefits.'}
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-surface-container-lowest rounded-3xl border border-surface-container shadow-sm hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl">verified</span>
            </div>
            <h3 className="text-xl font-bold mb-3">{isRtl ? 'جودة مضمونة' : 'Guaranteed Quality'}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              {isRtl 
                ? 'نحن نلتزم بأعلى معايير الجودة في كل مرحلة من مراحل الإنتاج والتعبئة.' 
                : 'We adhere to the highest quality standards at every stage of production and packaging.'}
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-surface-container-lowest rounded-3xl border border-surface-container shadow-sm hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl">health_and_safety</span>
            </div>
            <h3 className="text-xl font-bold mb-3">{isRtl ? 'فوائد صحية مثبتة' : 'Proven Health Benefits'}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              {isRtl 
                ? 'غنية بمضادات الأكسدة والفيتامينات الأساسية التي تعزز مناعتك وصحتك العامة.' 
                : 'Rich in antioxidants and essential vitamins that boost your immunity and overall health.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Related Articles Section */}
      {dict.blog?.articles && (
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-24 pt-16 border-t border-surface-container"
        >
          <div className="flex items-end justify-between mb-12">
            <h2 className="text-3xl font-serif text-primary">
              {isRtl ? 'مقالات ذات صلة' : 'Related Articles'}
            </h2>
            <Link href={`/${lang}/blog`} className="text-secondary font-bold hover:underline hidden md:block">
              {isRtl ? 'عرض كل المقالات' : 'View all articles'}
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dict.blog.articles.slice(0, 3).map((article: any, idx: number) => (
              <Link href={`/${lang}/blog/${article.id}`} key={idx} className="group flex flex-col bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-outline-variant/20">
                 <div className="aspect-[4/3] overflow-hidden relative">
                   <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={article.image} alt={article.title} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <span className="absolute top-4 left-4 rtl:left-auto rtl:right-4 bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-full shadow-md z-10">{article.label}</span>
                 </div>
                 <div className="p-6 flex flex-col flex-1">
                   <span className="text-secondary text-xs font-bold tracking-widest uppercase mb-3 block">{article.date}</span>
                   <h3 className="font-serif text-xl text-primary mb-3 group-hover:text-secondary transition-colors line-clamp-2">{article.title}</h3>
                   <div className="mt-auto pt-4 border-t border-outline-variant/30 flex items-center gap-2 text-primary font-bold text-sm group/btn">
                      <span>{dict.blog?.readMore || (isRtl ? 'اقرأ المزيد' : 'Read more')}</span>
                      <span className="material-symbols-outlined rtl:-scale-x-100 group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1 transition-transform text-lg">arrow_forward</span>
                   </div>
                 </div>
              </Link>
            ))}
          </div>
          <Link href={`/${lang}/blog`} className="text-secondary font-bold hover:underline block md:hidden text-center mt-8">
            {isRtl ? 'عرض كل المقالات' : 'View all articles'}
          </Link>
        </motion.div>
      )}



      {/* Mobile Sticky Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface/95 backdrop-blur-md border-t border-surface-container shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 lg:hidden flex justify-between items-center gap-4 animate-in slide-in-from-bottom-full duration-500">
        <div>
           <span className="block text-xs text-stone-500 font-bold mb-1">{isRtl ? 'السعر الكلي' : 'Total Price'}</span>
           <span className="text-xl font-bold text-primary">{formatPrice(currentPrice * quantity)}</span>
        </div>
        <button 
           onClick={handleBuyNow}
           className="bg-primary text-on-primary py-3 w-40 rounded-full font-bold shadow-lg shadow-primary/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
           <span className="material-symbols-outlined text-[20px]">bolt</span>
           {isRtl ? 'الشراء الآن' : 'Buy Now'}
        </button>
      </div>

    </div>
  );
}
