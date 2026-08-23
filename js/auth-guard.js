import { getSession, normalizedReturnTarget } from "./auth-client.js";

export async function requireGrowWithHRAccount({ allowSample = true } = {}) {
  const params = new URLSearchParams(location.search);
  if (allowSample && params.get("sample") === "1") return null;
  const returnTo = normalizedReturnTarget(`${location.pathname.split("/").pop()}${location.search}${location.hash}`);
  try {
    const session = await getSession();
    if (session?.user) return session;
  } catch (_error) {
    // Fall through to account page. The account page will surface configuration errors.
  }
  location.replace(`auth.html?return=${encodeURIComponent(returnTo)}`);
  return null;
}
