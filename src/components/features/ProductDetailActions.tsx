'use client';

import { useState } from "react";
import AddToCartButton from "./AddToCartButton";

export default function ProductDetailActions({ product, dict }: { product: any, dict: any }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);

  const price = typeof product.price === 'string' ? parseInt(product.price) : product.price;

  return (
    <div className="space-y-6 mb-10">
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">{dict.productDetail.size}</label>
        <div className="flex gap-3">
          {dict.productDetail.sizes.map((size: string, index: number) => (
            <button 
              key={index} 
              onClick={() => setSelectedSizeIndex(index)}
              className={`px-6 py-2 rounded-full border-2 font-bold text-sm transition-colors ${
                selectedSizeIndex === index 
                  ? 'border-primary text-primary' 
                  : 'border-stone-200 text-stone-500 hover:border-stone-400'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-4">
        <div className="flex items-center bg-surface-container rounded-full px-4 py-2 flex-row rtl:flex-row-reverse self-start">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 flex items-center justify-center text-primary hover:bg-stone-200 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined" style={{fontSize: "18px"}}>remove</span>
          </button>
          <span className="w-12 text-center font-bold">{quantity}</span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="w-8 h-8 flex items-center justify-center text-primary hover:bg-stone-200 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined" style={{fontSize: "18px"}}>add</span>
          </button>
        </div>
        <AddToCartButton 
          id={`p-${product.name}`} 
          name={product.name} 
          price={price} 
          image={product.img || "https://lh3.googleusercontent.com/aida-public/AB6AXuC5AE865vs9TP-ASdseT3MV05sqwFhmAF-t5RtPiFdG9oJB2-8xMve8Gj0w_WyjaNyNwAkWxr6JsIyN5j70c4FDax3GthFDD7gS7zrmfOhbC2d6-NH2rvkXEoBn_HCHClWay1F6nnVYl-fG3gEk0HpcoYMr5kMqvN36kAknbk7XSoLVi1vhAAF9jht9bgNBmXhDukclA3iLVYXmwncwQV7J2H95QhOWOGeFUgcvljyrZb-ttE71LMDddcxpLFFCK9UhiWN7iaQyjHU"}
          size={dict.productDetail.sizes[selectedSizeIndex]}
          quantity={quantity}
          label={dict.common.addToCart}
          successMessage={dict.cart.success}
          className="flex-1 bg-primary text-on-primary py-4 px-8 rounded-full font-bold text-lg hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        />
      </div>
    </div>
  );
}
