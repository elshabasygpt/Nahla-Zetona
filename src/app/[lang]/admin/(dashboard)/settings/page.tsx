import { PrismaClient } from "@prisma/client";
import SettingsForm from "./SettingsForm";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSettings.findFirst();

  return (
    <div className="max-w-4xl space-y-8">
      <header className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <h1 className="text-3xl font-bold text-stone-800">إعدادات الهوية والتخصيص</h1>
        <p className="text-stone-500 mt-1">تحكم في ألوان المنصة الأساسية، واسم علامتك التجارية.</p>
      </header>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
        <SettingsForm initialData={settings} />
      </div>
    </div>
  );
}
