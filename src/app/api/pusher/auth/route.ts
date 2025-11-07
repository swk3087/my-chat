import { auth } from '@/src/lib/auth';
import { pusherServer } from '@/src/lib/pusher';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return new Response('Unauthorized', { status: 401 });
  const body = await req.formData(); // pusher-js는 form 전송
  const socket_id = String(body.get('socket_id'));
  const channel_name = String(body.get('channel_name'));

  const userId = session.user.email!;
  const presenceData = {
    user_id: userId.slice(0, 64), // pusher 제한
    user_info: { name: session.user.name, avatar: session.user.image },
  };

  const authResp = channel_name.startsWith('presence-')
    ? pusherServer.authenticate(socket_id, channel_name, presenceData as any)
    : pusherServer.authorizeChannel(socket_id, channel_name);

  return new Response(JSON.stringify(authResp), { status: 200 });
}

