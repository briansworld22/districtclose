# DistrictClose - DC FSBO Transaction Manager

A collaborative web application for managing For Sale By Owner (FSBO) real estate transactions in Washington, D.C. The app provides a shared environment where buyers and sellers can track milestones, manage documents, and calculate DC-specific taxes and closing costs.

## Features

- **Collaborative Transaction Management**: Both buyer and seller can access the same transaction dashboard
- **Role-Based Onboarding**: Guides users through the process based on their role (buyer/seller)
- **Transaction Timeline**: Track DC-specific milestones including:
  - HOA/Condo document delivery (3-day rescission period)
  - TOPA compliance for tenanted properties
  - Standard real estate milestones (inspection, financing, closing)
- **Document Checklist**: Required DC forms with status tracking and cloud storage integration (Google Drive, Dropbox)
- **DC Tax Calculator**:
  - Recordation Tax (1.1% ≤ $400K, 1.45% > $400K)
  - Transfer Tax (1.1% ≤ $400K, 1.45% > $400K)
  - First-time homebuyer tax benefits
- **Privacy Controls**: Role-based visibility for financial data
  - Buyer sees: Loan details, Cash-to-Close
  - Seller sees: Net Proceeds
  - Both see: Timeline, Documents, Sale Price

## Tech Stack

- **Frontend**: Next.js 16 with React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Authentication**: Supabase Auth with email/password
- **Styling**: Tailwind CSS with custom components

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/briansworld22/districtclose.git
cd districtclose
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql` in the Supabase SQL editor
   - Enable email authentication in Supabase Auth settings

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages (login, signup)
│   ├── dashboard/         # Main dashboard
│   ├── transactions/      # Transaction views (new, detail)
│   ├── join/              # Join transaction via invite
│   └── onboarding/        # New user onboarding
├── components/            # React components
│   ├── auth/              # Authentication forms
│   ├── calculator/        # DC tax calculator
│   ├── dashboard/         # Dashboard components
│   ├── documents/         # Document management
│   ├── timeline/          # Transaction timeline
│   ├── transactions/      # Transaction forms
│   └── ui/                # Base UI components
├── lib/                   # Library code
│   └── supabase/          # Supabase client configuration
├── types/                 # TypeScript types
└── utils/                 # Utility functions
    ├── cn.ts              # Class name helper
    ├── dc-taxes.ts        # DC tax calculations
    ├── documents.ts       # Document templates
    ├── invite.ts          # Invite token utilities
    └── milestones.ts      # Milestone templates
```

## Database Schema

The application uses the following main tables:
- `profiles` - User profiles
- `transactions` - Transaction records
- `invitations` - Partner invitation tokens
- `milestones` - Transaction milestones
- `documents` - Document checklist items
- `buyer_financials` - Buyer's private financial data
- `seller_financials` - Seller's private financial data

Row Level Security (RLS) is implemented for all tables to ensure data privacy.

## Privacy/Visibility Rules

| Data Point | Visible to Buyer | Visible to Seller |
|------------|------------------|-------------------|
| Sales Price/Timeline | Yes | Yes |
| Shared Documents | Yes | Yes |
| Loan Type/Interest Rate | Yes | No |
| Seller Net Proceeds | No | Yes |
| Cash-to-Close | Yes | No |

## License

This project is for demonstration purposes.

## Disclaimer

This application is not a substitute for professional legal or financial advice. Users should consult with qualified professionals for their specific real estate transactions.
