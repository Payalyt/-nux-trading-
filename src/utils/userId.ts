/**
 * Unique 8-Digit User ID Generator and Validator
 * Guarantees every user has an 8-digit numeric identification (e.g. 84920153).
 */

export function generate8DigitId(seed?: string): string {
  if (seed) {
    const digits = seed.replace(/\D/g, '');
    if (digits.length === 8) {
      return digits;
    }
    if (digits.length > 8) {
      return digits.slice(0, 8);
    }
  }
  // Generate random 8-digit integer between 10000000 and 99999999
  const num = Math.floor(10000000 + Math.random() * 90000000);
  return String(num);
}

export function isValid8DigitId(id: any): boolean {
  if (!id) return false;
  const str = String(id).trim();
  return /^\d{8}$/.test(str);
}

export function get8DigitId(user: any): string {
  if (!user) return generate8DigitId();
  if (user.numericId && isValid8DigitId(user.numericId)) {
    return String(user.numericId).trim();
  }
  if (user.id && isValid8DigitId(user.id)) {
    return String(user.id).trim();
  }
  if (user.id) {
    const digits = String(user.id).replace(/\D/g, '');
    if (digits.length >= 8) {
      return digits.slice(0, 8);
    }
  }
  return generate8DigitId(user.email || user.username);
}
