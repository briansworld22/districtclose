import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, FolderOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { NavHeader } from '@/components/dashboard/nav-header';
import { TransactionCard } from '@/components/dashboard/transaction-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Transaction } from '@/types/database';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch transactions where user is creator or partner
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .or(`creator_id.eq.${user.id},partner_id.eq.${user.id}`)
    .order('updated_at', { ascending: false });

  const typedTransactions = (transactions || []) as Transaction[];

  // Separate by role
  const myTransactions = typedTransactions.filter((t) => t.creator_id === user.id);
  const partnerTransactions = typedTransactions.filter((t) => t.partner_id === user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader userEmail={user.email} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Transactions</h1>
            <p className="text-gray-500 mt-1">
              Manage your DC FSBO real estate transactions
            </p>
          </div>
          <Link href="/transactions/new">
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              New Transaction
            </Button>
          </Link>
        </div>

        {/* Transactions List */}
        {typedTransactions.length === 0 ? (
          <Card variant="bordered">
            <CardContent className="py-12">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FolderOpen className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No transactions yet
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Create your first transaction to start managing your DC FSBO
                  real estate deal. You can invite the other party once created.
                </p>
                <Link href="/transactions/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-1" />
                    Create Transaction
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Transactions I created */}
            {myTransactions.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Transactions I Created
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {myTransactions.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      userRole="creator"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Transactions I joined */}
            {partnerTransactions.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Transactions I Joined
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {partnerTransactions.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      userRole="partner"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
