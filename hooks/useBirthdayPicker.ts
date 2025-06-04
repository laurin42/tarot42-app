// hooks/useBirthdayPicker.ts
import { useState } from 'react';
import { UseBirthdayPickerReturn, BirthdayData } from '../types/profileForm';
import {
  formatDateForDisplay,
  formatTimeForDisplay,
  parseDateFromGermanString,
  parseTimeFromString,
  createBirthDateTimeString,
  getDefaultBirthDate,
  getDefaultBirthTime,
  parseBirthDateTimeString,
} from '../utils/dateUtils';

export const useBirthdayPicker = (initialBirthDateTime?: string): UseBirthdayPickerReturn => {
  // Parse initial data if provided
  const parsedInitial = initialBirthDateTime 
    ? parseBirthDateTimeString(initialBirthDateTime)
    : {
        dateString: "01.01.1990",
        timeString: "00:00",
        hasTime: false,
      };

  const [birthdayData, setBirthdayData] = useState<BirthdayData>({
    birthDate: parseDateFromGermanString(parsedInitial.dateString) || getDefaultBirthDate(),
    birthTime: parseTimeFromString(parsedInitial.timeString) || getDefaultBirthTime(),
    manualDateInput: parsedInitial.dateString,
    manualTimeInput: parsedInitial.timeString,
    showDatePicker: false,
    showTimePicker: false,
    useManualInput: false,
    includeTime: parsedInitial.hasTime,
  });

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setBirthdayData(prev => ({
      ...prev,
      showDatePicker: false,
      ...(selectedDate && {
        birthDate: selectedDate,
        manualDateInput: formatDateForDisplay(selectedDate),
      }),
    }));
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setBirthdayData(prev => ({
      ...prev,
      showTimePicker: false,
      ...(selectedTime && {
        birthTime: selectedTime,
        manualTimeInput: formatTimeForDisplay(selectedTime),
      }),
    }));
  };

  const handleManualDateInput = (text: string) => {
    setBirthdayData(prev => ({
      ...prev,
      manualDateInput: text,
    }));

    // Try to parse and update birthDate if valid
    const parsedDate = parseDateFromGermanString(text);
    if (parsedDate) {
      setBirthdayData(prev => ({
        ...prev,
        birthDate: parsedDate,
      }));
    }
  };

  const handleManualTimeInput = (text: string) => {
    setBirthdayData(prev => ({
      ...prev,
      manualTimeInput: text,
    }));

    // Try to parse and update birthTime if valid
    const parsedTime = parseTimeFromString(text);
    if (parsedTime) {
      setBirthdayData(prev => ({
        ...prev,
        birthTime: parsedTime,
      }));
    }
  };

  const getBirthDateTimeString = (): string => {
    return createBirthDateTimeString(
      birthdayData.manualDateInput,
      birthdayData.manualTimeInput,
      birthdayData.includeTime,
      birthdayData.birthDate
    );
  };

  const setUseManualInput = (value: boolean) => {
    setBirthdayData(prev => ({
      ...prev,
      useManualInput: value,
    }));
  };

  const setIncludeTime = (value: boolean) => {
    setBirthdayData(prev => ({
      ...prev,
      includeTime: value,
    }));
  };

  const setShowDatePicker = (value: boolean) => {
    setBirthdayData(prev => ({
      ...prev,
      showDatePicker: value,
    }));
  };

  const setShowTimePicker = (value: boolean) => {
    setBirthdayData(prev => ({
      ...prev,
      showTimePicker: value,
    }));
  };

  // Load new birthday data from external source
  const loadBirthdayData = (birthDateTime?: string) => {
    if (!birthDateTime) return;
    
    const parsed = parseBirthDateTimeString(birthDateTime);
    const newBirthDate = parseDateFromGermanString(parsed.dateString) || getDefaultBirthDate();
    const newBirthTime = parseTimeFromString(parsed.timeString) || getDefaultBirthTime();
    
    setBirthdayData(prev => ({
      ...prev,
      birthDate: newBirthDate,
      birthTime: newBirthTime,
      manualDateInput: parsed.dateString,
      manualTimeInput: parsed.timeString,
      includeTime: parsed.hasTime,
    }));
  };

  return {
    birthdayData,
    formatDateForDisplay,
    formatTimeForDisplay,
    handleDateChange,
    handleTimeChange,
    handleManualDateInput,
    handleManualTimeInput,
    getBirthDateTimeString,
    setUseManualInput,
    setIncludeTime,
    setShowDatePicker,
    setShowTimePicker,
    // Additional helper
    loadBirthdayData,
  } as UseBirthdayPickerReturn & { loadBirthdayData: (birthDateTime?: string) => void };
};