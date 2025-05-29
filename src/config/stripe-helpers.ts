/**
 * Utilities for working with Stripe payments
 */

// The currency we'll accept for payments
export const CURRENCY = 'usd';

// Format string amount (like "10.00") to the number of cents needed for Stripe
export function formatAmountForStripe(
  amount: number,
  currency: string
): number {
  const currencyToDecimalPlaces: { [key: string]: number } = {
    usd: 2,
    eur: 2,
    gbp: 2,
    jpy: 0,
    // Add more currencies as needed
  };
  
  // Default to 2 decimal places if currency not found
  const decimalPlaces = currency in currencyToDecimalPlaces
    ? currencyToDecimalPlaces[currency]
    : 2;

  // Convert the amount to the smallest currency unit (e.g., cents for USD)
  const unitAmount = amount * Math.pow(10, decimalPlaces);
  
  // Return integer value to avoid floating point errors
  return Math.round(unitAmount);
}

// Format amount from cents back to a decimal number for display
export function formatAmountFromStripe(
  amount: number,
  currency: string
): number {
  const currencyToDecimalPlaces: { [key: string]: number } = {
    usd: 2,
    eur: 2,
    gbp: 2,
    jpy: 0,
    // Add more currencies as needed
  };
  
  // Default to 2 decimal places if currency not found
  const decimalPlaces = currency in currencyToDecimalPlaces
    ? currencyToDecimalPlaces[currency]
    : 2;

  // Convert from smallest currency unit back to decimal
  return amount / Math.pow(10, decimalPlaces);
}

// Format the amount for display in the UI
export function formatAmountForDisplay(
  amount: number,
  currency: string
): string {
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  });
  
  return formatter.format(amount);
}