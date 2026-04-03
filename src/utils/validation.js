export function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();

  // Basic email format validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

export function normalizeValidationMessage(message) {
  const normalized = String(message || "").trim();
  const legacyGmailOnlyPattern = /please\s+provide\s+a\s+valid\s+@gmail\.com\s+email\s+address/i;

  if (legacyGmailOnlyPattern.test(normalized)) {
    return "Please provide a valid email address.";
  }

  return normalized;
}
