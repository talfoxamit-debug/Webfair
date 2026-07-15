/** Shared CRM pipeline definitions, used by /api/leads and the /crm board. */

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "call_booked",
  "proposal",
  "won",
  "lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  call_booked: "Call booked",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

export type Lead = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  website: string | null;
  message: string | null;
  source: string | null;
  status: LeadStatus | null;
  notes: string | null;
};
