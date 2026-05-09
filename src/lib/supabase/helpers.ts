export function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  if (!authorization) return null;

  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;

  return token;
}

export function getSupabaseAuthHeaders(request?: Request): Record<string, string> {
  if (!request) return {};

  const token = getBearerToken(request);
  return token ? { Authorization: `Bearer ${token}` } : {};
}
