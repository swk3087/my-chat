'use client';
import { useEffect, useState, useRef } from 'react';
import { upload } from '@vercel/blob/client';

export default function ProfileCard() {
  const [profile, setProfile] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const res = await fetch('/api/me');
    const data = await res.json();
    setProfile(data.profile);
  }
  useEffect(()=>{ load(); },[]);

  async function saveNickname(nickname: string) {
    await fetch('/api/profile', { method:'POST', body: JSON.stringify({ nickname }) });
    load();
  }
  async function uploadAvatar() {
    const file = inputRef.current?.files?.[0];
    if (!file) return;
    const blob = await upload(`avatars/${file.name}`, file, { access:'public', handleUploadUrl:'/api/avatar/upload' });
    await fetch('/api/profile', { method:'POST', body: JSON.stringify({ avatar_url: blob.url }) });
    load();
  }

  if (!profile) return <div className="card p-4">로딩...</div>;
  const link = `${location.origin}/p/${profile.slug}`;

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <img src={profile.avatar_url || '/default-avatar.svg'} className="w-16 h-16 rounded-full object-cover border"/>
        <div className="flex-1">
          <div className="font-semibold">{profile.nickname}</div>
          <input ref={inputRef} type="file" accept="image/*" className="block text-sm mt-2"/>
          <div className="flex gap-2 mt-2">
            <button onClick={uploadAvatar} className="btn border">아바타 변경</button>
            <button onClick={()=>saveNickname(prompt('닉네임', profile.nickname) || profile.nickname)} className="btn border">닉네임 수정</button>
          </div>
        </div>
      </div>
      <div className="text-sm">
        내 프로필 링크: <a href={link} className="underline">{link}</a>
        <button className="btn border ml-2" onClick={()=>navigator.clipboard.writeText(link)}>복사</button>
      </div>
      <p className="text-xs text-zinc-500">링크를 받은 사용자가 페이지에서 “1:1 채팅 시작”을 누르면 서로만의 채팅방이 생성됩니다.</p>
    </div>
  );
}
