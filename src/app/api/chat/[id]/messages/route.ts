import { auth } from '@/src/lib/auth';
import { many, one } from '@/src/lib/db';
import { pusherServer } from '@/src/lib/pusher';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const url = new URL(_req.url);
  const before = url.searchParams.get('before'); // ISO time
  const limit = Number(url.searchParams.get('limit') ?? 20);

  const base = `
    SELECT m.*, 
      (SELECT COUNT(*) FROM message_reactions r WHERE r.message_id=m.id AND r.type='heart') as hearts
    FROM messages m
    WHERE m.chat_id=$1
      ${before ? `AND m.created_at < $2` : ''}
    ORDER BY m.created_at DESC
    LIMIT ${limit}
  `;
  const rows = before ? await many(base, [params.id, before]) : await many(base, [params.id]);
  const nextCursor = rows.length ? rows[rows.length - 1].created_at : null;
  return Response.json({ messages: rows.reverse(), nextCursor });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({}, { status: 401 });
  const { content } = await req.json();
  const me = await one(`SELECT * FROM users WHERE email=$1`, [session.user.email]);

  const msg = await one(
    `INSERT INTO messages (chat_id,sender_id,content) VALUES ($1,$2,$3) RETURNING *`,
    [params.id, me.id, content],
  );

  // 읽음 기준 업데이트 (내가 보낸 메시지는 내가 이미 읽음 처리)
  await one(
    `UPDATE chat_participants SET last_read_at=now() WHERE chat_id=$1 AND user_id=$2`,
    [params.id, me.id],
  );

  await pusherServer.trigger(`presence-chat-${params.id}`, 'message:new', {
    message: { ...msg, hearts: 0 },
  });

  return Response.json({ message: { ...msg, hearts: 0 } });
}
