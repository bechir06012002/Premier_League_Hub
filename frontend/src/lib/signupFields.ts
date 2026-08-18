/** Options and date helpers for the sign-up form's gender / birth-date fields. */

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-binary" },
  { value: "undisclosed", label: "Prefer not to say" },
];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((label, i) => ({ value: String(i + 1), label }));

export const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

/** Minimum age to hold an account - the common floor for consumer services. */
export const MIN_AGE = 13;
const MAX_AGE = 100;

const thisYear = new Date().getFullYear();
export const YEARS = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => String(thisYear - MIN_AGE - i));

/**
 * Returns the Date only if the parts describe a real calendar day. JS rolls
 * overflow forward (31 February becomes 2 or 3 March), so the constructed date
 * is compared back against the input to reject days that don't exist.
 */
export function toRealDate(year: string, month: string, day: string): Date | null {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (!y || !m || !d) return null;

  const date = new Date(y, m - 1, d);
  const real = date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  return real ? date : null;
}

export function ageOn(date: Date, today = new Date()): number {
  let age = today.getFullYear() - date.getFullYear();
  const beforeBirthday =
    today.getMonth() < date.getMonth() || (today.getMonth() === date.getMonth() && today.getDate() < date.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

/** ISO `YYYY-MM-DD`, built from local parts so the day can't shift by timezone. */
export function toIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
