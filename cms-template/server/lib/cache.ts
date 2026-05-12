import { env } from '../config.js';

export async function purgeCloudflareCache(urls?: string[]): Promise<{ ok: boolean; error?: string }> {
  if (!env.CLOUDFLARE_API_TOKEN || !env.CF_ZONE_ID) {
    return { ok: false, error: 'cloudflare_not_configured' };
  }
  const body = urls && urls.length > 0 ? { files: urls } : { purge_everything: true };
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${env.CF_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `cf_status_${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
