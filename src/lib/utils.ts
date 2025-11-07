export const now = () => new Date().toISOString();
export const minutesFrom = (dt: string | Date, m: number) =>
  Date.now() - new Date(dt).getTime() <= m * 60 * 1000;
export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const randomSlug = () => 'u-' + Math.random().toString(36).slice(2, 8);
