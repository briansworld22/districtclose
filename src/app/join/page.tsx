'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/dc-taxes';
import type { Transaction } from '@/types/database';

function JoinPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!token) {
        setError('Invalid invitation link');
        setIsLoading(false);
        return;
      }

      const supabase = createClient();

      // Check if user is logged in
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({ id: authUser.id, email: authUser.email || '' });
      }

      // Get transaction by invite token
      const { data: txn, error: txnError } = await supabase
        .from('transactions')
        .select('*')
        .eq('invite_token', token)
        .single();

      if (txnError || !txn) {
        setError('Invalid or expired invitation');
        setIsLoading(false);
        return;
      }

      if (txn.partner_id) {
        setError('This invitation has already been accepted');
        setIsLoading(false);
        return;
      }

      if (authUser && txn.creator_id === authUser.id) {
        setError('You cannot join your own transaction');
        setIsLoading(false);
        return;
      }

      setTransaction(txn);
      setIsLoading(false);
    }

    loadData();
  }, [token]);

  const handleJoin = async () => {
    if (!user || !transaction) return;

    setIsJoining(true);
    const supabase = createClient();

    const partnerRole = transaction.creator_role === 'buyer' ? 'seller' : 'buyer';

    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        partner_id: user.id,
        partner_role: partnerRole,
        status: 'active',
      })
      .eq('id', transaction.id);

    if (updateError) {
      setError(updateError.message);
      setIsJoining(false);
      return;
    }

    router.push(`/transactions/${transaction.id}`);
    router.refresh();
  };

  const handleSignIn = () => {
    router.push(`/auth/login?redirectTo=/join?token=${token}`);
  };

  const handleSignUp = () => {
    router.push(`/auth/signup?redirectTo=/join?token=${token}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card variant="bordered" className="w-full max-w-md">
        <CardHeader>
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-blue-600">DistrictClose</h1>
            <p className="text-sm text-gray-500 mt-1">DC FSBO Transaction Manager</p>
          </div>
          <CardTitle className="text-center">Join Transaction</CardTitle>
          <CardDescription className="text-center">
            You&apos;ve been invited to join a real estate transaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="space-y-4">
              <Alert variant="error">{error}</Alert>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
              </Button>
            </div>
          ) : transaction ? (
            <div className="space-y-6">
              {/* Transaction Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Property Address</p>
                  <p className="font-medium">{transaction.property_address}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sale Price</p>
                  <p className="font-medium">{formatCurrency(transaction.sale_price)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Your Role</p>
                  <p className="font-medium capitalize">
                    {transaction.creator_role === 'buyer' ? 'Seller' : 'Buyer'}
                  </p>
                </div>
              </div>

              {transaction.is_tenanted && (
                <Alert variant="warning" title="TOPA Property">
                  This property is tenant-occupied. DC TOPA laws apply.
                </Alert>
              )}

              {/* Actions */}
              {user ? (
                <Button
                  className="w-full"
                  onClick={handleJoin}
                  isLoading={isJoining}
                >
                  Join as {transaction.creator_role === 'buyer' ? 'Seller' : 'Buyer'}
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 text-center">
                    Sign in or create an account to join this transaction
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={handleSignIn}>
                      Sign In
                    </Button>
                    <Button onClick={handleSignUp}>
                      Sign Up
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      }
    >
      <JoinPageContent />
    </Suspense>
  );
}
