// utils/formValidation.ts
import { FormData } from '../types/profileForm';
import { 
  FORM_LIMITS,
  isValidGenderKey,
  isValidFocusAreaKey,
  isValidAgeRangeKey,
} from '../constants/profileConstants';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * validates the personal goal field
 */
export const validatePersonalGoal = (value: string): FieldValidationResult => {
  const trimmed = value.trim();
  
  if (!trimmed) {
    return {
      isValid: false,
      error: "Bitte gib mindestens ein persönliches Ziel ein.",
    };
  }
  
  if (trimmed.length > FORM_LIMITS.PERSONAL_GOAL_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Das persönliche Ziel darf maximal ${FORM_LIMITS.PERSONAL_GOAL_MAX_LENGTH} Zeichen lang sein.`,
    };
  }
  
  return { isValid: true };
};

/**
 * Validates the additional details field
 */
export const validateAdditionalDetails = (value: string): FieldValidationResult => {
  if (value.length > FORM_LIMITS.ADDITIONAL_DETAILS_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Die zusätzlichen Details dürfen maximal ${FORM_LIMITS.ADDITIONAL_DETAILS_MAX_LENGTH} Zeichen lang sein.`,
    };
  }
  
  return { isValid: true };
};

/**
 * validates the entire form data
 */
export const validateForm = (formData: FormData): ValidationResult => {
  const errors: string[] = [];
  
  // personal goal
  const personalGoalValidation = validatePersonalGoal(formData.personalGoal);
  if (!personalGoalValidation.isValid && personalGoalValidation.error) {
    errors.push(personalGoalValidation.error);
  }
  
  // Zusätzliche Details
  const detailsValidation = validateAdditionalDetails(formData.additionalDetails);
  if (!detailsValidation.isValid && detailsValidation.error) {
    errors.push(detailsValidation.error);
  }
  
  // Geschlecht (falls ausgefüllt)
  const genderValidation = validateGender(formData.selectedGender);
  if (!genderValidation.isValid && genderValidation.error) {
    errors.push(genderValidation.error);
  }
  
  // Fokusbereich (falls ausgefüllt)
  const focusValidation = validateFocusArea(formData.selectedFocusArea);
  if (!focusValidation.isValid && focusValidation.error) {
    errors.push(focusValidation.error);
  }
  
  // Altersbereich (falls ausgefüllt)
  const ageValidation = validateAgeRange(formData.selectedAgeRange);
  if (!ageValidation.isValid && ageValidation.error) {
    errors.push(ageValidation.error);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Prüft ob das Formular bereit zum Speichern ist
 */
export const isFormReadyToSave = (formData: FormData): boolean => {
  const validation = validateForm(formData);
  return validation.isValid && formData.personalGoal.trim().length > 0;
};

/**
 * Erstellt eine Fehlermeldung für die Anzeige
 */
export const formatValidationErrors = (errors: string[]): string => {
  if (errors.length === 0) return "";
  if (errors.length === 1) return errors[0];
  
  return `Es gibt folgende Probleme:\n${errors.map(error => `• ${error}`).join('\n')}`;
};

/**
 * Validiert Geschlecht-Auswahl
 */
export const validateGender = (value: string): FieldValidationResult => {
  if (value && !isValidGenderKey(value)) {
    return {
      isValid: false,
      error: "Ungültige Geschlechts-Auswahl.",
    };
  }
  return { isValid: true };
};

/**
 * Validiert Fokusbereich-Auswahl
 */
export const validateFocusArea = (value: string): FieldValidationResult => {
  if (value && !isValidFocusAreaKey(value)) {
    return {
      isValid: false,
      error: "Ungültiger Fokusbereich.",
    };
  }
  return { isValid: true };
};

/**
 * Validiert Altersbereich-Auswahl
 */
export const validateAgeRange = (value: string): FieldValidationResult => {
  if (value && !isValidAgeRangeKey(value)) {
    return {
      isValid: false,
      error: "Ungültiger Altersbereich.",
    };
  }
  return { isValid: true };
};

/**
 * Bereinigt Formular-Daten vor dem Speichern
 */
export const sanitizeFormData = (formData: FormData): FormData => {
  return {
    ...formData,
    personalGoal: formData.personalGoal.trim(),
    additionalDetails: formData.additionalDetails.trim(),
    selectedGender: formData.selectedGender.trim(),
    selectedAgeRange: formData.selectedAgeRange.trim(),
    selectedFocusArea: formData.selectedFocusArea.trim(),
  };
};

/**
 * Prüft ob es ungespeicherte Änderungen gibt
 */
export const hasUnsavedChanges = (
  currentData: FormData,
  originalData: FormData
): boolean => {
  return JSON.stringify(sanitizeFormData(currentData)) !== 
         JSON.stringify(sanitizeFormData(originalData));
};