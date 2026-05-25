export function getAllowedEmails(): string[] {
  return (import.meta.env.VITE_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((s: string) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowed(email: string | null | undefined): boolean {
  const allowed = getAllowedEmails();
  if (allowed.length === 0) {
    if (import.meta.env.PROD) {
      console.error(
        "[auth-allowlist] VITE_ALLOWED_EMAILS is not set — access denied. Set VITE_ALLOWED_EMAILS env var.",
      );
      return false;
    }
    return true;
  }
  if (!email) return false;
  return allowed.includes(email.trim().toLowerCase());
}
