/**
 * Projects and creative domains for NSS Central Management System.
 * Matches docs/SRS.md Sections 4, 10.2 and Appendix A.1.
 */

import type { VolunteerBasic } from "./volunteer";

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

export type ProjectName = (typeof PROJECT_NAMES)[number];

export type ProjectId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;   // fixed seed ids (Appendix A.1)

export const PROJECT_ID_BY_NAME: Record<ProjectName, ProjectId> = {
  Bandhutva: 1,
  Dhara: 2,
  Nidaan: 3,
  Riddhi: 4,
  Sanyukt: 5,
  Sparsh: 6,
  Swet: 7,
  Udaan: 8,
  Urja: 9,
};

export const PROJECT_NAME_BY_ID: Record<ProjectId, ProjectName> = {
  1: "Bandhutva",
  2: "Dhara",
  3: "Nidaan",
  4: "Riddhi",
  5: "Sanyukt",
  6: "Sparsh",
  7: "Swet",
  8: "Udaan",
  9: "Urja",
};

/** Only the four specialisations are stored. Everyone is implicitly a General Volunteer. */
export const CREATIVE_DOMAINS = [
  "PHOTOGRAPHY",
  "VIDEO_EDITING",
  "GRAPHIC_DESIGNING",
  "CONTENT_WRITING",
] as const;

export type CreativeDomain = (typeof CREATIVE_DOMAINS)[number];
export type Domain = CreativeDomain | "GENERAL_VOLUNTEERING";   // for filters and labels only

export const DOMAIN_LABELS: Record<Domain, string> = {
  PHOTOGRAPHY: "Photography",
  VIDEO_EDITING: "Video Editing",
  GRAPHIC_DESIGNING: "Graphic Designing",
  CONTENT_WRITING: "Content Writing",
  GENERAL_VOLUNTEERING: "General Volunteering",
};

// Compatibility aliases
export const DOMAINS = CREATIVE_DOMAINS;

export interface ProjectRepresentative {
  rollNumber: string;
  name: string;
  slot: 1 | 2;
}

export interface Project {
  id: ProjectId;
  name: ProjectName;
  slug: string;
  sdgs: number[];                       // e.g. [4, 17]; project events stay within these SDGs
  tagline: string;
  description: string;
  accentColor: string;
  lastActivityAt: string | null;
  status: "ACTIVE" | "INACTIVE";        // DERIVED: lastActivityAt within the last 15 days
  activeVolunteersCount: number;        // DERIVED count of ACTIVE volunteers
  totalHoursLogged: number;             // DERIVED: sum of volunteer_year_hours of its volunteers (selected year)
  representatives: ProjectRepresentative[];   // 0-2 items (fewer = vacancy = data-quality issue)
  updatedAt: string;
}

export interface DomainSummary {
  domain: CreativeDomain;
  description: string;
  activeCount: number;
  leads: VolunteerBasic[];              // >40 hours and 3+ months in the domain (advice for choosing leads)
  iconName: string;
}
