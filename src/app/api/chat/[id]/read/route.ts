import { auth } from '@/src/lib/auth';
import { one } from '@/src/lib/db';
import { pusherServer } from '@/src/lib/pusher';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({}, { status: 401 });
  const me = await one(`SELECT * FROM users WHERE email=$1`, [session.user.email]);

  await one(`UPDATE chat_participants SET last_read_at=now() WHERE chat_id=$1 AND user_id=$2`, [params.id, me.id]);
  await pusherServer.trigger(`presence-chat-${params.id}`, 'chat:read', { by: me.id, at: new Date().toISOString() });
  return Response.json({ ok: true });
}
