// src/utils/formatters.ts

/**
 * Parses user input like "10k", "1.5L", "2.5Cr" into standard numeric values.
 * Returns NaN if input is invalid.
 */
export function parseShorthandNumber(input: string): number {
  if (!input) return 0;

  // Clean string: trim space and normalize to lowercase
  const clean = input.trim().toLowerCase().replace(/,/g, '');

  // Extract base number and suffix code
  const match = clean.match(/^([\d.]+)\s*([a-z]*)$/);
  if (!match) return parseFloat(clean) || 0;

  const value = parseFloat(match[1]);
  const suffix = match[2];

  if (isNaN(value)) return 0;

  switch (suffix) {
    case 'k':
      return value * 1_000;
    case 'l':
    case 'lakh':
    case 'lakhs':
      return value * 100_000; // Fixed: 1 Lakh = 100,000
    case 'cr':
    case 'crore':
    case 'crores':
      return value * 10_000_000; // Fixed: 1 Crore = 10,000,000
    case 'm':
      return value * 1_000_000;
    case 'b':
      return value * 1_000_000_000;
    default:
      return value;
  }
}