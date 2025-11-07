import { auth } from '@/src/lib/auth';
import { one, many } from '@/src/lib/db';
import { randomSlug } from '@/src/lib/utils';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ ok: false }, { status: 401 });

  // 유저 upsert
  const user =
    (await one(`SELECT * FROM users WHERE email = $1`, [session.user.email])) ||
    (await one(
      `INSERT INTO users (email, name, image) VALUES ($1,$2,$3) RETURNING *`,
      [session.user.email, session.user.name ?? null, session.user.image ?? null],
    ));

  // 프로필 생성(최초 1회)
  let profile = await one(`SELECT * FROM profiles WHERE user_id = $1`, [user.id]);
  if (!profile) {
    const slug = randomSlug();
    profile = await one(
      `INSERT INTO profiles (user_id, slug, nickname, avatar_url) VALUES ($1,$2,$3,$4) RETURNING *`,
      [user.id, slug, session.user.name ?? 'New User', session.user.image ?? null],
    );
  }

  return Response.json({ ok: true, user, profile });
}

export const dynamic = 'force-dynamic';
