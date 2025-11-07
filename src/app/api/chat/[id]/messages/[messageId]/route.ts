import { auth } from '@/src/lib/auth';
import { one } from '@/src/lib/db';
import { pusherServer } from '@/src/lib/pusher';

export async function PATCH(req: Request, { params }: { params: { id: string, messageId: string } }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({}, { status: 401 });
  const { content } = await req.json();
  const me = await one(`SELECT * FROM users WHERE email=$1`, [session.user.email]);

  const msg = await one(`SELECT * FROM messages WHERE id=$1 AND chat_id=$2 AND sender_id=$3`, [
    params.messageId, params.id, me.id,
  ]);
  if (!msg) return Response.json({}, { status: 404 });
  const alive = Date.now() - new Date(msg.created_at).getTime() <= 5 * 60 * 1000;
  if (!alive) return Response.json({ error: 'edit window closed' }, { status: 400 });

  const updated = await one(`UPDATE messages SET content=$1, edited_at=now() WHERE id=$2 RETURNING *`, [
    content, params.messageId,
  ]);
  await pusherServer.trigger(`presence-chat-${params.id}`, 'message:edit', { message: updated });
  return Response.json({ message: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string, messageId: string } }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({}, { status: 401 });
  const me = await one(`SELECT * FROM users WHERE email=$1`, [session.user.email]);

  const msg = await one(`SELECT * FROM messages WHERE id=$1 AND chat_id=$2 AND sender_id=$3`, [
    params.messageId, params.id, me.id,
  ]);
  if (!msg) return Response.json({}, { status: 404 });
  const alive = Date.now() - new Date(msg.created_at).getTime() <= 1 * 60 * 1000;
  if (!alive) return Response.json({ error: 'delete window closed' }, { status: 400 });

  const updated = await one(`UPDATE messages SET content=NULL, deleted_at=now() WHERE id=$1 RETURNING *`, [
    params.messageId,
  ]);
  await pusherServer.trigger(`presence-chat-${params.id}`, 'message:delete', { message: updated });
  return Response.json({ message: updated });
}
