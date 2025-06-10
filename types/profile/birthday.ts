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

export interface UseBirthdayPickerReturn {
  birthdayData: BirthdayData;
  formatDateForDisplay: (date: Date) => string; 
  formatTimeForDisplay: (time: Date) => string; 
  handleDateChange: (event: any, selectedDate?: Date) => void;
  handleTimeChange: (event: any, selectedTime?: Date) => void;
  handleManualDateInput: (text: string) => void;
  handleManualTimeInput: (text: string) => void;
  getBirthDateTimeString: () => string;
  setUseManualInput: (value: boolean) => void;
  setIncludeTime: (value: boolean) => void;
  setShowDatePicker: (value: boolean) => void;
  setShowTimePicker: (value: boolean) => void;
  loadBirthdayData: (birthDateTime?: string) => void; // Wichtig: Hinzufügen!
}