export type ClientRecord = Record<string, string>;

export const CLIENT_MERGE_HEADERS = [
  "Created",
  "Salon",
  "Master Key",
  "Master Name",
  "Duplicate Keys",
  "Duplicate Names",
  "Action",
  "Notes",
];

function normalize(value: string) {
  return String(value || "").trim().toLowerCase();
}

function phoneDigits(value: string) {
  return String(value || "").replace(/\D/g, "");
}

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = Math.imul(31, hash) + value.charCodeAt(i) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function clientRowKey(row: ClientRecord) {
  const identity = [
    normalize(row.Name),
    normalize(row.Email),
    phoneDigits(row.Phone),
    normalize(row["Last visit"]),
    normalize(row.Service),
    normalize(row.Added),
    normalize(row.Source),
  ].join("|");
  return `client_${hashString(identity)}`;
}

export function clientEmailKey(row: ClientRecord) {
  const email = normalize(row.Email);
  return email ? `email:${email}` : "";
}

export function clientPhoneKey(row: ClientRecord) {
  const phone = phoneDigits(row.Phone);
  return phone.length >= 7 ? `phone:${phone}` : "";
}

export function clientNameKey(row: ClientRecord) {
  const name = normalize(row.Name).replace(/[^a-z0-9]/g, "");
  return name.length >= 6 ? `name:${name}` : "";
}

export function mergedDuplicateKeys(mergeRows: ClientRecord[], salon: string) {
  const targetSalon = normalize(salon);
  const keys = new Set<string>();

  mergeRows.forEach((row) => {
    if (normalize(row.Salon) !== targetSalon) return;
    if (normalize(row.Action || "merged") !== "merged") return;
    String(row["Duplicate Keys"] || "")
      .split("|")
      .map((key) => key.trim())
      .filter(Boolean)
      .forEach((key) => keys.add(key));
  });

  return keys;
}
