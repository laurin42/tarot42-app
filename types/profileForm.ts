import type { 
  GenderKey, 
  AgeRangeKey, 
  FocusAreaKey, 
} from '../constants/profileConstants';

export interface FormData {
  personalGoal: string;
  additionalDetails: string;
  selectedGender: string;
  selectedAgeRange: string;
  selectedFocusArea: string;
  manualDateInput: string;
  manualTimeInput: string;
  includeTime: boolean;
}

export interface FormCache extends FormData {
  lastUpdated: number;
  userId: string;
}

export interface BirthdayData {
  birthDate: Date;
  birthTime: Date;
  manualDateInput: string;
  manualTimeInput: string;
  showDatePicker: boolean;
  showTimePicker: boolean;
  useManualInput: boolean;
  includeTime: boolean;
}

export interface ProfileData {
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

export interface FormState {
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  initialLoadComplete: boolean;
}

// Types from constants
export type GenderOption = GenderKey;
export type AgeRange = AgeRangeKey;
export type FocusArea = FocusAreaKey;

// API Response Types
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

// Hook Return Types
export interface UseFormCacheReturn {
  saveFormCache: () => Promise<void>;
  loadFormCache: () => Promise<boolean>;
  clearFormCache: () => Promise<void>;
  cleanupOldCaches: () => Promise<void>;
}

export interface UseBirthdayPickerReturn {
  birthdayData: BirthdayData;
  formatDateForDisplay: (date: Date) => string;
  formatTimeForDisplay: (date: Date) => string;
  handleDateChange: (event: any, selectedDate?: Date) => void;
  handleTimeChange: (event: any, selectedTime?: Date) => void;
  handleManualDateInput: (text: string) => void;
  handleManualTimeInput: (text: string) => void;
  getBirthDateTimeString: () => string;
  setUseManualInput: (value: boolean) => void;
  setIncludeTime: (value: boolean) => void;
  setShowDatePicker: (value: boolean) => void;
  setShowTimePicker: (value: boolean) => void;
}

export interface UseProfileSaveReturn {
  handleSaveCompleteProfile: () => Promise<void>;
  loadExistingProfile: () => Promise<boolean>;
}

export interface UseProfileFormReturn {
  formData: FormData;
  formState: FormState;
  updateFormData: (updates: Partial<FormData>) => void;
  setFormState: (updates: Partial<FormState>) => void;
}