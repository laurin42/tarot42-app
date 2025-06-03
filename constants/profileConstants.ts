// constants/profileConstants.ts

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

// TypeScript types für bessere Type Safety
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