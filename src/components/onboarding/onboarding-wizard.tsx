'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home,
  UserCheck,
  FileText,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  DollarSign,
  Users,
  CheckCircle,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import { generateInviteToken } from '@/utils/invite';
import { cn } from '@/utils/cn';

interface OnboardingWizardProps {
  userEmail: string;
}

type UserRole = 'buyer' | 'seller' | null;

interface FormData {
  role: UserRole;
  propertyAddress: string;
  salePrice: string;
  isTenanted: boolean;
  targetSettlementDate: string;
}

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: Sparkles },
  { id: 'role', title: 'Your Role', icon: UserCheck },
  { id: 'property', title: 'Property', icon: Building },
  { id: 'details', title: 'Details', icon: FileText },
  { id: 'complete', title: 'Complete', icon: CheckCircle },
];

export function OnboardingWizard({ userEmail }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTransactionId, setCreatedTransactionId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    role: null,
    propertyAddress: '',
    salePrice: '',
    isTenanted: false,
    targetSettlementDate: '',
  });

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return formData.role !== null;
      case 2:
        return formData.propertyAddress.trim() !== '';
      case 3:
        return formData.salePrice !== '' && Number(formData.salePrice) > 0;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (currentStep === 3) {
      await createTransaction();
    } else if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const createTransaction = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in');
        return;
      }

      const inviteToken = generateInviteToken();

      const { data, error: insertError } = await supabase
        .from('transactions')
        .insert({
          creator_id: user.id,
          creator_role: formData.role,
          property_address: formData.propertyAddress,
          sale_price: Number(formData.salePrice),
          is_tenanted: formData.isTenanted,
          topa_flagged: formData.isTenanted,
          target_settlement_date: formData.targetSettlementDate || null,
          invite_token: inviteToken,
          status: 'pending_join',
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setCreatedTransactionId(data.id);
      setCurrentStep(4);
    } catch (err) {
      console.error('Error creating transaction:', err);
      setError('Failed to create transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    if (num) {
      return Number(num).toLocaleString();
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                  index < currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : index === currentStep
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-gray-200 text-gray-400 bg-white'
                )}
              >
                {index < currentStep ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'w-12 h-0.5 mx-1',
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Step Content */}
          <div className="p-8">
            {/* Step 0: Welcome */}
            {currentStep === 0 && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  Welcome to DistrictClose!
                </h1>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Let&apos;s get you set up with your DC FSBO transaction. This will only
                  take a minute, and I&apos;ll guide you through every step.
                </p>
                <div className="bg-blue-50 rounded-xl p-4 text-left max-w-md mx-auto">
                  <h3 className="font-medium text-blue-900 mb-2">What you&apos;ll get:</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      Shared timeline with your buyer/seller
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      DC-specific document checklist
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      Tax & closing cost calculator
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      AI assistant for questions
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 1: Role Selection */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  Are you the Buyer or Seller?
                </h2>
                <p className="text-gray-500 text-center mb-8">
                  This helps us customize your experience and show relevant information.
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <button
                    onClick={() => updateFormData({ role: 'buyer' })}
                    className={cn(
                      'p-6 rounded-xl border-2 transition-all text-center',
                      formData.role === 'buyer'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center',
                        formData.role === 'buyer'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      <Home className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900">I&apos;m Buying</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Purchasing a property
                    </p>
                  </button>
                  <button
                    onClick={() => updateFormData({ role: 'seller' })}
                    className={cn(
                      'p-6 rounded-xl border-2 transition-all text-center',
                      formData.role === 'seller'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center',
                        formData.role === 'seller'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900">I&apos;m Selling</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Selling my property
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Property Address */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  What&apos;s the property address?
                </h2>
                <p className="text-gray-500 text-center mb-8">
                  Enter the Washington, D.C. property address
                </p>
                <div className="max-w-md mx-auto">
                  <Input
                    label="Property Address"
                    placeholder="1234 Main St NW, Washington, DC 20001"
                    value={formData.propertyAddress}
                    onChange={(e) =>
                      updateFormData({ propertyAddress: e.target.value })
                    }
                  />
                  <div className="mt-6">
                    <Checkbox
                      label="This property currently has tenants"
                      description="DC's TOPA law may apply, giving tenants purchase rights"
                      checked={formData.isTenanted}
                      onChange={(e) =>
                        updateFormData({ isTenanted: e.target.checked })
                      }
                    />
                  </div>
                  {formData.isTenanted && (
                    <Alert variant="warning" className="mt-4">
                      <strong>TOPA Notice:</strong> This transaction involves a tenanted
                      property and requires regulatory review under DC TOPA laws.
                      We&apos;ll help you track this.
                    </Alert>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Price & Details */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  Transaction Details
                </h2>
                <p className="text-gray-500 text-center mb-8">
                  Enter the sale price and target closing date
                </p>
                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sale Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="550,000"
                        value={formatPrice(formData.salePrice)}
                        onChange={(e) =>
                          updateFormData({
                            salePrice: e.target.value.replace(/[^0-9]/g, ''),
                          })
                        }
                      />
                    </div>
                    {formData.salePrice && Number(formData.salePrice) > 400000 && (
                      <p className="text-xs text-amber-600 mt-1">
                        Higher tax rate (1.45%) applies for properties over $400K
                      </p>
                    )}
                  </div>
                  <Input
                    label="Target Settlement Date (optional)"
                    type="date"
                    value={formData.targetSettlementDate}
                    onChange={(e) =>
                      updateFormData({ targetSettlementDate: e.target.value })
                    }
                  />
                  <div className="bg-gray-50 rounded-lg p-4 mt-6">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      Next: Invite the {formData.role === 'buyer' ? 'Seller' : 'Buyer'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      After creating your transaction, you&apos;ll get a link to share with
                      the other party so they can join and collaborate with you.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Complete */}
            {currentStep === 4 && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  You&apos;re All Set!
                </h2>
                <p className="text-gray-600 mb-6">
                  Your transaction has been created. Now let&apos;s invite the{' '}
                  {formData.role === 'buyer' ? 'seller' : 'buyer'} to collaborate.
                </p>
                <Button
                  size="lg"
                  onClick={() => router.push(`/transactions/${createdTransactionId}`)}
                >
                  Go to Transaction
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {error && (
              <Alert variant="error" className="mt-4">
                {error}
              </Alert>
            )}
          </div>

          {/* Footer Navigation */}
          {currentStep < 4 && (
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
                className={currentStep === 0 ? 'invisible' : ''}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                isLoading={isSubmitting}
              >
                {currentStep === 3 ? 'Create Transaction' : 'Continue'}
                {currentStep < 3 && <ArrowRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          )}
        </div>

        {/* Skip link */}
        {currentStep === 0 && (
          <p className="text-center mt-6 text-sm text-gray-500">
            Already know what you&apos;re doing?{' '}
            <button
              onClick={() => router.push('/dashboard')}
              className="text-blue-600 hover:underline"
            >
              Skip to dashboard
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
