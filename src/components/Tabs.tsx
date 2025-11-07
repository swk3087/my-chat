'use client';
import { useState } from 'react';

export default function Tabs({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  const [tab, setTab] = useState<'profile'|'chats'>('profile');
  return (
    <div className="mx-auto max-w-screen-sm p-3 space-y-3">
      <div className="flex gap-2">
        <button onClick={()=>setTab('profile')} className={`btn ${tab==='profile'?'bg-black text-white dark:bg-white dark:text-black':''}`}>프로필</button>
        <button onClick={()=>setTab('chats')} className={`btn ${tab==='chats'?'bg-black text-white dark:bg-white dark:text-black':''}`}>채팅방</button>
      </div>
      <div className="animate-pop">{tab==='profile' ? left : right}</div>
    </div>
  );
}
