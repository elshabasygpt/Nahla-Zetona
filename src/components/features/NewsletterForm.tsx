'use client';

export default function NewsletterForm({ placeholder, btn }: { placeholder: string, btn: string }) {
  return (
    <form className="flex flex-col sm:flex-row gap-4 w-full" onSubmit={(e) => e.preventDefault()}>
      <input className="flex-grow bg-on-primary text-primary px-8 py-5 rounded-full border-none focus:ring-4 focus:ring-secondary/50 outline-none placeholder:text-outline text-lg" placeholder={placeholder} type="email" />
      <button className="bg-secondary-container text-tertiary px-10 py-5 rounded-full font-bold text-lg hover:bg-secondary-fixed-dim transition-all shadow-lg" type="submit">{btn}</button>
    </form>
  );
}
