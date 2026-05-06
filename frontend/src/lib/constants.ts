import { LeadSource, LeadStatus } from "@/types/crm";

export const LEAD_STATUSES: LeadStatus[] = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Won",
  "Lost",
];

export const LEAD_SOURCES: LeadSource[] = ["Website", "LinkedIn", "Referral", "Cold Email", "Event", "Other"];
