import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, Home, Users, Calendar, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { NavHeader } from '@/components/dashboard/nav-header';
import { TransactionTimeline } from '@/components/timeline/transaction-timeline';
import { DocumentChecklist } from '@/components/documents/document-checklist';
import { DCTaxCalculator } from '@/components/calculator/dc-tax-calculator';
import { InvitePartner } from '@/components/transactions/invite-partner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/dc-taxes';
import { ChatWidget } from '@/components/ai/chat-widget';
import type { Transaction, Milestone, Document, UserRole } from '@/types/database';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TransactionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch transaction
  const { data: transaction, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !transaction) {
    notFound();
  }

  const typedTransaction = transaction as Transaction;

  // Check if user is participant
  const isCreator = typedTransaction.creator_id === user.id;
  const isPartner = typedTransaction.partner_id === user.id;

  if (!isCreator && !isPartner) {
    redirect('/dashboard');
  }

  // Determine user role in this transaction
  const userRole: UserRole = isCreator
    ? typedTransaction.creator_role
    : (typedTransaction.partner_role as UserRole);

  // Fetch milestones
  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('transaction_id', id)
    .order('order_index', { ascending: true });

  // Fetch documents
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('transaction_id', id);

  const typedMilestones = (milestones || []) as Milestone[];
  const typedDocuments = (documents || []) as Document[];

  const partnerRole = typedTransaction.creator_role === 'buyer' ? 'Seller' : 'Buyer';

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader userEmail={user.email} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {typedTransaction.property_address}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(typedTransaction.sale_price)}
                  </span>
                  <Badge
                    variant={
                      typedTransaction.status === 'active'
                        ? 'success'
                        : typedTransaction.status === 'pending_join'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {typedTransaction.status === 'pending_join'
                      ? 'Pending Partner'
                      : typedTransaction.status.charAt(0).toUpperCase() +
                        typedTransaction.status.slice(1)}
                  </Badge>
                  {typedTransaction.is_tenanted && (
                    <Badge variant="warning">TOPA</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Users className="h-4 w-4" />
                <span>
                  Your Role: <span className="font-medium capitalize">{userRole}</span>
                </span>
              </div>
              {typedTransaction.target_settlement_date && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Settlement:{' '}
                    {format(new Date(typedTransaction.target_settlement_date), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* TOPA Warning */}
          {typedTransaction.topa_flagged && (
            <Alert variant="warning" title="TOPA Notice Required" className="mt-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                <p>
                  This transaction involves a tenanted property and requires regulatory
                  review under DC TOPA (Tenant Opportunity to Purchase Act) laws.
                </p>
              </div>
            </Alert>
          )}
        </div>

        {/* Invite Partner Section (if pending) */}
        {typedTransaction.status === 'pending_join' && isCreator && (
          <Card variant="bordered" className="mb-6">
            <CardHeader>
              <CardTitle>Waiting for {partnerRole}</CardTitle>
            </CardHeader>
            <CardContent>
              <InvitePartner transaction={typedTransaction} />
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Timeline & Documents */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Transaction Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionTimeline
                  milestones={typedMilestones}
                  userRole={userRole}
                  transactionId={typedTransaction.id}
                  isParticipant={isCreator || isPartner}
                />
              </CardContent>
            </Card>

            {/* Documents */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentChecklist
                  documents={typedDocuments}
                  userRole={userRole}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Calculator */}
          <div className="space-y-6">
            <DCTaxCalculator
              salePrice={typedTransaction.sale_price}
              userRole={userRole}
            />
          </div>
        </div>
      </main>

      {/* AI Chat Widget with transaction context */}
      <ChatWidget
        context={{
          userRole,
          propertyAddress: typedTransaction.property_address,
          salePrice: typedTransaction.sale_price,
          isTenanted: typedTransaction.is_tenanted,
          currentPage: 'transaction-detail',
        }}
      />
    </div>
  );
}
