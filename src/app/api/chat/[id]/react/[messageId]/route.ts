import { auth } from '@/src/lib/auth';
import { one, many } from '@/src/lib/db';
import { pusherServer } from '@/src/lib/pusher';

export async function POST(_req: Request, { params }: { params: { id: string, messageId: string } }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({}, { status: 401 });
  const me = await one(`SELECT * FROM users WHERE email=$1`, [session.user.email]);

  const existing = await one(
    `SELECT * FROM message_reactions WHERE message_id=$1 AND user_id=$2 AND type='heart'`,
    [params.messageId, me.id],
  );

  if (existing) {
    await one(
      `DELETE FROM message_reactions WHERE message_id=$1 AND user_id=$2 AND type='heart' RETURNING *`,
      [params.messageId, me.id],
    );
  } else {
    await one(
      `INSERT INTO message_reactions (message_id,user_id,type) VALUES ($1,$2,'heart') RETURNING *`,
      [params.messageId, me.id],
    );
  }

  const count = await one(`SELECT COUNT(*)::int AS hearts FROM message_reactions WHERE message_id=$1 AND type='heart'`, [params.messageId]);
  await pusherServer.trigger(`presence-chat-${params.id}`, 'message:heart', {
    messageId: params.messageId,
    hearts: count?.hearts ?? 0,
  });

  return Response.json({ ok: true });
}
