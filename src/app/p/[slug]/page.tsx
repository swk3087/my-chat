import { auth } from '@/src/lib/auth';

export default async function ProfileLanding({ params }: { params:{ slug: string } }) {
  const session = await auth();
  async function startChat() {
    'use server';
    if (!session?.user?.email) return { ok:false, reason:'login' };
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/chat/start`, {
      method:'POST', body: JSON.stringify({ targetSlug: params.slug }),
      cache: 'no-store',
    });
    const data = await res.json();
    return { ok:true, chatId: data.chatId };
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="card p-6 w-full max-w-sm text-center space-y-3">
        <h2 className="font-semibold">프로필</h2>
        <p className="text-sm text-zinc-500">이 사용자와 1:1 채팅을 시작할 수 있어요.</p>
        <form action={async ()=>{
          const r:any = await startChat();
          if (!r.ok) return;
          // 서버액션에서 클라이언트 네비게이션 트리거는 못하니 안내
        }}>
          <button className="btn bg-black text-white dark:bg-white dark:text-black w-full">1:1 채팅 시작</button>
        </form>
        <p className="text-xs text-zinc-500">로그인 후에 사용 가능합니다.</p>
      </div>
    </div>
  );
}
