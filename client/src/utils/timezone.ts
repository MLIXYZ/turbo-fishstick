import { DateTime } from 'luxon';

// Convert from user to UTC
export function toUTC(date: string | Date | null | undefined): string | null {
  if (!date) return null;

  try {
    const dt = typeof date === 'string'
      ? DateTime.fromISO(date)
      : DateTime.fromJSDate(date);

    if (!dt.isValid) {
      console.error('Invalid date:', date, dt.invalidReason);
      return null;
    }

    return dt.toUTC().toISO();
  } catch (error) {
    console.error('Error converting to UTC:', error);
    return null;
  }
}

// Covert from UTC to user
export function fromUTC(utcDate: string | null | undefined): string | null {
  if (!utcDate) return null;

  try {
    const dt = DateTime.fromISO(utcDate, { zone: 'utc' });

    if (!dt.isValid) {
      console.error('Invalid UTC date:', utcDate, dt.invalidReason);
      return null;
    }

    return dt.toLocal().toISO();
  } catch (error) {
    console.error('Error converting from UTC:', error);
    return null;
  }
}

// display into User TZ
export function formatLocalDate(
  dateString: string | null | undefined,
  format: string = 'yyyy-MM-dd'
): string {
  if (!dateString) return '';

  try {
    const dt = DateTime.fromISO(dateString);

    if (!dt.isValid) {
      console.error('Invalid date for formatting:', dateString, dt.invalidReason);
      return '';
    }

    return dt.toFormat(format);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

export function formatLocalDateTime(
  dateString: string | null | undefined,
  format: string = 'yyyy-MM-dd HH:mm:ss'
): string {
  if (!dateString) return '';

  try {
    const dt = DateTime.fromISO(dateString);

    if (!dt.isValid) {
      console.error('Invalid datetime for formatting:', dateString, dt.invalidReason);
      return '';
    }

    return dt.toFormat(format);
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '';
  }
}

export function getRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '';

  try {
    const dt = DateTime.fromISO(dateString);

    if (!dt.isValid) {
      console.error('Invalid date for relative time:', dateString, dt.invalidReason);
      return '';
    }

    return dt.toRelative() || '';
  } catch (error) {
    console.error('Error getting relative time:', error);
    return '';
  }
}


export function getUserTimezone(): string {
  return DateTime.local().zoneName;
}

export function getUserTimezoneOffset(): string {
  return DateTime.local().toFormat('ZZ');
}

function isISODateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
}

export function convertDatesFromUTC<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    if (isISODateString(obj)) {
      const converted = fromUTC(obj);
      return (converted || obj) as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertDatesFromUTC(item)) as T;
  }

  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const converted: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertDatesFromUTC(value);
    }
    return converted as T;
  }

  return obj;
}

export function convertDatesToUTC<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (obj instanceof Date) {
    return toUTC(obj) as T;
  }

  if (typeof obj === 'string') {
    if (isISODateString(obj)) {
      const converted = toUTC(obj);
      return (converted || obj) as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertDatesToUTC(item)) as T;
  }

  if (typeof obj === 'object') {
    const converted: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertDatesToUTC(value);
    }
    return converted as T;
  }

  return obj;
}

export function parseDateInput(dateInput: string | null | undefined): string | null {
  if (!dateInput) return null;

  try {
    const dt = DateTime.fromISO(dateInput);

    if (!dt.isValid) {
      console.error('Invalid date input:', dateInput, dt.invalidReason);
      return null;
    }

    return dt.toISO();
  } catch (error) {
    console.error('Error parsing date input:', error);
    return null;
  }
}

export function formatForDateInput(dateString: string | null | undefined): string {
  if (!dateString) return '';

  try {
    const dt = DateTime.fromISO(dateString);

    if (!dt.isValid) {
      return '';
    }

    return dt.toFormat('yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting for date input:', error);
    return '';
  }
}

export const DateFormats = {
  SHORT_DATE: 'MM/dd/yyyy',
  LONG_DATE: 'MMMM dd, yyyy',
  ISO_DATE: 'yyyy-MM-dd',
  SHORT_DATETIME: 'MM/dd/yyyy h:mm a',
  LONG_DATETIME: 'MMMM dd, yyyy h:mm a',
  TIME_12H: 'h:mm a',
  TIME_24H: 'HH:mm',
  FULL: 'fff',
} as const;
