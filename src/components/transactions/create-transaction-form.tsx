'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { RoleSelector } from './role-selector';
import { PropertyForm } from './property-form';
import { generateInviteToken } from '@/utils/invite';
import type { UserRole } from '@/types/database';

interface FormData {
  role: UserRole | null;
  property_address: string;
  sale_price: number;
  is_tenanted: boolean;
  target_settlement_date: string;
}

export function CreateTransactionForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    role: null,
    property_address: '',
    sale_price: 0,
    is_tenanted: false,
    target_settlement_date: '',
  });

  const handleRoleSelect = (role: UserRole) => {
    setFormData({ ...formData, role });
  };

  const handlePropertyChange = (data: Omit<FormData, 'role'>) => {
    setFormData({ ...formData, ...data });
  };

  const handleNext = () => {
    if (step === 1 && formData.role) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.role || !formData.property_address || !formData.sale_price) {
      setError('Please fill in all required fields');
      return;
    }

    setError(null);
    setIsLoading(true);

    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be logged in to create a transaction');
      setIsLoading(false);
      return;
    }

    // Create the transaction
    const inviteToken = generateInviteToken();
    const { data: transaction, error: createError } = await supabase
      .from('transactions')
      .insert({
        creator_id: user.id,
        creator_role: formData.role,
        property_address: formData.property_address,
        sale_price: formData.sale_price,
        is_tenanted: formData.is_tenanted,
        topa_flagged: formData.is_tenanted,
        invite_token: inviteToken,
        status: 'pending_join',
        target_settlement_date: formData.target_settlement_date || null,
      })
      .select()
      .single();

    if (createError) {
      setError(createError.message);
      setIsLoading(false);
      return;
    }

    // Redirect to the transaction page
    router.push(`/transactions/${transaction.id}`);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-2">
        <div
          className={`h-2 w-2 rounded-full ${
            step >= 1 ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        />
        <div className="w-12 h-0.5 bg-gray-200" />
        <div
          className={`h-2 w-2 rounded-full ${
            step >= 2 ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        />
      </div>

      {/* Step 1: Role Selection */}
      {step === 1 && (
        <div>
          <RoleSelector
            selectedRole={formData.role}
            onSelect={handleRoleSelect}
          />
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleNext}
              disabled={!formData.role}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Property Information */}
      {step === 2 && (
        <div>
          <PropertyForm
            data={{
              property_address: formData.property_address,
              sale_price: formData.sale_price,
              is_tenanted: formData.is_tenanted,
              target_settlement_date: formData.target_settlement_date,
            }}
            onChange={handlePropertyChange}
          />
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!formData.property_address || !formData.sale_price}
            >
              Create Transaction
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
