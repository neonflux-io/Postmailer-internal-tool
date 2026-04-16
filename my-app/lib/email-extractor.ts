export function extractEmails(text: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = text.match(emailRegex);
  return emails ? [...new Set(emails)] : [];
}

export function extractFirstEmail(text: string): string | null {
  const emails = extractEmails(text);
  return emails.length > 0 ? emails[0] : null;
}
