/**
 * Economic Calendar - UTC Date Utilities
 * 
 * All functions operate in UTC timezone to ensure consistent date handling
 * across different user timezones. The calendar grid always displays dates
 * in UTC to match the event data (datetime_utc).
 * 
 * Key principles:
 * - All ISO strings must end with 'Z' (UTC timezone)
 * - Date comparisons ignore time component
 * - Grid matrix always shows 6 weeks (42 days) starting Monday
 */

/**
 * Generates a 6×7 matrix of ISO date strings (UTC) for a calendar month.
 * Always starts on Monday (ISO 8601 standard) and shows 6 complete weeks.
 * Includes leading days from previous month and trailing days from next month.
 * 
 * @param anchorDate - Any date in the target month (used to determine which month to display)
 * @returns 6×7 array where each inner array is a week (Mon-Sun), dates as ISO strings (YYYY-MM-DD)
 * 
 * @example
 * ```typescript
 * // For January 2025:
 * const matrix = getMonthMatrixUTC(new Date('2025-01-15T00:00:00.000Z'));
 * // Returns:
 * // [
 * //   ['2024-12-30', '2024-12-31', '2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05'],
 * //   ['2025-01-06', '2025-01-07', '2025-01-08', '2025-01-09', '2025-01-10', '2025-01-11', '2025-01-12'],
 * //   ['2025-01-13', '2025-01-14', '2025-01-15', '2025-01-16', '2025-01-17', '2025-01-18', '2025-01-19'],
 * //   ['2025-01-20', '2025-01-21', '2025-01-22', '2025-01-23', '2025-01-24', '2025-01-25', '2025-01-26'],
 * //   ['2025-01-27', '2025-01-28', '2025-01-29', '2025-01-30', '2025-01-31', '2025-02-01', '2025-02-02'],
 * //   ['2025-02-03', '2025-02-04', '2025-02-05', '2025-02-06', '2025-02-07', '2025-02-08', '2025-02-09']
 * // ]
 * ```
 */
export function getMonthMatrixUTC(anchorDate: Date): string[][] {
  // Get first day of the anchor month in UTC
  const year = anchorDate.getUTCFullYear();
  const month = anchorDate.getUTCMonth();
  const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
  
  // Find Monday of the first week (may be in previous month)
  // getUTCDay() returns 0 (Sun) - 6 (Sat), we want Mon (1) to be first
  const dayOfWeek = firstDayOfMonth.getUTCDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday special case
  
  const startDate = new Date(firstDayOfMonth);
  startDate.setUTCDate(startDate.getUTCDate() + mondayOffset);
  
  // Generate 6 weeks (42 days)
  const matrix: string[][] = [];
  const currentDate = new Date(startDate);
  
  for (let week = 0; week < 6; week++) {
    const weekDays: string[] = [];
    for (let day = 0; day < 7; day++) {
      // Format as YYYY-MM-DD
      const isoDate = currentDate.toISOString().split('T')[0];
      weekDays.push(isoDate);
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    matrix.push(weekDays);
  }
  
  return matrix;
}

/**
 * Calculates the UTC date range for all visible cells in a calendar month grid.
 * Returns ISO strings for the first and last visible dates (including leading/trailing days).
 * 
 * @param anchorDate - Any date in the target month
 * @returns Object with startUtcISO (first Monday) and endUtcISO (last Sunday) as YYYY-MM-DD strings
 * 
 * @example
 * ```typescript
 * const bounds = getMonthBoundsUTC(new Date('2025-01-15T00:00:00.000Z'));
 * // Returns: { startUtcISO: '2024-12-30', endUtcISO: '2025-02-09' }
 * // Covers full 42-day range visible in grid
 * ```
 */
export function getMonthBoundsUTC(anchorDate: Date): { 
  startUtcISO: string; 
  endUtcISO: string;
} {
  // Get first day of the anchor month in UTC
  const year = anchorDate.getUTCFullYear();
  const month = anchorDate.getUTCMonth();
  const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
  
  // Find Monday of the first week
  const dayOfWeek = firstDayOfMonth.getUTCDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const startDate = new Date(firstDayOfMonth);
  startDate.setUTCDate(startDate.getUTCDate() + mondayOffset);
  
  // End date is 41 days after start (6 weeks = 42 days total, so last day is +41)
  const endDate = new Date(startDate);
  endDate.setUTCDate(endDate.getUTCDate() + 41);
  
  return {
    startUtcISO: startDate.toISOString().split('T')[0],
    endUtcISO: endDate.toISOString().split('T')[0],
  };
}

/**
 * Compares two ISO date strings to check if they represent the same UTC date.
 * Ignores time component - only compares YYYY-MM-DD.
 * 
 * @param isoA - First ISO date string (YYYY-MM-DD or full ISO with time)
 * @param isoB - Second ISO date string (YYYY-MM-DD or full ISO with time)
 * @returns true if both dates are the same UTC date, false otherwise
 * 
 * @example
 * ```typescript
 * isSameUTCDate('2025-01-15', '2025-01-15'); // true
 * isSameUTCDate('2025-01-15T10:00:00.000Z', '2025-01-15T23:59:59.999Z'); // true (same day)
 * isSameUTCDate('2025-01-15', '2025-01-16'); // false
 * ```
 */
export function isSameUTCDate(isoA: string, isoB: string): boolean {
  // Extract date portion (YYYY-MM-DD) from both strings
  const dateA = isoA.split('T')[0];
  const dateB = isoB.split('T')[0];
  return dateA === dateB;
}

/**
 * Converts a UTC ISO date string to a human-readable local time string.
 * Useful for tooltips showing "this is X in your timezone".
 * 
 * @param iso - UTC ISO date string (YYYY-MM-DD or full ISO with time)
 * @returns Formatted string in user's local timezone (e.g., "Wednesday, January 15, 2025")
 * 
 * @example
 * ```typescript
 * // User in PST (UTC-8):
 * toLocalTooltip('2025-01-15T00:00:00.000Z');
 * // Returns: "Tuesday, January 14, 2025" (previous day in PST)
 * 
 * // User in UTC:
 * toLocalTooltip('2025-01-15');
 * // Returns: "Wednesday, January 15, 2025"
 * ```
 */
export function toLocalTooltip(iso: string): string {
  // Parse ISO string as UTC date
  const date = new Date(iso);
  
  // Format in user's local timezone
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Gets today's date as a UTC ISO string (YYYY-MM-DD).
 * Useful for highlighting "today" in the grid.
 * 
 * @returns Today's date in UTC as YYYY-MM-DD
 * 
 * @example
 * ```typescript
 * const today = getTodayUTC();
 * // Returns: "2025-01-15" (if today is Jan 15, 2025 UTC)
 * ```
 */
export function getTodayUTC(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Checks if a given ISO date string is today (UTC).
 * 
 * @param iso - ISO date string to check (YYYY-MM-DD or full ISO with time)
 * @returns true if the date is today in UTC, false otherwise
 * 
 * @example
 * ```typescript
 * // If today is 2025-01-15 UTC:
 * isTodayUTC('2025-01-15'); // true
 * isTodayUTC('2025-01-15T10:00:00.000Z'); // true
 * isTodayUTC('2025-01-14'); // false
 * ```
 */
export function isTodayUTC(iso: string): boolean {
  return isSameUTCDate(iso, getTodayUTC());
}

/**
 * Formats a UTC ISO datetime string as HH:MM (24-hour format).
 * Useful for displaying event times in the grid.
 * 
 * @param iso - Full UTC ISO datetime string (YYYY-MM-DDTHH:MM:SS.SSSZ)
 * @returns Time in HH:MM format (e.g., "14:30")
 * 
 * @example
 * ```typescript
 * formatTimeUTC('2025-01-15T14:30:00.000Z'); // "14:30"
 * formatTimeUTC('2025-01-15T09:05:00.000Z'); // "09:05"
 * ```
 */
export function formatTimeUTC(iso: string): string {
  const date = new Date(iso);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Formats a UTC ISO date string as a readable date (e.g., "Jan 15, 2025").
 * 
 * @param iso - UTC ISO date string (YYYY-MM-DD or full ISO with time)
 * @returns Formatted date string (e.g., "Jan 15, 2025")
 * 
 * @example
 * ```typescript
 * formatDateUTC('2025-01-15'); // "Jan 15, 2025"
 * formatDateUTC('2025-01-15T14:30:00.000Z'); // "Jan 15, 2025"
 * ```
 */
export function formatDateUTC(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Gets the month name and year for display in grid header.
 * 
 * @param anchorDate - Any date in the target month
 * @returns Object with month name and year (e.g., { month: "January", year: 2025 })
 * 
 * @example
 * ```typescript
 * const { month, year } = getMonthYearUTC(new Date('2025-01-15T00:00:00.000Z'));
 * // Returns: { month: "January", year: 2025 }
 * ```
 */
export function getMonthYearUTC(anchorDate: Date): { 
  month: string; 
  year: number;
} {
  const year = anchorDate.getUTCFullYear();
  const monthIndex = anchorDate.getUTCMonth();
  const monthName = new Date(Date.UTC(year, monthIndex, 1)).toLocaleDateString('en-US', {
    month: 'long',
    timeZone: 'UTC',
  });
  
  return { month: monthName, year };
}

/**
 * Navigates to the previous month from a given date.
 * 
 * @param anchorDate - Current date
 * @returns New date in the previous month (1st day of that month)
 * 
 * @example
 * ```typescript
 * const prev = getPreviousMonthUTC(new Date('2025-01-15T00:00:00.000Z'));
 * // Returns: Date('2024-12-01T00:00:00.000Z')
 * ```
 */
export function getPreviousMonthUTC(anchorDate: Date): Date {
  const year = anchorDate.getUTCFullYear();
  const month = anchorDate.getUTCMonth();
  return new Date(Date.UTC(year, month - 1, 1));
}

/**
 * Navigates to the next month from a given date.
 * 
 * @param anchorDate - Current date
 * @returns New date in the next month (1st day of that month)
 * 
 * @example
 * ```typescript
 * const next = getNextMonthUTC(new Date('2025-01-15T00:00:00.000Z'));
 * // Returns: Date('2025-02-01T00:00:00.000Z')
 * ```
 */
export function getNextMonthUTC(anchorDate: Date): Date {
  const year = anchorDate.getUTCFullYear();
  const month = anchorDate.getUTCMonth();
  return new Date(Date.UTC(year, month + 1, 1));
}

/**
 * Checks if a given date is in the current month (anchor month).
 * 
 * @param dateISO - ISO date string to check (YYYY-MM-DD)
 * @param anchorDate - Reference date determining the "current" month
 * @returns true if dateISO is in the same month/year as anchorDate, false otherwise
 * 
 * @example
 * ```typescript
 * const anchor = new Date('2025-01-15T00:00:00.000Z');
 * isCurrentMonthUTC('2025-01-10', anchor); // true
 * isCurrentMonthUTC('2024-12-31', anchor); // false
 * isCurrentMonthUTC('2025-02-01', anchor); // false
 * ```
 */
export function isCurrentMonthUTC(dateISO: string, anchorDate: Date): boolean {
  const [year, month] = dateISO.split('-').map(Number);
  const anchorYear = anchorDate.getUTCFullYear();
  const anchorMonth = anchorDate.getUTCMonth() + 1; // getUTCMonth() is 0-indexed
  
  return year === anchorYear && month === anchorMonth;
}
