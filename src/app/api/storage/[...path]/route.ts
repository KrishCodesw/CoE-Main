import { getObjectStat, getObjectStream } from '@/lib/minio';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    if (!path || path.length === 0) {
      return new Response('Not found', { status: 404 });
    }

    const objectKey = path.map((segment) => decodeURIComponent(segment)).join('/');

    const [stream, stat] = await Promise.all([
      getObjectStream(objectKey),
      getObjectStat(objectKey).catch(() => null),
    ]);

    const chunks: Buffer[] = [];
    for await (const chunk of stream as AsyncIterable<Buffer | string>) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const contentType =
      (stat?.metaData?.['content-type'] as string | undefined) ||
      (stat?.metaData?.['Content-Type'] as string | undefined) ||
      'application/octet-stream';

    return new Response(Buffer.concat(chunks), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('Storage proxy error:', err);
    return new Response('Not found', { status: 404 });
  }
}
