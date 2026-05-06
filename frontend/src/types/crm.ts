export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal Sent" | "Won" | "Lost";

export type LeadSource = "Website" | "LinkedIn" | "Referral" | "Cold Email" | "Event" | "Other";

export interface Lead {
  _id: string;
  leadName: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  leadSource: LeadSource;
  assignedSalesperson: string;
  status: LeadStatus;
  estimatedDealValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  leadId: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadDetail extends Lead {
  notes: Note[];
}

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  wonLeads: number;
  lostLeads: number;
  totalEstimatedDealValue: number;
  totalWonDealValue: number;
}
