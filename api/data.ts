import { Redis } from '@upstash/redis';

export default async function handler(req: any, res: any) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return res.status(503).json({ error: 'Storage not configured' });

  const deviceId = req.headers['x-device-id'];
  if (!deviceId || typeof deviceId !== 'string' || deviceId.length > 100) {
    return res.status(400).json({ error: 'Invalid device ID' });
  }

  const redis = new Redis({ url, token });
  const key = `device:${deviceId}`;

  if (req.method === 'GET') {
    const data = await redis.get(key);
    return res.status(200).json(data ?? null);
  }

  if (req.method === 'POST') {
    await redis.set(key, req.body);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
