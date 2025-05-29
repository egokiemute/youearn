export default function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  const visibleLength = Math.min(3, local.length); // Show up to 3 chars
  const masked =
    local.slice(0, visibleLength) + "*".repeat(local.length - visibleLength);
  return `${masked}@${domain}`;
}
