export function getAllowedEmails(): string[] {
  return (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowed(email: string | null | undefined): boolean {
  const allowed = getAllowedEmails();
  if (allowed.length === 0) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[auth-allowlist] ALLOWED_EMAILS is empty — login is OPEN. Set ALLOWED_EMAILS env var to restrict access.",
      );
    }
    return true;
  }
  if (!email) return false;
  return allowed.includes(email.trim().toLowerCase());
}
