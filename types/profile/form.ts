import type { 
  GenderKey, 
  AgeRangeKey, 
  FocusAreaKey, 
} from '../../constants/profileConstants';


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

export interface FormState {
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  initialLoadComplete: boolean;
}

export interface UseFormCacheReturn {
  saveFormCache: () => Promise<void>;
  loadFormCache: () => Promise<boolean>;
  clearFormCache: () => Promise<void>;
  cleanupOldCaches: () => Promise<void>;
}

export interface UseProfileFormReturn {
  formData: FormData;
  formState: FormState;
  updateFormData: (updates: Partial<FormData>) => void;
  setFormState: (updates: Partial<FormState>) => void;
}

export type GenderOption = GenderKey;
export type AgeRange = AgeRangeKey;
export type FocusArea = FocusAreaKey;
