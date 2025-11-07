import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from '@/src/lib/auth';

// Blob client-upload 토큰/콜백 패턴. :contentReference[oaicite:8]{index=8}
export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await request.json()) as HandleUploadBody;
  const jsonResponse = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async (pathname) => {
      return {
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ email: session.user.email }),
      };
    },
    onUploadCompleted: async ({ blob, tokenPayload }) => {
      const { email } = JSON.parse(tokenPayload!);
      // 업로드 완료 후 DB에 아바타 반영 (지연/웹훅 환경)
      // 로컬에서는 생략 가능. 클라이언트에서 /api/profile 로 PATCH 해도 됨.
      // 여긴 샘플로 남깁니다.
    },
  });
  return NextResponse.json(jsonResponse);
}
