export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ProfileResponse {
  personalGoals?: string;
  additionalDetails?: string;
  focusArea?: string;
  gender?: string;
  ageRange?: string;
  birthDateTime?: string;
  includeTime?: boolean;
}


export interface UpdateUserProfilePayload {
  zodiacSign?: string;
  element?: string;
  personalGoals: string;
  additionalDetails: string;
  focusArea: string;
  gender: string;
  ageRange: string;
  birthDateTime: string;
  includeTime: boolean;
}

export interface UseProfileSaveReturn {
  handleSaveCompleteProfile: () => Promise<void>;
  loadExistingProfile: () => Promise<boolean>;
}