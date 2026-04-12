'use client';
import { useCartStore } from "@/store/useCartStore";
import { useState } from "react";
import toast from 'react-hot-toast';

interface AddToCartButtonProps {
  id: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  quantity?: number;
  label: string;
  successMessage: string;
  className?: string;
}

export default function AddToCartButton({ id, name, price, image, size, quantity = 1, label, successMessage, className }: AddToCartButtonProps) {
  const { addItem, openCart } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    setIsAdding(true);
    addItem({ id: `${id}-${size || 'default'}`, name, price, image, quantity, size });
    
    // Show toast
    toast.success(`${name} ${successMessage}`);
    
    setTimeout(() => {
      setIsAdding(false);
      openCart();
    }, 600);
  };

  return (
    <button 
      onClick={handleAdd}
      disabled={isAdding}
      className={`${className || "w-full bg-primary text-on-primary py-4 rounded-full font-bold text-lg hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-2"}`}
    >
      <span className="material-symbols-outlined">{isAdding ? 'check' : 'shopping_bag'}</span>
      {label}
    </button>
  );
}
