'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Check, Clock, AlertTriangle, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getStatusColor, getStatusLabel } from '@/utils/milestones';
import type { Milestone, MilestoneStatus } from '@/types/database';

interface MilestoneCardProps {
  milestone: Milestone;
  isEditable: boolean;
  onStatusChange?: (status: MilestoneStatus) => void;
}

export function MilestoneCard({
  milestone,
  isEditable,
  onStatusChange,
}: MilestoneCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case 'complete':
        return <Check className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'at_risk':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const statusOptions: MilestoneStatus[] = ['not_started', 'in_progress', 'complete', 'at_risk'];

  return (
    <div
      className={cn(
        'relative border rounded-lg p-4 transition-all',
        milestone.status === 'complete'
          ? 'bg-green-50/50 border-green-200'
          : milestone.status === 'at_risk'
          ? 'bg-red-50/50 border-red-200'
          : milestone.status === 'in_progress'
          ? 'bg-blue-50/50 border-blue-200'
          : 'bg-white border-gray-200'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div
            className={cn(
              'flex-shrink-0 p-1.5 rounded-full',
              getStatusColor(milestone.status)
            )}
          >
            {getStatusIcon(milestone.status)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-gray-900">{milestone.name}</h4>
              {milestone.is_dc_specific && (
                <Badge variant="info" size="sm">DC Specific</Badge>
              )}
            </div>
            {milestone.description && (
              <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
            )}
            {milestone.due_date && (
              <p className="text-xs text-gray-400 mt-2">
                Due: {format(new Date(milestone.due_date), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={
              milestone.status === 'complete'
                ? 'success'
                : milestone.status === 'at_risk'
                ? 'danger'
                : milestone.status === 'in_progress'
                ? 'info'
                : 'default'
            }
          >
            {getStatusLabel(milestone.status)}
          </Badge>

          {isEditable && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Expanded status change options */}
      {isExpanded && isEditable && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Update Status:</p>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <Button
                key={status}
                variant={milestone.status === status ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onStatusChange?.(status)}
              >
                {getStatusLabel(status)}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
