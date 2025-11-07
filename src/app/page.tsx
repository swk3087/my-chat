import { auth } from '@/src/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await auth();
  if (session?.user) redirect('/app');
  return (
    <main className="min-h-dvh flex items-center justify-center">
      <div className="card p-6 w-80 text-center space-y-4">
        <h1 className="text-xl font-semibold">Chat on Vercel</h1>
        <Link href="/login" className="btn bg-black text-white dark:bg-white dark:text-black">시작하기</Link>
      </div>
    </main>
  );
}
