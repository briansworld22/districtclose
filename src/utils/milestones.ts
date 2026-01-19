import type { Milestone, MilestoneStatus } from '@/types/database';

/**
 * Default DC-specific milestones for a FSBO transaction
 */
export interface MilestoneTemplate {
  name: string;
  description: string;
  is_dc_specific: boolean;
  visible_to_buyer: boolean;
  visible_to_seller: boolean;
  order_index: number;
  depends_on_index?: number;
  default_days_from_start?: number;
}

export const DEFAULT_MILESTONES: MilestoneTemplate[] = [
  {
    name: 'Contract Executed',
    description: 'Sales contract signed by both parties',
    is_dc_specific: false,
    visible_to_buyer: true,
    visible_to_seller: true,
    order_index: 1,
    default_days_from_start: 0,
  },
  {
    name: 'Earnest Money Deposit',
    description: 'EMD submitted to escrow/title company',
    is_dc_specific: false,
    visible_to_buyer: true,
    visible_to_seller: true,
    order_index: 2,
    depends_on_index: 1,
    default_days_from_start: 3,
  },
  {
    name: 'Home Inspection',
    description: 'Property inspection completed (typically 5-15 days)',
    is_dc_specific: false,
    visible_to_buyer: true,
    visible_to_seller: true,
    order_index: 3,
    depends_on_index: 1,
    default_days_from_start: 10,
  },
  {
    name: 'Inspection Response',
    description: 'Buyer submits inspection contingency response',
    is_dc_specific: false,
    visible_to_buyer: true,
    visible_to_seller: true,
    order_index: 4,
    depends_on_index: 3,
    default_days_from_start: 12,
  },
  {
    name: 'HOA/Condo Docs Delivered',
    description: 'DC: Seller delivers HOA/Condo documents (3-day right of rescission applies)',
    is_dc_specific: true,
    visible_to_buyer: true,
    visible_to_seller: true,
    order_index: 5,
    depends_on_index: 1,
    default_days_from_start: 7,
  },
  {
    name: 'HOA Rescission Period Ends',
    description: 'DC: 3-day right of rescission period for HOA/Condo docs expires',
    is_dc_specific: true,
    visible_to_buyer: true,
    visible_to_seller: true,
    order_index: 6,
    depends_on_index: 5,
    default_days_from_start: 10,
  },
  {
    name: 'Financing Contingency',
    description: 'Buyer loan approval contingency deadline',
    is_dc_specific: false,
    visible_to_buyer: true,
    visible_to_seller: true,
    order_index: 7,
    depends_on_index: 1,
    default_days_from_start: 21,
  },
  {
    name: 'Appraisal Completed',
    description: 'Property appraisal completed by lender',
    is_dc_specific: false,
    visible_to_buyer: true,
    visible_to_seller: true,
    order_index: 8,
    depends_on_index: 7,
    default_days_from_start: 25,
  },
  {
    name: 'Title Search Complete',
    description: 'Title company completes title search and issues commitment',
    is_dc_specific: false,
    visible_to_buyer: true,
    visible_to_seller: true,
    order_index: 9,
    depends_on_index: 1,
    default_days_from_start: 14,
  },
  {
    name: 'Clear to Close',
    description: 'Lender issues clear to close - all conditions satisfied',
    is_dc_specific: false,
    visible_to_buyer: true,
    visible_to_seller: true,
    order_index: 10,
    depends_on_index: 8,
    default_days_from_start: 28,
  },
  {
    name: 'Final Walkthrough',
    description: 'Buyer conducts final walkthrough of property',
    is_dc_specific: false,
    visible_to_buyer: true,
    visible_to_seller: true,
    order_index: 11,
    depends_on_index: 10,
    default_days_from_start: 29,
  },
  {
    name: 'Settlement/Closing',
    description: 'Final settlement - documents signed, funds disbursed',
    is_dc_specific: false,
    visible_to_buyer: true,
    visible_to_seller: true,
    order_index: 12,
    depends_on_index: 11,
    default_days_from_start: 30,
  },
];

/**
 * TOPA-specific milestones for tenanted properties in DC
 */
export const TOPA_MILESTONES: MilestoneTemplate[] = [
  {
    name: 'TOPA Notice to Tenant',
    description: 'DC TOPA: Seller provides notice of sale to tenant(s)',
    is_dc_specific: true,
    visible_to_buyer: true,
    visible_to_seller: true,
    order_index: 0,
    default_days_from_start: -30, // Before contract
  },
  {
    name: 'TOPA Response Period',
    description: 'DC TOPA: Tenant has opportunity to submit statement of interest',
    is_dc_specific: true,
    visible_to_buyer: true,
    visible_to_seller: true,
    order_index: 0,
    depends_on_index: 0,
    default_days_from_start: -15,
  },
  {
    name: 'TOPA Waiver/Expiration',
    description: 'DC TOPA: Tenant rights waived or period expired',
    is_dc_specific: true,
    visible_to_buyer: true,
    visible_to_seller: true,
    order_index: 0,
    depends_on_index: 1,
    default_days_from_start: 0,
  },
];

/**
 * Get status color class
 */
export function getStatusColor(status: MilestoneStatus): string {
  switch (status) {
    case 'complete':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'at_risk':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'not_started':
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get status label
 */
export function getStatusLabel(status: MilestoneStatus): string {
  switch (status) {
    case 'complete':
      return 'Complete';
    case 'in_progress':
      return 'In Progress';
    case 'at_risk':
      return 'At Risk';
    case 'not_started':
    default:
      return 'Not Started';
  }
}

/**
 * Calculate milestone due dates based on contract date
 */
export function calculateMilestoneDates(
  templates: MilestoneTemplate[],
  contractDate: Date
): Array<MilestoneTemplate & { due_date: Date }> {
  return templates.map((template) => {
    const dueDate = new Date(contractDate);
    dueDate.setDate(dueDate.getDate() + (template.default_days_from_start || 0));
    return {
      ...template,
      due_date: dueDate,
    };
  });
}
