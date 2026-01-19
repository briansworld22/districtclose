import Link from 'next/link';
import { format } from 'date-fns';
import { Home, Users, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/dc-taxes';
import type { Transaction, TransactionStatus } from '@/types/database';

interface TransactionCardProps {
  transaction: Transaction;
  userRole: 'creator' | 'partner';
}

export function TransactionCard({ transaction, userRole }: TransactionCardProps) {
  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'pending_join':
        return <Badge variant="warning">Pending Partner</Badge>;
      case 'closed':
        return <Badge variant="default">Closed</Badge>;
      default:
        return <Badge variant="default">Draft</Badge>;
    }
  };

  const roleLabel = userRole === 'creator' ? transaction.creator_role : transaction.partner_role;

  return (
    <Link href={`/transactions/${transaction.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all group">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
              <Home className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {transaction.property_address}
              </h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="font-medium text-gray-900">
                  {formatCurrency(transaction.sale_price)}
                </span>
                <span className="capitalize">
                  You: {roleLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(transaction.status)}
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Created {format(new Date(transaction.created_at), 'MMM d, yyyy')}
          </div>
          {transaction.target_settlement_date && (
            <div>
              Settlement: {format(new Date(transaction.target_settlement_date), 'MMM d, yyyy')}
            </div>
          )}
          {transaction.is_tenanted && (
            <Badge variant="warning" size="sm">TOPA</Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
