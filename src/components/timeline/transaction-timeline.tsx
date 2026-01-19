'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MilestoneCard } from './milestone-card';
import { Alert } from '@/components/ui/alert';
import type { Milestone, MilestoneStatus, UserRole } from '@/types/database';

interface TransactionTimelineProps {
  milestones: Milestone[];
  userRole: UserRole;
  transactionId: string;
  isParticipant: boolean;
}

export function TransactionTimeline({
  milestones: initialMilestones,
  userRole,
  transactionId,
  isParticipant,
}: TransactionTimelineProps) {
  const [milestones, setMilestones] = useState(initialMilestones);
  const [error, setError] = useState<string | null>(null);

  // Filter milestones based on visibility rules
  const visibleMilestones = milestones.filter((m) => {
    if (userRole === 'buyer') return m.visible_to_buyer;
    if (userRole === 'seller') return m.visible_to_seller;
    return true;
  });

  const handleStatusChange = async (milestoneId: string, newStatus: MilestoneStatus) => {
    setError(null);
    const supabase = createClient();

    const { error: updateError } = await supabase
      .from('milestones')
      .update({
        status: newStatus,
        completed_date: newStatus === 'complete' ? new Date().toISOString() : null,
      })
      .eq('id', milestoneId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    // Update local state
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              status: newStatus,
              completed_date: newStatus === 'complete' ? new Date().toISOString() : null,
            }
          : m
      )
    );
  };

  // Calculate progress
  const completedCount = visibleMilestones.filter((m) => m.status === 'complete').length;
  const progressPercent = visibleMilestones.length
    ? Math.round((completedCount / visibleMilestones.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">Transaction Progress</h3>
          <span className="text-sm text-gray-500">
            {completedCount} of {visibleMilestones.length} complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {error && (
        <Alert variant="error">{error}</Alert>
      )}

      {/* Milestones List */}
      <div className="space-y-3">
        {visibleMilestones
          .sort((a, b) => a.order_index - b.order_index)
          .map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              isEditable={isParticipant}
              onStatusChange={(status) => handleStatusChange(milestone.id, status)}
            />
          ))}
      </div>

      {visibleMilestones.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No milestones to display yet.
        </div>
      )}
    </div>
  );
}
