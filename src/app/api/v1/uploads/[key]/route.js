import { localStorage } from '@/lib/storage/local-dev.adapter';

export async function GET(_request, context) {
  const { key } = await context.params;
  if (!/^[a-f0-9-]+(?:-thumb)?\.webp$/.test(key)) return new Response(null, { status: 404 });
  try {
    const image = await localStorage.read(key);
    return new Response(image, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
