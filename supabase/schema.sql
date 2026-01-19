-- DC FSBO Transaction Manager Database Schema
-- For use with Supabase (PostgreSQL)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE user_role AS ENUM ('buyer', 'seller');
CREATE TYPE transaction_status AS ENUM ('draft', 'active', 'pending_join', 'closed');
CREATE TYPE milestone_status AS ENUM ('not_started', 'in_progress', 'complete', 'at_risk');
CREATE TYPE document_status AS ENUM ('missing', 'linked', 'pending_review');
CREATE TYPE storage_provider AS ENUM ('google_drive', 'dropbox');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    creator_role user_role NOT NULL,
    partner_role user_role,
    property_address TEXT NOT NULL,
    sale_price DECIMAL(12, 2) NOT NULL,
    is_tenanted BOOLEAN DEFAULT FALSE,
    topa_flagged BOOLEAN DEFAULT FALSE,
    invite_token TEXT UNIQUE NOT NULL,
    status transaction_status DEFAULT 'draft',
    target_settlement_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure creator and partner have opposite roles
    CONSTRAINT different_roles CHECK (
        partner_role IS NULL OR creator_role != partner_role
    )
);

-- Invitations table
CREATE TABLE public.invitations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
    email_sent_to TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    is_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- Milestones table
CREATE TABLE public.milestones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status milestone_status DEFAULT 'not_started',
    due_date DATE,
    completed_date DATE,
    depends_on UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
    is_dc_specific BOOLEAN DEFAULT FALSE,
    visible_to_buyer BOOLEAN DEFAULT TRUE,
    visible_to_seller BOOLEAN DEFAULT TRUE,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    status document_status DEFAULT 'missing',
    external_url TEXT,
    external_provider storage_provider,
    official_form_url TEXT,
    visible_to_buyer BOOLEAN DEFAULT TRUE,
    visible_to_seller BOOLEAN DEFAULT TRUE,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buyer financials table (private to buyer)
CREATE TABLE public.buyer_financials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    loan_type TEXT,
    interest_rate DECIMAL(5, 3),
    down_payment_amount DECIMAL(12, 2),
    down_payment_percent DECIMAL(5, 2),
    earnest_money_deposit DECIMAL(12, 2),
    recordation_tax DECIMAL(12, 2),
    transfer_tax DECIMAL(12, 2),
    title_insurance DECIMAL(12, 2),
    other_closing_costs DECIMAL(12, 2),
    is_first_time_buyer BOOLEAN DEFAULT FALSE,
    cash_to_close DECIMAL(12, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seller financials table (private to seller)
CREATE TABLE public.seller_financials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    existing_mortgage_balance DECIMAL(12, 2),
    other_liens DECIMAL(12, 2),
    recordation_tax DECIMAL(12, 2),
    transfer_tax DECIMAL(12, 2),
    real_estate_commission DECIMAL(12, 2),
    hoa_fees_due DECIMAL(12, 2),
    other_fees DECIMAL(12, 2),
    net_proceeds DECIMAL(12, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_transactions_creator ON public.transactions(creator_id);
CREATE INDEX idx_transactions_partner ON public.transactions(partner_id);
CREATE INDEX idx_transactions_invite_token ON public.transactions(invite_token);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_milestones_transaction ON public.milestones(transaction_id);
CREATE INDEX idx_milestones_status ON public.milestones(status);
CREATE INDEX idx_documents_transaction ON public.documents(transaction_id);
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_transaction ON public.invitations(transaction_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_financials ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Transactions policies
CREATE POLICY "Users can view their transactions" ON public.transactions
    FOR SELECT USING (
        auth.uid() = creator_id OR auth.uid() = partner_id
    );

CREATE POLICY "Users can create transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Transaction parties can update" ON public.transactions
    FOR UPDATE USING (
        auth.uid() = creator_id OR auth.uid() = partner_id
    );

-- Invitations policies
CREATE POLICY "Transaction creator can manage invitations" ON public.invitations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_id AND t.creator_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view invitation by token" ON public.invitations
    FOR SELECT USING (true);

-- Milestones policies
CREATE POLICY "Transaction parties can view milestones" ON public.milestones
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_id
            AND (t.creator_id = auth.uid() OR t.partner_id = auth.uid())
        )
    );

CREATE POLICY "Transaction parties can manage milestones" ON public.milestones
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_id
            AND (t.creator_id = auth.uid() OR t.partner_id = auth.uid())
        )
    );

-- Documents policies
CREATE POLICY "Transaction parties can view documents" ON public.documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_id
            AND (t.creator_id = auth.uid() OR t.partner_id = auth.uid())
        )
    );

CREATE POLICY "Transaction parties can manage documents" ON public.documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_id
            AND (t.creator_id = auth.uid() OR t.partner_id = auth.uid())
        )
    );

-- Buyer financials policies (only visible to buyer)
CREATE POLICY "Buyer can view own financials" ON public.buyer_financials
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Buyer can manage own financials" ON public.buyer_financials
    FOR ALL USING (auth.uid() = user_id);

-- Seller financials policies (only visible to seller)
CREATE POLICY "Seller can view own financials" ON public.seller_financials
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Seller can manage own financials" ON public.seller_financials
    FOR ALL USING (auth.uid() = user_id);

-- Functions

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at
    BEFORE UPDATE ON public.milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buyer_financials_updated_at
    BEFORE UPDATE ON public.buyer_financials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seller_financials_updated_at
    BEFORE UPDATE ON public.seller_financials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to accept invitation and join transaction
CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_token TEXT)
RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_creator_role user_role;
    v_partner_role user_role;
BEGIN
    -- Get transaction details from invitation
    SELECT t.id, t.creator_role INTO v_transaction_id, v_creator_role
    FROM public.invitations i
    JOIN public.transactions t ON t.id = i.transaction_id
    WHERE i.token = invitation_token
    AND i.is_accepted = FALSE
    AND i.expires_at > NOW();

    IF v_transaction_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired invitation';
    END IF;

    -- Determine partner role (opposite of creator)
    v_partner_role := CASE WHEN v_creator_role = 'buyer' THEN 'seller' ELSE 'buyer' END;

    -- Update transaction with partner
    UPDATE public.transactions
    SET partner_id = auth.uid(),
        partner_role = v_partner_role,
        status = 'active'
    WHERE id = v_transaction_id
    AND partner_id IS NULL;

    -- Mark invitation as accepted
    UPDATE public.invitations
    SET is_accepted = TRUE
    WHERE token = invitation_token;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
