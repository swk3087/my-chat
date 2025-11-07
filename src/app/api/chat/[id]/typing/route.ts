import { auth } from '@/src/lib/auth';
import { pusherServer } from '@/src/lib/pusher';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({}, { status: 401 });
  await pusherServer.trigger(`presence-chat-${params.id}`, 'chat:typing', {
    by: session.user.email,
  });
  return Response.json({ ok: true });
}
