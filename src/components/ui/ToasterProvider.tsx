'use client';

import { Toaster } from 'react-hot-toast';

export default function ToasterProvider() {
  return (
    <Toaster 
      position="top-center" 
      toastOptions={{
        style: {
          borderRadius: '100px',
          background: '#333',
          color: '#fff',
          fontWeight: 'bold',
          padding: '12px 24px',
        },
        success: {
          style: {
             background: '#00511e',
          }
        },
        error: {
          style: {
             background: '#ba1a1a',
          }
        }
      }} 
    />
  );
}
