// ============================================================================
// IRONFORGE - Gym Configuration File
// Public branding, gym contact details, currency, and default fees.
// Admin authentication is managed securely via Supabase Auth and Express.
// ============================================================================

export interface GymConfig {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  currency: {
    symbol: string;
    code: string;
  };
  defaultMonthlyFee: number;
}

export const DEFAULT_GYM_CONFIG: GymConfig = {
  name: "IRONFORGE",
  tagline: "STRENGTH & DISCIPLINE GYM",
  phone: "+92 3XX XXXXXXX",
  email: "contact@ironforge.pk",
  address: "Your gym address, City, Pakistan",
  currency: {
    symbol: "Rs",
    code: "PKR",
  },
  defaultMonthlyFee: 3000,
};

export const GYM_CONFIG: GymConfig = DEFAULT_GYM_CONFIG;
