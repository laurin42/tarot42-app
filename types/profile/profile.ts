import type { UserGoal } from './';

export interface ProfileData {
  id: string; 
  userName?: string;
  email?: string;
  zodiacSign?: string | null;
  element?: string | null;
  selectedElement?: string | null; 
  selectedUserGoalId?: number | null; 
  additionalDetails?: string | null;
  focusArea?: string | null;
  gender?: string | null;
  ageRange?: string | null;
  birthDateTime?: string | null;
  includeTime?: boolean | null;
  userGoals?: UserGoal[];
  selectedGoalText?: string | null; 
}



