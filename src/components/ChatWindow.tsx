'use client';
import { useEffect, useRef, useState } from 'react';
import { pusher } from '@/src/lib/pusher-client';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ chatId, meEmail }:{ chatId: string; meEmail: string; }) {
  const [items, setItems] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string|null>(null);
  const [input, setInput] = useState('');
  const topRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [typing, setTyping] = useState(false);

  async function loadMore() {
    const q = new URLSearchParams();
    if (cursor) q.set('before', cursor);
    q.set('limit', '20');
    const res = await fetch(`/api/chat/${chatId}/messages?${q.toString()}`);
    const data = await res.json();
    setItems((prev)=>[...data.messages, ...prev]);
    setCursor(data.nextCursor);
  }

  useEffect(()=>{ loadMore(); },[chatId]);

  // 무한 스크롤 (상단 도달 시 더 불러오기)
  useEffect(()=>{
    if (!topRef.current) return;
    const obs = new IntersectionObserver((entries)=>{
      if (entries[0].isIntersecting && cursor) loadMore();
    }, { root: listRef.current, threshold: 1.0 });
    obs.observe(topRef.current);
    return ()=>obs.disconnect();
  }, [cursor]);

  // Pusher presence 채널 구독
  useEffect(()=>{
    const ch = pusher.subscribe(`presence-chat-${chatId}`);
    ch.bind('message:new', (e:any)=> setItems((prev)=>[...prev, e.message]));
    ch.bind('message:edit', (e:any)=> setItems((prev)=>prev.map(m=>m.id===e.message.id?e.message:m)));
    ch.bind('message:delete', (e:any)=> setItems((prev)=>prev.map(m=>m.id===e.message.id?e.message:m)));
    ch.bind('message:heart', (e:any)=> setItems((prev)=>prev.map(m=>m.id===e.messageId?{...m, hearts:e.hearts}:m)));
    ch.bind('chat:typing', (_e:any)=>{ setTyping(true); setTimeout(()=>setTyping(false), 1000); });
    return ()=> { pusher.unsubscribe(`presence-chat-${chatId}`); }
  }, [chatId]);

  async function send() {
    if (!input.trim()) return;
    await fetch(`/api/chat/${chatId}/messages`, { method:'POST', body: JSON.stringify({ content: input }) });
    setInput('');
    // 읽음 처리
    await fetch(`/api/chat/${chatId}/read`, { method:'POST' });
  }

  function onHeart(id:string){ fetch(`/api/chat/${chatId}/react/${id}`, { method:'POST' }); }
  async function onEdit(id:string){
    const content = prompt('내용 수정하기');
    if (!content) return;
    const r = await fetch(`/api/chat/${chatId}/messages/${id}`, { method:'PATCH', body: JSON.stringify({ content }) });
    if (!r.ok) alert('수정 가능 시간(5분)이 지났습니다.');
  }
  async function onDelete(id:string){
    const r = await fetch(`/api/chat/${chatId}/messages/${id}`, { method:'DELETE' });
    if (!r.ok) alert('삭제 가능 시간(1분)이 지났습니다.');
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div ref={listRef} className="h-[60dvh] overflow-y-auto p-3">
        <div ref={topRef}></div>
        {items.map((m)=>(
          <MessageBubble key={m.id} me={meEmail} m={m} onHeart={onHeart} onEdit={onEdit} onDelete={onDelete}/>
        ))}
        {typing && <div className="text-xs opacity-60 px-2 py-1">상대가 입력 중…</div>}
      </div>
      <div className="p-3 border-t flex gap-2">
        <input
          value={input}
          onChange={(e)=>{ setInput(e.target.value); fetch(`/api/chat/${chatId}/typing`, { method:'POST' }); }}
          onKeyDown={(e)=>{ if (e.key==='Enter') send(); }}
          placeholder="메시지 입력…"
          className="flex-1 rounded-xl px-3 py-2 border"
        />
        <button onClick={send} className="btn bg-black text-white dark:bg-white dark:text-black">전송</button>
      </div>
    </div>
  );
}
