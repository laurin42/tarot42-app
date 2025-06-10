import type { ProfileData } from '../types/profile';

export const getProfileCompleteness = (profileData: ProfileData | null): number => {
  if (!profileData) return 0;
  
  const fields = [
    profileData.zodiacSign,
    profileData.element,
    profileData.selectedGoalText,
    profileData.focusArea,
    profileData.gender,
    profileData.ageRange,
    profileData.birthDateTime,
  ];
  
  const filledFields = fields.filter(
    (field) => field && field.trim() !== ""
  ).length;
  
  return Math.round((filledFields / fields.length) * 100);
};

export const isProfileComplete = (profileData: ProfileData | null): boolean => {
  return getProfileCompleteness(profileData) === 100;
};

export const getMissingFields = (profileData: ProfileData | null): string[] => {
  if (!profileData) return ['zodiacSign', 'element', 'selectedGoalText', 'focusArea', 'gender', 'ageRange', 'birthDateTime'];
  
  const fieldMap = {
    zodiacSign: 'Sternzeichen',
    element: 'Element',
    selectedGoalText: 'Persönliche Ziele',
    focusArea: 'Fokusbereich',
    gender: 'Geschlecht',
    ageRange: 'Altersbereich',
    birthDateTime: 'Geburtstag',
  };
  
  const missingFields: string[] = [];
  
  Object.entries(fieldMap).forEach(([key, label]) => {
    const value = profileData[key as keyof ProfileData];
    if (!value || value.toString().trim() === '') {
      missingFields.push(label);
    }
  });
  
  return missingFields;
};