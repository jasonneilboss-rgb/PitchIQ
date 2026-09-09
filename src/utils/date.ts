import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export const SAST_TIMEZONE = 'Africa/Johannesburg';
export const LONDON_TIMEZONE = 'Europe/London';

/**
 * Converts a UTC/ISO timestamp to SAST (Africa/Johannesburg, UTC+2) formatted string
 */
export function formatToSAST(utcDateString: string, formatStr: string = 'HH:mm'): string {
  try {
    const date = typeof utcDateString === 'string' ? parseISO(utcDateString) : new Date(utcDateString);
    const zoned = toZonedTime(date, SAST_TIMEZONE);
    return format(zoned, formatStr);
  } catch {
    return '--:--';
  }
}

/**
 * Returns formatted date in SAST e.g. "Sat 14 Sep 2026"
 */
export function formatMatchDateSAST(utcDateString: string): string {
  try {
    const date = typeof utcDateString === 'string' ? parseISO(utcDateString) : new Date(utcDateString);
    const zoned = toZonedTime(date, SAST_TIMEZONE);
    return format(zoned, 'EEE d MMM yyyy');
  } catch {
    return 'TBD';
  }
}

/**
 * Returns formatted London time (GMT or BST depending on daylight saving)
 */
export function formatToLondonTime(utcDateString: string): string {
  try {
    const date = typeof utcDateString === 'string' ? parseISO(utcDateString) : new Date(utcDateString);
    const zoned = toZonedTime(date, LONDON_TIMEZONE);
    return format(zoned, 'HH:mm zzz');
  } catch {
    return 'GMT';
  }
}

/**
 * Computes remaining time until kickoff: "Xd Xh Xm Xs"
 */
export function getTimeRemaining(targetDateIso: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  formatted: string;
} {
  try {
    const target = parseISO(targetDateIso).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, formatted: '00d 00h 00m 00s' };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const formatted = `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;

    return { days, hours, minutes, seconds, isPast: false, formatted };
  } catch {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, formatted: '--' };
  }
}
