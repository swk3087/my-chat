'use client';
export default function MessageBubble({ me, m, onHeart, onEdit, onDelete }:{
  me: string; m: any; onHeart:(id:string)=>void; onEdit:(id:string)=>void; onDelete:(id:string)=>void;
}) {
  const mine = m.sender_email === me; // 클라이언트에서 세션 이메일을 넣어주도록
  const deleted = !!m.deleted_at;
  return (
    <div className={`flex ${mine?'justify-end':'justify-start'} my-1`}>
      <div
        onDoubleClick={()=>onHeart(m.id)}
        className={`max-w-[80%] rounded-2xl px-3 py-2 ${mine?'bg-black text-white dark:bg-white dark:text-black':'bg-zinc-100 dark:bg-zinc-800'} animate-pop`}
      >
        <div className="text-sm whitespace-pre-wrap">{deleted?'(삭제됨)':m.content}</div>
        <div className="text-[10px] opacity-60 mt-1 flex gap-2">
          {m.edited_at && <span>edited</span>}
          <span>❤ {m.hearts||0}</span>
        </div>
        {mine && !deleted && (
          <div className="flex gap-2 text-[10px] mt-1">
            <button onClick={()=>onEdit(m.id)} className="underline">수정</button>
            <button onClick={()=>onDelete(m.id)} className="underline">삭제</button>
          </div>
        )}
      </div>
    </div>
  );
}

