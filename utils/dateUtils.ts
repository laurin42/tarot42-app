
export const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};


export const formatTimeForDisplay = (date: Date): string => {
  return date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
};


export const parseDateFromGermanString = (dateString: string): Date | null => {
  const datePattern = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  const match = dateString.match(datePattern);
  
  if (match) {
    const [, day, month, year] = match;
    const parsedDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    );
    
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }
  
  return null;
};


export const parseTimeFromString = (timeString: string): Date | null => {
  const timePattern = /^(\d{2}):(\d{2})$/;
  const match = timeString.match(timePattern);
  
  if (match) {
    const [, hours, minutes] = match;
    const parsedHours = parseInt(hours);
    const parsedMinutes = parseInt(minutes);
    
    if (parsedHours < 24 && parsedMinutes < 60) {
      const newTime = new Date(2000, 0, 1, parsedHours, parsedMinutes);
      if (!isNaN(newTime.getTime())) {
        return newTime;
      }
    }
  }
  
  return null;
};


export const createBirthDateTimeString = (
  dateInput: string,
  timeInput: string,
  includeTime: boolean,
  birthDate: Date
): string => {
  if (!dateInput && !formatDateForDisplay(birthDate)) return "";

  const dateStr = dateInput || formatDateForDisplay(birthDate);
  
  if (includeTime && timeInput) {
    return `${dateStr} um ${timeInput}`;
  }
  
  return dateStr;
};


export const isValidGermanDateString = (dateString: string): boolean => {
  const datePattern = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  const match = dateString.match(datePattern);
  
  if (!match) return false;
  
  const [, day, month, year] = match;
  const dayNum = parseInt(day);
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);
  
  if (dayNum < 1 || dayNum > 31) return false;
  if (monthNum < 1 || monthNum > 12) return false;
  if (yearNum < 1900 || yearNum > new Date().getFullYear()) return false;
  
  const date = new Date(yearNum, monthNum - 1, dayNum);
  return date.getDate() === dayNum && 
         date.getMonth() === monthNum - 1 && 
         date.getFullYear() === yearNum;
};


export const isValidTimeString = (timeString: string): boolean => {
  const timePattern = /^(\d{2}):(\d{2})$/;
  const match = timeString.match(timePattern);
  
  if (!match) return false;
  
  const [, hours, minutes] = match;
  const hoursNum = parseInt(hours);
  const minutesNum = parseInt(minutes);
  
  return hoursNum >= 0 && hoursNum < 24 && minutesNum >= 0 && minutesNum < 60;
};


export const getDefaultBirthDate = (): Date => {
  return new Date(1990, 0, 1);
};

export const getDefaultBirthTime = (): Date => {
  return new Date(2000, 0, 1, 0, 0);
};

export const parseBirthDateTimeString = (birthDateTime: string): {
  dateString: string;
  timeString: string;
  hasTime: boolean;
} => {
  if (!birthDateTime) {
    return {
      dateString: "01.01.1990",
      timeString: "00:00",
      hasTime: false,
    };
  }
  
  const parts = birthDateTime.split(" um ");
  const dateString = parts[0] || "01.01.1990";
  const timeString = parts[1] || "00:00";
  const hasTime = parts.length > 1;
  
  return {
    dateString,
    timeString,
    hasTime,
  };
};