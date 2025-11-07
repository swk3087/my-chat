import { auth } from '@/src/lib/auth';
import Tabs from '@/src/components/Tabs';
import ThemeToggle from '@/src/components/ThemeToggle';
import ProfileCard from '@/src/components/ProfileCard';
import ChatList from '@/src/components/ChatList';
import ChatWindow from '@/src/components/ChatWindow';

export default async function AppPage() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <main className="min-h-dvh p-3 space-y-3">
      <div className="flex justify-between items-center max-w-screen-sm mx-auto">
        <h1 className="text-xl font-semibold">Chat on Vercel</h1>
        <ThemeToggle/>
      </div>
      <Tabs
        left={<ProfileCard/>}
        right={<ClientChats meEmail={session.user.email!}/>}
      />
    </main>
  );
}

// 클라이언트에서 ChatList와 ChatWindow를 조합
'use client'
import { useState } from 'react';
function ClientChats({ meEmail }: { meEmail: string }) {
  const [openId, setOpenId] = useState<string|undefined>();
  return (
    <div className="space-y-3">
      <ChatList onOpen={(id)=>setOpenId(id)}/>
      {openId && <ChatWindow chatId={openId} meEmail={meEmail}/>}
    </div>
  );
}
