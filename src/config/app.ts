// Core product rules and global constants.
// Matches docs/SRS.md Appendix C.

export const TZ = "Asia/Kolkata";                 // India Standard Time
export const LOCALE = "en-IN";
export const HOUR12 = true;
export const ACADEMIC_YEAR_START_MONTH = 7;       // 1 July
export const ATTENDANCE_OPEN_LEAD_MINUTES = 15;   // soft rule S-04
export const MOM_MAX_WORDS = 100;
export const PRS_PER_PROJECT = 2;
export const PROJECT_ACTIVE_WINDOW_DAYS = 15;
export const MAX_PAGE_SIZE = 50;
export const REQUEST_MAX_TARGETS = 200;
export const REQUEST_DELETE_MAX_TARGETS = 50;
export const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;
export const PROJECT_NAMES = [
  "Bandhutva",
  "Dhara",
  "Nidaan",
  "Riddhi",
  "Sanyukt",
  "Sparsh",
  "Swet",
  "Udaan",
  "Urja",
] as const;
