
import { auth } from '@/src/lib/auth';
import { one, many } from '@/src/lib/db';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({}, { status: 401 });
  const { targetSlug } = await req.json();

  const me = await one(`SELECT * FROM users WHERE email=$1`, [session.user.email]);
  const target = await one(
    `SELECT u.* FROM profiles p JOIN users u ON u.id=p.user_id WHERE p.slug=$1`,
    [targetSlug],
  );
  if (!target || target.id === me.id) return Response.json({ error: 'invalid target' }, { status: 400 });

  // 기존 1:1 채팅 존재 여부
  const exists = await one(
    `
    SELECT c.id FROM chats c
      JOIN chat_participants a ON a.chat_id=c.id AND a.user_id=$1
      JOIN chat_participants b ON b.chat_id=c.id AND b.user_id=$2
    WHERE NOT EXISTS (
      SELECT 1 FROM chat_participants x WHERE x.chat_id=c.id AND x.user_id NOT IN ($1,$2)
    )
    LIMIT 1
    `,
    [me.id, target.id],
  );

  const chat =
    exists ||
    (await one(`INSERT INTO chats DEFAULT VALUES RETURNING id`, [])).id &&
      (await (async (chatId: string) => {
        await many(
          `INSERT INTO chat_participants (chat_id,user_id) VALUES ($1,$2),($1,$3)`,
          [chatId, me.id, target.id],
        );
        return { id: chatId };
      })((await one(`SELECT id FROM chats ORDER BY created_at DESC LIMIT 1`))!.id));

  return Response.json({ chatId: (chat as any).id });
}
