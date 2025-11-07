'use client';
import { signIn } from 'next-auth/react';

export default function Login() {
  return (
    <main className="min-h-dvh flex items-center justify-center">
      <div className="card p-6 w-80 text-center space-y-4">
        <h1 className="text-xl font-semibold">로그인</h1>
        <button onClick={()=>signIn('google')} className="btn bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
          Google로 시작
        </button>
      </div>
    </main>
  );
}
