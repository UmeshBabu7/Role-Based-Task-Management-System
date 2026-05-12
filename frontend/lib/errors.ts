
export function getApiError(err: unknown, fallback = 'Something went wrong'): string {
  if (!err) return '';
  const data = (err as any)?.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.detail) return String(data.detail);

  const fieldErrors = Object.entries(data)
    .map(([field, msgs]) => {
      const msg = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
      return `${field}: ${msg}`;
    })
    .join(' | ');
  return fieldErrors || fallback;
}
