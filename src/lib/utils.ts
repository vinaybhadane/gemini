import { Timestamp } from 'firebase/firestore';
import { format, isToday, isYesterday } from 'date-fns';
import { type ClassValue, clsx } from 'clsx';

/**
 * Merge class names (minimal clsx implementation since we're not using shadcn).
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Format a Firestore Timestamp or Date into "10:30 PM".
 */
export function formatTime(timestamp: Timestamp | Date | null | undefined): string {
  if (!timestamp) return '';
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  return format(date, 'h:mm a');
}

/**
 * Format a date for the date separator.
 * Returns "Today", "Yesterday", or "12 May 2026".
 */
export function formatDateSeparator(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'd MMM yyyy');
}

/**
 * Check if two dates are on the same calendar day.
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Check if a message is within the editable 15-minute window.
 */
export function isEditable(timestamp: Timestamp | null | undefined): boolean {
  if (!timestamp) return false;
  const msgDate = timestamp.toDate();
  const now = new Date();
  const diffMs = now.getTime() - msgDate.getTime();
  return diffMs <= 15 * 60 * 1000; // 15 minutes
}

/**
 * Get the partner user ID.
 */
export function getPartner(userId: 'user1' | 'user2'): 'user1' | 'user2' {
  return userId === 'user1' ? 'user2' : 'user1';
}
