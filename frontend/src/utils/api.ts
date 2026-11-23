const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '');

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error(
      'VITE_API_BASE_URL belum diatur. Atur URL backend Laravel pada file .env (lokal) atau Environment Variables Vercel (production).'
    );
  }

  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  headers.set('ngrok-skip-browser-warning', 'true');

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Browser harus menentukan Content-Type sendiri untuk FormData agar boundary multipart benar.
  if (!(options.body instanceof FormData) && options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api${normalizedEndpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      `Tidak dapat menghubungi backend Laravel di ${API_BASE_URL}. Periksa apakah Laravel dan Ngrok sedang berjalan serta URL API sudah benar.`
    );
  }

  const responseText = await response.text();
  let data: unknown = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        response.status === 502 || response.status === 503
          ? 'Backend atau tunnel Ngrok sedang tidak tersedia.'
          : 'Server tidak mengirim respons JSON. Periksa URL API, status Ngrok, dan log Laravel.'
      );
    }
  }

  if (!response.ok) {
    const payload = data as { message?: string; errors?: Record<string, string[]> } | null;
    const validationMessage = payload?.errors
      ? Object.values(payload.errors).flat().join(' ')
      : '';
    throw new Error(validationMessage || payload?.message || `Request gagal (HTTP ${response.status}).`);
  }

  return data as T;
}
