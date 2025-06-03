// utils/profileUtils.ts
interface UserProfile {
  name?: string;
  email?: string;
  zodiacSign?: string;
  element?: string;
  personalGoals?: string;
  additionalDetails?: string;
  focusArea?: string;
  gender?: string;
  ageRange?: string;
  birthDateTime?: string;
  includeTime?: boolean;
}

export const getProfileCompleteness = (userProfile: UserProfile | null): number => {
  if (!userProfile) return 0;
  
  const fields = [
    userProfile.zodiacSign,
    userProfile.element,
    userProfile.personalGoals,
    userProfile.focusArea,
    userProfile.gender,
    userProfile.ageRange,
    userProfile.birthDateTime,
  ];
  
  const filledFields = fields.filter(
    (field) => field && field.trim() !== ""
  ).length;
  
  return Math.round((filledFields / fields.length) * 100);
};

export const isProfileComplete = (userProfile: UserProfile | null): boolean => {
  return getProfileCompleteness(userProfile) === 100;
};

export const getMissingFields = (userProfile: UserProfile | null): string[] => {
  if (!userProfile) return ['zodiacSign', 'element', 'personalGoals', 'focusArea', 'gender', 'ageRange', 'birthDateTime'];
  
  const fieldMap = {
    zodiacSign: 'Sternzeichen',
    element: 'Element',
    personalGoals: 'Persönliche Ziele',
    focusArea: 'Fokusbereich',
    gender: 'Geschlecht',
    ageRange: 'Altersbereich',
    birthDateTime: 'Geburtstag',
  };
  
  const missingFields: string[] = [];
  
  Object.entries(fieldMap).forEach(([key, label]) => {
    const value = userProfile[key as keyof UserProfile];
    if (!value || value.toString().trim() === '') {
      missingFields.push(label);
    }
  });
  
  return missingFields;
};