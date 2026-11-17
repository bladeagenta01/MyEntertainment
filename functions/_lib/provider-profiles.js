// Provider billing labels are user-selected descriptions, not live billing verification.
// A profile never grants permission to generate. Explicit allowCharges consent is required separately.
export const PROVIDER_PROFILES = {
  google: [
    { id: "free", label: "Google Free Tier" },
    { id: "paid", label: "Google Paid / Billing Enabled" },
  ],
  openai: [
    { id: "credits", label: "Free or Promotional API Credits" },
    { id: "funded", label: "Funded API Usage" },
  ],
  anthropic: [
    { id: "trial", label: "Initial Trial Credits" },
    { id: "funded", label: "Prepaid or Contract Usage" },
  ],
};

export const OPERATING_MODES = {
  testing: { label: "Testing Mode", maxDepth: 2, maxQueryLength: 1200, maxReferenceLength: 4000 },
  production: { label: "Production Mode", maxDepth: 4, maxQueryLength: 4000, maxReferenceLength: 30000 },
};
