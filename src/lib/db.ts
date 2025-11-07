import { neon } from '@neondatabase/serverless';

// Neon serverless driver: fetch 기반, Vercel/Edge 친화. :contentReference[oaicite:5]{index=5}
export const sql = neon(process.env.DATABASE_URL!);

// 헬퍼
export async function one<T = any>(q: string, params: any[] = []): Promise<T | null> {
  const rows = await (sql as any)(q, params);
  return rows?.[0] ?? null;
}
export async function many<T = any>(q: string, params: any[] = []): Promise<T[]> {
  return await (sql as any)(q, params);
}
