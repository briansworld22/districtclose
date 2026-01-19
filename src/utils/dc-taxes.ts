import type { DCTaxCalculation } from '@/types/database';

/**
 * DC Tax & Closing Cost Calculator
 *
 * Recordation Tax:
 * - If Price <= $400k: 1.1%
 * - If Price > $400k: 1.45%
 *
 * Transfer Tax:
 * - Residential <= $400k: 1.1%
 * - Residential > $400k: 1.45%
 *
 * First-Time Homebuyer Exception:
 * - Reduced recordation tax for first-time DC homebuyers
 */

const THRESHOLD_PRICE = 400000;
const LOW_RATE = 0.011; // 1.1%
const HIGH_RATE = 0.0145; // 1.45%

// First-time homebuyer reduced rate for recordation tax (DC specific)
const FIRST_TIME_BUYER_RECORDATION_RATE = 0.00725; // 0.725%
const FIRST_TIME_BUYER_THRESHOLD = 500000; // Applies to homes under $500k

export function calculateRecordationTax(
  salePrice: number,
  isFirstTimeBuyer: boolean = false
): { amount: number; rate: number } {
  if (isFirstTimeBuyer && salePrice <= FIRST_TIME_BUYER_THRESHOLD) {
    return {
      amount: salePrice * FIRST_TIME_BUYER_RECORDATION_RATE,
      rate: FIRST_TIME_BUYER_RECORDATION_RATE,
    };
  }

  const rate = salePrice <= THRESHOLD_PRICE ? LOW_RATE : HIGH_RATE;
  return {
    amount: salePrice * rate,
    rate,
  };
}

export function calculateTransferTax(salePrice: number): { amount: number; rate: number } {
  const rate = salePrice <= THRESHOLD_PRICE ? LOW_RATE : HIGH_RATE;
  return {
    amount: salePrice * rate,
    rate,
  };
}

export function calculateDCTaxes(
  salePrice: number,
  isFirstTimeBuyer: boolean = false
): DCTaxCalculation {
  const recordation = calculateRecordationTax(salePrice, isFirstTimeBuyer);
  const transfer = calculateTransferTax(salePrice);

  // Calculate savings for first-time buyer comparison
  const regularRecordation = calculateRecordationTax(salePrice, false);
  const firstTimeBuyerSavings = isFirstTimeBuyer
    ? regularRecordation.amount - recordation.amount
    : 0;

  return {
    recordationTax: recordation.amount,
    transferTax: transfer.amount,
    recordationTaxRate: recordation.rate,
    transferTaxRate: transfer.rate,
    isFirstTimeBuyer,
    firstTimeBuyerSavings,
  };
}

/**
 * Calculate Buyer's Cash-to-Close
 */
export function calculateBuyerCashToClose(params: {
  salePrice: number;
  downPaymentAmount: number;
  recordationTax: number;
  transferTax: number;
  titleInsurance?: number;
  otherClosingCosts?: number;
}): number {
  const {
    downPaymentAmount,
    recordationTax,
    transferTax,
    titleInsurance = 0,
    otherClosingCosts = 0,
  } = params;

  // Buyer typically pays recordation tax
  return (
    downPaymentAmount +
    recordationTax +
    transferTax * 0.5 + // Typically split 50/50 in DC
    titleInsurance +
    otherClosingCosts
  );
}

/**
 * Calculate Seller's Net Proceeds
 */
export function calculateSellerNetProceeds(params: {
  salePrice: number;
  existingMortgageBalance: number;
  otherLiens?: number;
  transferTax: number;
  realEstateCommission?: number;
  hoaFeesDue?: number;
  otherFees?: number;
}): number {
  const {
    salePrice,
    existingMortgageBalance,
    otherLiens = 0,
    transferTax,
    realEstateCommission = 0,
    hoaFeesDue = 0,
    otherFees = 0,
  } = params;

  // Seller typically pays transfer tax (or splits it)
  return (
    salePrice -
    existingMortgageBalance -
    otherLiens -
    transferTax * 0.5 - // Typically split 50/50 in DC
    realEstateCommission -
    hoaFeesDue -
    otherFees
  );
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}
