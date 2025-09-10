const API = process.env.NEXT_PUBLIC_API_URL;

function authHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('pwi_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function mergeHeaders(init?: RequestInit): HeadersInit {
  const base: Record<string, string> = {};
  if (init?.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((v, k) => { base[k] = v; });
    } else if (Array.isArray(init.headers)) {
      for (const [k, v] of init.headers) base[k] = v;
    } else {
      Object.assign(base, init.headers as Record<string, string>);
    }
  }
  return { ...base, ...authHeader() };
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: mergeHeaders(init),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...mergeHeaders(init) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPatch<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...mergeHeaders(init) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiDel<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'DELETE',
    headers: mergeHeaders(init),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
