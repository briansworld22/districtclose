import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CreateTransactionForm } from '@/components/transactions/create-transaction-form';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600">DistrictClose</h1>
          <p className="text-sm text-gray-500 mt-1">DC FSBO Transaction Manager</p>
        </div>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Start a New Transaction</CardTitle>
            <CardDescription>
              Create a new FSBO transaction for a property in Washington, D.C.
              You can invite the other party once the transaction is created.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateTransactionForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
