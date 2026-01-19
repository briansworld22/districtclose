import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CreateTransactionForm } from '@/components/transactions/create-transaction-form';

export default async function NewTransactionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Create New Transaction</CardTitle>
            <CardDescription>
              Start a new FSBO transaction for a Washington, D.C. property.
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
