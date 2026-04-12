import LoginForm from './LoginForm';

export const metadata = {
  title: 'Admin Login | Bee & Olive',
  robots: 'noindex, nofollow', // Prevent search engines from indexing the admin login
};

export default async function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  return <LoginForm lang={lang} />;
}
