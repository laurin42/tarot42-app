// hooks/useBirthdayPicker.ts
import { useState, useCallback } from 'react';
// Stelle sicher, dass UseBirthdayPickerReturn jetzt loadBirthdayData etc. aus types/profileForm.ts enthält
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

  const handleDateChange = useCallback((event: any, selectedDate?: Date) => {
    setBirthdayData(prev => ({
      ...prev,
      showDatePicker: false,
      ...(selectedDate && {
        birthDate: selectedDate,
        manualDateInput: formatDateForDisplay(selectedDate),
      }),
    }));
  }, []); 

  const handleTimeChange = useCallback((event: any, selectedTime?: Date) => {
    setBirthdayData(prev => ({
      ...prev,
      showTimePicker: false,
      ...(selectedTime && {
        birthTime: selectedTime,
        manualTimeInput: formatTimeForDisplay(selectedTime),
      }),
    }));
  }, []);

  const handleManualDateInput = useCallback((text: string) => {
    setBirthdayData(prev => ({ ...prev, manualDateInput: text }));
    const parsedDate = parseDateFromGermanString(text);
    if (parsedDate) {
      setBirthdayData(prev => ({ ...prev, birthDate: parsedDate }));
    }
  }, []);

  const handleManualTimeInput = useCallback((text: string) => {
    setBirthdayData(prev => ({ ...prev, manualTimeInput: text }));
    const parsedTime = parseTimeFromString(text);
    if (parsedTime) {
      setBirthdayData(prev => ({ ...prev, birthTime: parsedTime }));
    }
  }, []);

  const getBirthDateTimeString = useCallback((): string => {
    return createBirthDateTimeString(
      birthdayData.manualDateInput,
      birthdayData.manualTimeInput,
      birthdayData.includeTime,
      birthdayData.birthDate
    );
  }, [birthdayData.manualDateInput, birthdayData.manualTimeInput, birthdayData.includeTime, birthdayData.birthDate]);

  const setUseManualInput = useCallback((value: boolean) => {
    setBirthdayData(prev => ({ ...prev, useManualInput: value }));
  }, []);

  const setIncludeTime = useCallback((value: boolean) => {
    setBirthdayData(prev => ({ ...prev, includeTime: value }));
  }, []);

  const setShowDatePicker = useCallback((value: boolean) => {
    setBirthdayData(prev => ({ ...prev, showDatePicker: value }));
  }, []);

  const setShowTimePicker = useCallback((value: boolean) => {
    setBirthdayData(prev => ({ ...prev, showTimePicker: value }));
  }, []);

  const loadBirthdayData = useCallback((birthDateTime?: string) => {
    if (!birthDateTime) {
        setBirthdayData(prev => ({
            ...prev,
            birthDate: getDefaultBirthDate(),
            birthTime: getDefaultBirthTime(),
            manualDateInput: "01.01.1990",
            manualTimeInput: "00:00",
            includeTime: false,
        }));
        return;
    }
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
  }, []);

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
    loadBirthdayData,
  }; 
};