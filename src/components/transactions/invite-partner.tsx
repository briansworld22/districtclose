'use client';

import { useState } from 'react';
import { Copy, Mail, Check, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { buildInviteUrl } from '@/utils/invite';
import type { Transaction } from '@/types/database';

interface InvitePartnerProps {
  transaction: Transaction;
}

export function InvitePartner({ transaction }: InvitePartnerProps) {
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const inviteUrl = buildInviteUrl(transaction.invite_token);
  const partnerRole = transaction.creator_role === 'buyer' ? 'Seller' : 'Buyer';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSendInvite = async () => {
    if (!email) return;

    setIsSending(true);
    // In a real implementation, this would send an email via API
    // For now, we just simulate the process
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSending(false);
    setSendSuccess(true);
    setTimeout(() => setSendSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Invite the {partnerRole}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Share this link with the other party to let them join this transaction.
        </p>
      </div>

      {/* Copy Link Section */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <LinkIcon className="h-4 w-4" />
          Invite Link
        </div>
        <div className="flex gap-2">
          <Input
            value={inviteUrl}
            readOnly
            className="bg-white text-sm"
          />
          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="flex-shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Email Invite Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Mail className="h-4 w-4" />
          Send via Email
        </div>
        <div className="flex gap-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="partner@example.com"
          />
          <Button
            onClick={handleSendInvite}
            isLoading={isSending}
            disabled={!email}
            className="flex-shrink-0"
          >
            Send Invite
          </Button>
        </div>
        {sendSuccess && (
          <Alert variant="success">
            Invitation sent successfully to {email}
          </Alert>
        )}
      </div>

      <div className="text-xs text-gray-400">
        This invite link expires in 7 days. The {partnerRole.toLowerCase()} will need to
        create an account or sign in to accept the invitation.
      </div>
    </div>
  );
}
