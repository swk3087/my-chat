import { auth } from '@/src/lib/auth';
import { many, one } from '@/src/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return Response.json({}, { status: 401 });
  const me = await one(`SELECT * FROM users WHERE email=$1`, [session.user.email]);

  const rows = await many(
    `
    SELECT c.id as chat_id,
           other.id as other_id,
           pr.nickname as other_name,
           pr.avatar_url as other_avatar,
           (SELECT content FROM messages m WHERE m.chat_id=c.id AND m.deleted_at IS NULL ORDER BY created_at DESC LIMIT 1) as last_msg,
           (SELECT COUNT(*)::int FROM messages m
              WHERE m.chat_id=c.id AND m.sender_id<>$1
                AND m.created_at > (SELECT COALESCE(last_read_at,'epoch') FROM chat_participants WHERE chat_id=c.id AND user_id=$1)
           ) as unread
    FROM chats c
      JOIN chat_participants mep ON mep.chat_id=c.id AND mep.user_id=$1
      JOIN chat_participants otherp ON otherp.chat_id=c.id AND otherp.user_id<>$1
      JOIN users other ON other.id=otherp.user_id
      JOIN profiles pr ON pr.user_id=other.id
    ORDER BY c.created_at DESC
    `,
    [me.id],
  );
  return Response.json({ chats: rows });
}
