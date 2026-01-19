import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, FolderOpen, Sparkles, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { NavHeader } from '@/components/dashboard/nav-header';
import { TransactionCard } from '@/components/dashboard/transaction-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChatWidget } from '@/components/ai/chat-widget';
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

  // Check if user is brand new (no transactions)
  const isNewUser = typedTransactions.length === 0;

  // Separate by role
  const myTransactions = typedTransactions.filter((t) => t.creator_id === user.id);
  const partnerTransactions = typedTransactions.filter((t) => t.partner_id === user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader userEmail={user.email} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* New User Welcome */}
        {isNewUser ? (
          <div className="max-w-2xl mx-auto">
            {/* Welcome Hero */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                <Sparkles className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Welcome to DistrictClose!
              </h1>
              <p className="text-lg text-gray-600">
                Let&apos;s set up your DC FSBO transaction. It only takes a minute.
              </p>
            </div>

            {/* Getting Started Card */}
            <Card variant="bordered" className="mb-6">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Get Started in 3 Easy Steps
                </h2>
                <div className="space-y-4 mb-8">
                  <Step
                    number={1}
                    title="Tell us your role"
                    description="Are you the buyer or seller in this transaction?"
                  />
                  <Step
                    number={2}
                    title="Add property details"
                    description="Enter the DC property address and sale price"
                  />
                  <Step
                    number={3}
                    title="Invite the other party"
                    description="Share a link so you can collaborate together"
                  />
                </div>
                <Link href="/onboarding">
                  <Button size="lg" className="w-full">
                    Create Your First Transaction
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* What You Get */}
            <div className="grid grid-cols-2 gap-4">
              <FeatureCard
                title="Shared Timeline"
                description="Track milestones together with your buyer/seller"
              />
              <FeatureCard
                title="DC Tax Calculator"
                description="Accurate recordation & transfer tax estimates"
              />
              <FeatureCard
                title="Document Checklist"
                description="Required DC forms with official links"
              />
              <FeatureCard
                title="AI Assistant"
                description="Get instant answers about DC real estate"
              />
            </div>

            {/* AI Hint */}
            <p className="text-center text-sm text-gray-500 mt-8">
              Have questions? Click the chat bubble in the corner to ask our AI assistant.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Transactions</h1>
                <p className="text-gray-500 mt-1">
                  Manage your DC FSBO real estate transactions
                </p>
              </div>
              <Link href="/onboarding">
                <Button>
                  <Plus className="h-4 w-4 mr-1" />
                  New Transaction
                </Button>
              </Link>
            </div>

            {/* Transactions List */}
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
          </>
        )}
      </main>

      {/* AI Chat Widget */}
      <ChatWidget context={{ currentPage: 'dashboard' }} />
    </div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
        {number}
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
