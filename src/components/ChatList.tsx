'use client';
import { useEffect, useState } from 'react';

export default function ChatList({ onOpen }: { onOpen: (chatId: string)=>void }) {
  const [chats, setChats] = useState<any[]>([]);
  async function load() {
    const res = await fetch('/api/chats'); const data = await res.json();
    setChats(data.chats || []);
  }
  useEffect(()=>{ load(); },[]);
  return (
    <div className="card p-2 divide-y">
      {chats.map((c)=>(
        <button key={c.chat_id} onClick={()=>onOpen(c.chat_id)} className="w-full text-left p-3 hover:bg-black/5 dark:hover:bg-white/10">
          <div className="flex items-center gap-3">
            <img src={c.other_avatar || '/default-avatar.svg'} className="w-10 h-10 rounded-full border object-cover"/>
            <div className="flex-1">
              <div className="font-medium">{c.other_name}</div>
              <div className="text-sm text-zinc-500 line-clamp-1">{c.last_msg || '대화 시작하기'}</div>
            </div>
            {!!c.unread && <span className="text-xs bg-black text-white dark:bg-white dark:text-black rounded-full px-2 py-0.5">{c.unread}</span>}
          </div>
        </button>
      ))}
      {!chats.length && <div className="p-4 text-sm text-zinc-500">아직 채팅방이 없어요.</div>}
    </div>
  );
}
