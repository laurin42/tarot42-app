export const FOCUS_AREA_LABELS = {
  financial_career: "Finanzielle/berufliche Deutung",
  love_relationships: "Liebesleben",
  personal_development: "Persönliche Entwicklung",
} as const;

export const GENDER_LABELS = {
  male: "Männlich",
  female: "Weiblich",
  diverse: "Divers",
  prefer_not_to_say: "Keine Angabe",
} as const;

export const AGE_RANGES = [
  { key: "18-25", label: "18-25 Jahre" },
  { key: "26-35", label: "26-35 Jahre" },
  { key: "36-45", label: "36-45 Jahre" },
  { key: "46-55", label: "46-55 Jahre" },
  { key: "56-65", label: "56-65 Jahre" },
  { key: "65+", label: "65+ Jahre" },
] as const;

// TypeScript types for better type safety
export type FocusAreaKey = keyof typeof FOCUS_AREA_LABELS;
export type GenderKey = keyof typeof GENDER_LABELS;
export type AgeRangeKey = typeof AGE_RANGES[number]['key'];

// Helper functions
export const getFocusAreaLabel = (key: string): string => {
  return FOCUS_AREA_LABELS[key as FocusAreaKey] || key;
};

export const getGenderLabel = (key: string): string => {
  return GENDER_LABELS[key as GenderKey] || key;
};

export const getAgeRangeLabel = (key: string): string => {
  const range = AGE_RANGES.find(r => r.key === key);
  return range?.label || key;
};

// Form Options for Profile Form
export const GENDER_OPTIONS = [
  { key: "male", label: "Männlich", icon: "male" },
  { key: "female", label: "Weiblich", icon: "female" },
  { key: "diverse", label: "Divers", icon: "transgender" },
  { key: "prefer_not_to_say", label: "Keine Angabe", icon: "help-circle" },
] as const;

export const FOCUS_AREAS = [
  {
    key: "financial_career",
    label: "Finanzielle/berufliche Deutung",
    icon: "trending-up",
    description: "Karriere, Geld, Erfolg",
  },
  {
    key: "love_relationships",
    label: "Liebesleben",
    icon: "heart",
    description: "Beziehungen, Romantik, Partnerschaft",
  },
  {
    key: "personal_development",
    label: "Persönliche Entwicklung",
    icon: "person",
    description: "Selbstfindung, Spiritualität, Wachstum",
  },
] as const;

// API Konstanten
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.178.67:3000";

export const SECURE_STORE_BEARER_TOKEN_KEY = "tarot42.bearerAuthToken";

// Cache constants
export const getFormCacheKey = (userId: string) => `profile_form_cache_${userId}`;

// Form Limits
export const FORM_LIMITS = {
  PERSONAL_GOAL_MAX_LENGTH: 500,
  ADDITIONAL_DETAILS_MAX_LENGTH: 1000,
  CACHE_EXPIRY_HOURS: 24,
  AUTO_SAVE_DELAY_MS: 2000,
} as const;

// Extended Types for better type safety
export type GenderOptionType = typeof GENDER_OPTIONS[number];
export type FocusAreaType = typeof FOCUS_AREAS[number];
export type AgeRangeType = typeof AGE_RANGES[number];

// Validation für options
export const isValidGenderKey = (key: string): key is GenderKey => {
  return key in GENDER_LABELS;
};

export const isValidFocusAreaKey = (key: string): key is FocusAreaKey => {
  return key in FOCUS_AREA_LABELS;
};

export const isValidAgeRangeKey = (key: string): key is AgeRangeKey => {
  return AGE_RANGES.some(range => range.key === key);
};

// Find Functions for Options
export const findGenderOption = (key: string): GenderOptionType | undefined => {
  return GENDER_OPTIONS.find(option => option.key === key);
};

export const findFocusArea = (key: string): FocusAreaType | undefined => {
  return FOCUS_AREAS.find(area => area.key === key);
};

export const findAgeRange = (key: string): AgeRangeType | undefined => {
  return AGE_RANGES.find(range => range.key === key);
};