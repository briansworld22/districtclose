'use client';

import { useState, useEffect } from 'react';
import { Calculator, DollarSign, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert } from '@/components/ui/alert';
import {
  calculateDCTaxes,
  calculateBuyerCashToClose,
  calculateSellerNetProceeds,
  formatCurrency,
  formatPercentage,
} from '@/utils/dc-taxes';
import type { UserRole } from '@/types/database';

interface DCTaxCalculatorProps {
  salePrice: number;
  userRole: UserRole;
  onUpdate?: (data: {
    buyerCashToClose?: number;
    sellerNetProceeds?: number;
  }) => void;
}

export function DCTaxCalculator({
  salePrice,
  userRole,
  onUpdate,
}: DCTaxCalculatorProps) {
  // Buyer fields
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(false);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [titleInsurance, setTitleInsurance] = useState(0);
  const [buyerOtherCosts, setBuyerOtherCosts] = useState(0);

  // Seller fields
  const [mortgageBalance, setMortgageBalance] = useState(0);
  const [otherLiens, setOtherLiens] = useState(0);
  const [realEstateCommission, setRealEstateCommission] = useState(0);
  const [hoaFees, setHoaFees] = useState(0);
  const [sellerOtherFees, setSellerOtherFees] = useState(0);

  // Calculate taxes
  const taxes = calculateDCTaxes(salePrice, isFirstTimeBuyer);
  const downPaymentAmount = (salePrice * downPaymentPercent) / 100;

  // Calculate totals
  const buyerCashToClose = calculateBuyerCashToClose({
    salePrice,
    downPaymentAmount,
    recordationTax: taxes.recordationTax,
    transferTax: taxes.transferTax,
    titleInsurance,
    otherClosingCosts: buyerOtherCosts,
  });

  const sellerNetProceeds = calculateSellerNetProceeds({
    salePrice,
    existingMortgageBalance: mortgageBalance,
    otherLiens,
    transferTax: taxes.transferTax,
    realEstateCommission,
    hoaFeesDue: hoaFees,
    otherFees: sellerOtherFees,
  });

  useEffect(() => {
    if (onUpdate) {
      onUpdate({
        buyerCashToClose: userRole === 'buyer' ? buyerCashToClose : undefined,
        sellerNetProceeds: userRole === 'seller' ? sellerNetProceeds : undefined,
      });
    }
  }, [buyerCashToClose, sellerNetProceeds, userRole, onUpdate]);

  return (
    <div className="space-y-6">
      {/* Tax Summary Card */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            <CardTitle>DC Tax & Closing Cost Calculator</CardTitle>
          </div>
          <CardDescription>
            Estimated taxes and costs based on DC regulations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Recordation Tax</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(taxes.recordationTax)}
              </p>
              <p className="text-xs text-gray-400">
                Rate: {formatPercentage(taxes.recordationTaxRate)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Transfer Tax</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(taxes.transferTax)}
              </p>
              <p className="text-xs text-gray-400">
                Rate: {formatPercentage(taxes.transferTaxRate)}
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">DC Tax Rate Thresholds</p>
                <p className="text-blue-600">
                  Properties ≤ $400K: 1.1% | Properties &gt; $400K: 1.45%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buyer Calculator - Only visible to buyers */}
      {userRole === 'buyer' && (
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <CardTitle>Buyer: Cash-to-Close Estimate</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Checkbox
              label="First-time DC homebuyer"
              description="Reduced recordation tax may apply for homes under $500K"
              checked={isFirstTimeBuyer}
              onChange={(e) => setIsFirstTimeBuyer(e.target.checked)}
            />

            {isFirstTimeBuyer && taxes.firstTimeBuyerSavings > 0 && (
              <Alert variant="success">
                First-time buyer savings: {formatCurrency(taxes.firstTimeBuyerSavings)}
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Down Payment %"
                type="number"
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                min={0}
                max={100}
              />
              <div className="pt-6">
                <p className="text-sm text-gray-500">Down Payment Amount</p>
                <p className="font-semibold">{formatCurrency(downPaymentAmount)}</p>
              </div>
            </div>

            <Input
              label="Title Insurance (estimated)"
              type="number"
              value={titleInsurance || ''}
              onChange={(e) => setTitleInsurance(Number(e.target.value))}
            />

            <Input
              label="Other Closing Costs"
              type="number"
              value={buyerOtherCosts || ''}
              onChange={(e) => setBuyerOtherCosts(Number(e.target.value))}
            />

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <span className="font-medium text-green-900">
                  Estimated Cash-to-Close
                </span>
                <span className="text-xl font-bold text-green-700">
                  {formatCurrency(buyerCashToClose)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seller Calculator - Only visible to sellers */}
      {userRole === 'seller' && (
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <CardTitle>Seller: Net Proceeds Estimate</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Existing Mortgage Balance"
              type="number"
              value={mortgageBalance || ''}
              onChange={(e) => setMortgageBalance(Number(e.target.value))}
            />

            <Input
              label="Other Liens"
              type="number"
              value={otherLiens || ''}
              onChange={(e) => setOtherLiens(Number(e.target.value))}
            />

            <Input
              label="Real Estate Commission (if any)"
              type="number"
              value={realEstateCommission || ''}
              onChange={(e) => setRealEstateCommission(Number(e.target.value))}
              helperText="FSBO transactions typically have no agent commission"
            />

            <Input
              label="HOA Fees Due"
              type="number"
              value={hoaFees || ''}
              onChange={(e) => setHoaFees(Number(e.target.value))}
            />

            <Input
              label="Other Fees"
              type="number"
              value={sellerOtherFees || ''}
              onChange={(e) => setSellerOtherFees(Number(e.target.value))}
            />

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-900">
                  Estimated Net Proceeds
                </span>
                <span className="text-xl font-bold text-blue-700">
                  {formatCurrency(sellerNetProceeds)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
