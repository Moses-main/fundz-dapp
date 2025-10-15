import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function to merge Tailwind CSS classes conditionally.
 * It uses `clsx` for conditional class names and `tailwind-merge` to resolve conflicts.
 * @param {...any} inputs - Class names or objects with class names as values and booleans as keys.
 * @returns {string} - Merged class names string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number with commas as thousand separators.
 * @param {number} number - The number to format.
 * @returns {string} - Formatted number string.
 */
export function formatNumber(number) {
  return new Intl.NumberFormat('en-US').format(number);
}

/**
 * Shortens an Ethereum address for display.
 * @param {string} address - The full Ethereum address.
 * @param {number} [chars=4] - Number of characters to show at the start and end.
 * @returns {string} - Shortened address (e.g., "0x1234...abcd").
 */
export function shortenAddress(address, chars = 4) {
  if (!address) return '';
  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`;
}

/**
 * Converts wei to ether.
 * @param {string|number} wei - The amount in wei.
 * @returns {string} - The amount in ether.
 */
export function weiToEther(wei) {
  return (Number(wei) / 1e18).toString();
}

/**
 * Formats a date string to a more readable format.
 * @param {string|number|Date} date - The date to format.
 * @returns {string} - Formatted date string.
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncates text to a specified length and adds an ellipsis if needed.
 * @param {string} text - The text to truncate.
 * @param {number} maxLength - Maximum length before truncation.
 * @returns {string} - Truncated text with ellipsis if needed.
 */
export function truncate(text, maxLength = 50) {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}

/**
 * Copies text to the clipboard.
 * @param {string} text - The text to copy.
 * @returns {Promise<boolean>} - True if successful, false otherwise.
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

/**
 * Debounces a function call.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay.
 * @returns {Function} - The debounced function.
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
