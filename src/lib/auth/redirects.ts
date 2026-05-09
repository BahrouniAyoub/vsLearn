export function getAuthRedirectUrl(path = "/dashboard") {
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}
