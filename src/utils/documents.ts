import type { DocumentStatus } from '@/types/database';

/**
 * DC Required Forms and Documents
 */
export interface DocumentTemplate {
  name: string;
  description: string;
  is_required: boolean;
  official_form_url: string | null;
  visible_to_buyer: boolean;
  visible_to_seller: boolean;
}

export const DC_REQUIRED_DOCUMENTS: DocumentTemplate[] = [
  {
    name: 'GCAAR Sales Contract',
    description: 'Greater Capital Area Association of Realtors Residential Sales Contract',
    is_required: true,
    official_form_url: 'https://www.gcaar.com/forms',
    visible_to_buyer: true,
    visible_to_seller: true,
  },
  {
    name: 'DC Residential Disclosure',
    description: 'District of Columbia Residential Real Property Seller Disclosure Statement',
    is_required: true,
    official_form_url: 'https://dcra.dc.gov/page/seller-disclosure',
    visible_to_buyer: true,
    visible_to_seller: true,
  },
  {
    name: 'Lead-Based Paint Disclosure',
    description: 'Federal Lead-Based Paint Disclosure (required for homes built before 1978)',
    is_required: true,
    official_form_url: 'https://www.epa.gov/lead/sellers-disclosure-requirements-sales',
    visible_to_buyer: true,
    visible_to_seller: true,
  },
  {
    name: 'HOA/Condo Resale Package',
    description: 'HOA or Condominium Association resale documents (if applicable)',
    is_required: false,
    official_form_url: null,
    visible_to_buyer: true,
    visible_to_seller: true,
  },
  {
    name: 'Title Commitment',
    description: 'Title insurance commitment from title company',
    is_required: true,
    official_form_url: null,
    visible_to_buyer: true,
    visible_to_seller: true,
  },
  {
    name: 'Property Survey',
    description: 'Property survey or survey affidavit',
    is_required: false,
    official_form_url: null,
    visible_to_buyer: true,
    visible_to_seller: true,
  },
  {
    name: 'Home Inspection Report',
    description: 'Professional home inspection report',
    is_required: false,
    official_form_url: null,
    visible_to_buyer: true,
    visible_to_seller: true,
  },
  {
    name: 'Termite/Pest Inspection',
    description: 'Wood-destroying insect inspection report',
    is_required: false,
    official_form_url: null,
    visible_to_buyer: true,
    visible_to_seller: true,
  },
  {
    name: 'Appraisal Report',
    description: 'Property appraisal from lender-approved appraiser',
    is_required: false,
    official_form_url: null,
    visible_to_buyer: true,
    visible_to_seller: false, // Buyer-specific
  },
  {
    name: 'Loan Estimate',
    description: 'Lender loan estimate document',
    is_required: false,
    official_form_url: null,
    visible_to_buyer: true,
    visible_to_seller: false, // Buyer-specific
  },
  {
    name: 'Closing Disclosure',
    description: 'Final closing disclosure from lender/title company',
    is_required: true,
    official_form_url: null,
    visible_to_buyer: true,
    visible_to_seller: true,
  },
  {
    name: 'Settlement Statement (HUD-1/ALTA)',
    description: 'Final settlement statement showing all transaction costs',
    is_required: true,
    official_form_url: null,
    visible_to_buyer: true,
    visible_to_seller: true,
  },
];

/**
 * TOPA-specific documents for tenanted properties
 */
export const TOPA_DOCUMENTS: DocumentTemplate[] = [
  {
    name: 'TOPA Notice of Sale',
    description: 'DC TOPA: Official notice of sale to tenant(s)',
    is_required: true,
    official_form_url: 'https://dhcd.dc.gov/service/tenant-opportunity-purchase-act-topa',
    visible_to_buyer: true,
    visible_to_seller: true,
  },
  {
    name: 'Tenant Statement of Interest',
    description: 'DC TOPA: Tenant response to notice (if submitted)',
    is_required: false,
    official_form_url: null,
    visible_to_buyer: true,
    visible_to_seller: true,
  },
  {
    name: 'TOPA Waiver',
    description: 'DC TOPA: Tenant waiver of purchase rights',
    is_required: false,
    official_form_url: null,
    visible_to_buyer: true,
    visible_to_seller: true,
  },
];

/**
 * Get status color for document
 */
export function getDocumentStatusColor(status: DocumentStatus): string {
  switch (status) {
    case 'linked':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending_review':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'missing':
    default:
      return 'bg-red-100 text-red-800 border-red-200';
  }
}

/**
 * Get status label for document
 */
export function getDocumentStatusLabel(status: DocumentStatus): string {
  switch (status) {
    case 'linked':
      return 'Linked';
    case 'pending_review':
      return 'Pending Review';
    case 'missing':
    default:
      return 'Missing';
  }
}
