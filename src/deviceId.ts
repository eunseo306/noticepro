const KEY = 'v4_device_id';

export function getDeviceId(): string {
  let id = localStorage.getItem(KEY);

  if (!id) {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${KEY}=([^;]+)`));
    if (match) id = match[1];
  }

  if (!id) id = crypto.randomUUID();

  localStorage.setItem(KEY, id);
  document.cookie = `${KEY}=${id}; max-age=${365 * 24 * 3600}; path=/; SameSite=Strict`;

  return id;
}
