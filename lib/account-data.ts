import { readSheetTab } from "@/lib/gviz";
import { appendSheetRow } from "@/lib/sheets";

export const CREDENTIAL_HEADERS = ["Created", "Email", "PasswordHash", "Status"];
export const BUSINESS_PROFILE_HEADERS = [
  "Created",
  "Owner Email",
  "Salon",
  "Business Name",
  "Address",
  "Phone",
  "Team Accounts Needed",
  "Features",
  "Has Multiple Locations",
  "Primary Location",
  "Notes",
];
export const TEAM_MEMBER_HEADERS = [
  "Created",
  "Owner Email",
  "Salon",
  "Location",
  "Name",
  "Email",
  "Role",
  "Access Level",
  "Services",
  "Available Hours",
  "Requested Time Off",
  "Total Hours Worked",
  "Total Revenue",
  "Compensation Type",
  "Hourly Rate",
  "Salary",
  "Commission Rate",
  "Pay Duration",
  "Status",
  "Billing Status",
];
export const LOCATION_HEADERS = [
  "Created",
  "Owner Email",
  "Salon",
  "Location",
  "Address",
  "Phone",
  "Hours",
  "Manager Email",
  "Share Availability",
  "Share Inventory",
  "Notes",
  "Billing Status",
];
export const BILLING_HEADERS = [
  "Created",
  "Owner Email",
  "Salon",
  "Type",
  "Location",
  "Stripe Session",
  "Stripe Subscription",
  "Status",
  "Quantity",
];

export type CredentialRecord = {
  email: string;
  passwordHash: string;
  status: string;
};

export type BusinessProfile = {
  ownerEmail: string;
  salon: string;
  businessName: string;
  address: string;
  phone: string;
  teamAccountsNeeded: string;
  features: string;
  hasMultipleLocations: string;
  primaryLocation: string;
  notes: string;
};

export type TeamMember = {
  ownerEmail: string;
  salon: string;
  location: string;
  name: string;
  email: string;
  role: string;
  accessLevel?: string;
  services?: string;
  availableHours?: string;
  requestedTimeOff?: string;
  totalHoursWorked?: string;
  totalRevenue?: string;
  compensationType?: string;
  hourlyRate?: string;
  salary?: string;
  commissionRate?: string;
  payDuration?: string;
  status: string;
  billingStatus: string;
};

export type LocationRecord = {
  ownerEmail: string;
  salon: string;
  location: string;
  address: string;
  phone: string;
  hours?: string;
  managerEmail: string;
  shareAvailability: string;
  shareInventory: string;
  notes?: string;
  billingStatus: string;
};

const ACTIVE_BILLING_STATUSES = new Set(["active", "paid", "complete", "completed"]);

function eq(a: string, b: string) {
  return (a || "").trim().toLowerCase() === (b || "").trim().toLowerCase();
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findCredential(email: string): Promise<CredentialRecord | null> {
  const target = normalizeEmail(email);
  const rows = await readSheetTab("UserCredentials");
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i];
    if (eq(row.Email, target)) {
      return {
        email: row.Email || target,
        passwordHash: row.PasswordHash || "",
        status: row.Status || "active",
      };
    }
  }
  return null;
}

export async function appendCredential(email: string, passwordHash: string) {
  return appendSheetRow("UserCredentials", CREDENTIAL_HEADERS, [
    new Date().toISOString(),
    normalizeEmail(email),
    passwordHash,
    "active",
  ]);
}

export async function getBusinessProfile(ownerEmail: string, salon: string): Promise<BusinessProfile | null> {
  const rows = await readSheetTab("BusinessProfiles");
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i];
    if (eq(row["Owner Email"], ownerEmail) || eq(row.Salon, salon)) {
      return {
        ownerEmail: row["Owner Email"] || ownerEmail,
        salon: row.Salon || salon,
        businessName: row["Business Name"] || row.Salon || salon,
        address: row.Address || "",
        phone: row.Phone || "",
        teamAccountsNeeded: row["Team Accounts Needed"] || "",
        features: row.Features || "",
        hasMultipleLocations: row["Has Multiple Locations"] || "No",
        primaryLocation: row["Primary Location"] || row.Salon || salon,
        notes: row.Notes || "",
      };
    }
  }
  return null;
}

export async function appendBusinessProfile(profile: BusinessProfile) {
  return appendSheetRow("BusinessProfiles", BUSINESS_PROFILE_HEADERS, [
    new Date().toISOString(),
    normalizeEmail(profile.ownerEmail),
    profile.salon,
    profile.businessName,
    profile.address,
    profile.phone,
    profile.teamAccountsNeeded,
    profile.features,
    profile.hasMultipleLocations,
    profile.primaryLocation,
    profile.notes,
  ]);
}

export async function listTeamMembers(ownerEmail: string, salon: string): Promise<TeamMember[]> {
  const rows = await readSheetTab("TeamMembers");
  return rows
    .filter((row) => eq(row["Owner Email"], ownerEmail) || eq(row.Salon, salon))
    .map((row) => ({
      ownerEmail: row["Owner Email"] || ownerEmail,
      salon: row.Salon || salon,
      location: row.Location || "Primary",
      name: row.Name || "",
      email: row.Email || "",
      role: row.Role || "Team member",
      accessLevel: row["Access Level"] || row.Role || "Team member",
      services: row.Services || "",
      availableHours: row["Available Hours"] || "",
      requestedTimeOff: row["Requested Time Off"] || "",
      totalHoursWorked: row["Total Hours Worked"] || "",
      totalRevenue: row["Total Revenue"] || "",
      compensationType: row["Compensation Type"] || "",
      hourlyRate: row["Hourly Rate"] || "",
      salary: row.Salary || "",
      commissionRate: row["Commission Rate"] || "",
      payDuration: row["Pay Duration"] || "",
      status: row.Status || "active",
      billingStatus: row["Billing Status"] || "included",
    }));
}

export async function appendTeamMember(member: TeamMember) {
  return appendSheetRow("TeamMembers", TEAM_MEMBER_HEADERS, [
    new Date().toISOString(),
    normalizeEmail(member.ownerEmail),
    member.salon,
    member.location,
    member.name,
    normalizeEmail(member.email),
    member.role,
    member.accessLevel || member.role,
    member.services || "",
    member.availableHours || "",
    member.requestedTimeOff || "",
    member.totalHoursWorked || "",
    member.totalRevenue || "",
    member.compensationType || "",
    member.hourlyRate || "",
    member.salary || "",
    member.commissionRate || "",
    member.payDuration || "",
    member.status || "active",
    member.billingStatus || "included",
  ]);
}

export async function listLocations(ownerEmail: string, salon: string): Promise<LocationRecord[]> {
  const rows = await readSheetTab("Locations");
  return rows
    .filter((row) => eq(row["Owner Email"], ownerEmail) || eq(row.Salon, salon))
    .map((row) => ({
      ownerEmail: row["Owner Email"] || ownerEmail,
      salon: row.Salon || salon,
      location: row.Location || row.Salon || salon,
      address: row.Address || "",
      phone: row.Phone || "",
      hours: row.Hours || "",
      managerEmail: row["Manager Email"] || "",
      shareAvailability: row["Share Availability"] || "on",
      shareInventory: row["Share Inventory"] || "on",
      notes: row.Notes || "",
      billingStatus: row["Billing Status"] || "included",
    }));
}

export async function appendLocation(location: LocationRecord) {
  return appendSheetRow("Locations", LOCATION_HEADERS, [
    new Date().toISOString(),
    normalizeEmail(location.ownerEmail),
    location.salon,
    location.location,
    location.address,
    location.phone,
    location.hours || "",
    normalizeEmail(location.managerEmail),
    location.shareAvailability,
    location.shareInventory,
    location.notes || "",
    location.billingStatus || "included",
  ]);
}

export async function countPaidEntitlements(ownerEmail: string, salon: string, type: string, location = ""): Promise<number> {
  const rows = await readSheetTab("Billing");
  return rows.reduce((count, row) => {
    const ownerMatches = eq(row["Owner Email"], ownerEmail) || eq(row.Salon, salon);
    const typeMatches = eq(row.Type, type);
    const locationMatches = !location || eq(row.Location, location);
    const status = (row.Status || "").trim().toLowerCase();
    if (!ownerMatches || !typeMatches || !locationMatches || !ACTIVE_BILLING_STATUSES.has(status)) return count;
    return count + Math.max(1, Number(row.Quantity) || 1);
  }, 0);
}

export async function appendBillingRecord({
  ownerEmail,
  salon,
  type,
  location,
  stripeSession,
  stripeSubscription,
  status,
  quantity = 1,
}: {
  ownerEmail: string;
  salon: string;
  type: string;
  location?: string;
  stripeSession: string;
  stripeSubscription?: string;
  status: string;
  quantity?: number;
}) {
  return appendSheetRow("Billing", BILLING_HEADERS, [
    new Date().toISOString(),
    normalizeEmail(ownerEmail),
    salon,
    type,
    location || "",
    stripeSession,
    stripeSubscription || "",
    status,
    quantity,
  ]);
}
