export function formatCurrency(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0
  }).format(value || 0);
}

export function splitCsv(value) {
  return value ? value.split("|").filter(Boolean) : [];
}

export function splitNumbers(value) {
  return value
    ? value
        .split(",")
        .map((item) => Number(item))
        .filter((item) => !Number.isNaN(item))
    : [];
}

export function tierLabel(tier) {
  return tier.replaceAll("_", "-").toLowerCase();
}

export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
