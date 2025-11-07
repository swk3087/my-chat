'use client';
import Pusher from 'pusher-js';

// presence/private 채널은 서버의 auth 엔드포인트가 필요. :contentReference[oaicite:6]{index=6}
export const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  channelAuthorization: {
    endpoint: '/api/pusher/auth',
    transport: 'ajax',
  },
});
