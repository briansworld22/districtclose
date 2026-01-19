// Database Types for DC FSBO Transaction Manager

export type UserRole = 'buyer' | 'seller';
export type TransactionStatus = 'draft' | 'active' | 'pending_join' | 'closed';
export type MilestoneStatus = 'not_started' | 'in_progress' | 'complete' | 'at_risk';
export type DocumentStatus = 'missing' | 'linked' | 'pending_review';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  creator_id: string;
  partner_id: string | null;
  creator_role: UserRole;
  partner_role: UserRole | null;
  property_address: string;
  sale_price: number;
  is_tenanted: boolean;
  topa_flagged: boolean;
  invite_token: string;
  status: TransactionStatus;
  target_settlement_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invitation {
  id: string;
  transaction_id: string;
  email_sent_to: string;
  token: string;
  is_accepted: boolean;
  created_at: string;
  expires_at: string;
}

export interface Milestone {
  id: string;
  transaction_id: string;
  name: string;
  description: string | null;
  status: MilestoneStatus;
  due_date: string | null;
  completed_date: string | null;
  depends_on: string | null; // milestone_id
  is_dc_specific: boolean;
  visible_to_buyer: boolean;
  visible_to_seller: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  transaction_id: string;
  name: string;
  description: string | null;
  is_required: boolean;
  status: DocumentStatus;
  external_url: string | null;
  external_provider: 'google_drive' | 'dropbox' | null;
  official_form_url: string | null;
  visible_to_buyer: boolean;
  visible_to_seller: boolean;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

// Financial data with role-based visibility
export interface BuyerFinancials {
  id: string;
  transaction_id: string;
  user_id: string;
  loan_type: string | null;
  interest_rate: number | null;
  down_payment_amount: number | null;
  down_payment_percent: number | null;
  earnest_money_deposit: number | null;
  recordation_tax: number | null;
  transfer_tax: number | null;
  title_insurance: number | null;
  other_closing_costs: number | null;
  is_first_time_buyer: boolean;
  cash_to_close: number | null;
  created_at: string;
  updated_at: string;
}

export interface SellerFinancials {
  id: string;
  transaction_id: string;
  user_id: string;
  existing_mortgage_balance: number | null;
  other_liens: number | null;
  recordation_tax: number | null;
  transfer_tax: number | null;
  real_estate_commission: number | null;
  hoa_fees_due: number | null;
  other_fees: number | null;
  net_proceeds: number | null;
  created_at: string;
  updated_at: string;
}

// Extended types with relations
export interface TransactionWithDetails extends Transaction {
  creator?: User;
  partner?: User;
  milestones?: Milestone[];
  documents?: Document[];
  buyer_financials?: BuyerFinancials;
  seller_financials?: SellerFinancials;
}

// Form Types
export interface CreateTransactionForm {
  property_address: string;
  sale_price: number;
  is_tenanted: boolean;
  creator_role: UserRole;
  target_settlement_date?: string;
}

export interface OnboardingForm {
  role: UserRole;
  property_address: string;
  sale_price: number;
  is_tenanted: boolean;
}

// DC Tax Calculation Types
export interface DCTaxCalculation {
  recordationTax: number;
  transferTax: number;
  recordationTaxRate: number;
  transferTaxRate: number;
  isFirstTimeBuyer: boolean;
  firstTimeBuyerSavings: number;
}

// Timeline View Types
export interface TimelineItem {
  milestone: Milestone;
  isVisible: boolean;
  canEdit: boolean;
}
