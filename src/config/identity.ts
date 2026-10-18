// Everything about "who is a valid person" lives here and nowhere else.
// Matches docs/SRS.md Appendix C.

export const EMAIL_DOMAIN = "kiit.ac.in";

// Roll numbers have no known fixed pattern yet. Seen so far: 2605001 (7 digits), 24051698 (8 digits).
// This accepts 6 to 10 digits. If a stable pattern is ever confirmed, tighten it HERE (for example /^[0-9]{7,8}$/).
// The database check is deliberately looser (letters and digits, 4 to 20 long), so changing this needs no migration.
export const ROLL_NUMBER_PATTERN = /^[0-9]{6,10}$/;
export const ROLL_NUMBER_HINT = "6 to 10 digits, like 2605001 or 24051698";

export const emailFromRoll = (roll: string) => `${roll}@${EMAIL_DOMAIN}`;

export function rollFromEmail(email: string): string | null {
  const [local, domain] = email.trim().toLowerCase().split("@");
  return domain === EMAIL_DOMAIN && ROLL_NUMBER_PATTERN.test(local ?? "") ? local! : null;
}

// Only a hint, used for warnings in imports ("this roll looks like batch 2024, the file says 2023"). Never trusted.
export function batchYearHintFromRoll(roll: string): number | null {
  const yy = Number(roll.slice(0, 2));
  return Number.isInteger(yy) && roll.length >= 6 ? 2000 + yy : null;
}
