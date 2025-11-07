import { auth } from '@/src/lib/auth';
import { one } from '@/src/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return Response.json({}, { status: 401 });
  const profile = await one(
    `SELECT p.* FROM profiles p JOIN users u ON u.id=p.user_id WHERE u.email=$1`,
    [session.user.email],
  );
  return Response.json({ profile });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({}, { status: 401 });
  const { nickname, avatar_url } = await req.json();

  const updated = await one(
    `UPDATE profiles SET nickname = COALESCE($1,nickname), avatar_url=COALESCE($2,avatar_url)
     WHERE user_id = (SELECT id FROM users WHERE email=$3)
     RETURNING *`,
    [nickname, avatar_url, session.user.email],
  );
  return Response.json({ profile: updated });
}
