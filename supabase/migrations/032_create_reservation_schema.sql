-- Migration 032: Create Reservation Schema
-- Implements tables for the Reservations module: Settings, Tables, Shifts, Reservations, Assignments.

-- ============================================================
-- 1. RESERVATION SETTINGS
-- ============================================================

CREATE TABLE public.reservation_settings (
    tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT FALSE,
    notification_email TEXT,
    total_seats INTEGER DEFAULT 0,
    total_high_chairs INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reservation_settings ENABLE ROW LEVEL SECURITY;

-- Policies
-- Owner: Full Access
CREATE POLICY "Owners can manage reservation settings" ON public.reservation_settings
    FOR ALL
    TO authenticated
    USING (tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())))
    WITH CHECK (tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())));

-- Public: Read Only (needed for booking form to check if active/restrictions)
CREATE POLICY "Public read reservation settings" ON public.reservation_settings
    FOR SELECT
    TO anon
    USING (true); -- Or restriction based on is_active if needed, but 'true' is simpler for now


-- ============================================================
-- 2. RESERVATION TABLES (The physical tables)
-- ============================================================

CREATE TABLE public.reservation_tables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    seats INTEGER NOT NULL DEFAULT 2,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reservation_tables ENABLE ROW LEVEL SECURITY;

-- Policies
-- Owner: Full Access
CREATE POLICY "Owners can manage tables" ON public.reservation_tables
    FOR ALL
    TO authenticated
    USING (tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())))
    WITH CHECK (tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())));

-- Public: Read Only (To show capacity or map if needed in future, currently minimal info needed)
-- Actually, the public form mainly needs to know total capacity or slots. 
-- But let's allow read for anon to be safe for flexible UIs.
CREATE POLICY "Public read tables" ON public.reservation_tables
    FOR SELECT
    TO anon
    USING (true);


-- ============================================================
-- 3. RESERVATION SHIFTS (Time slots configuration)
-- ============================================================

CREATE TABLE public.reservation_shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, -- e.g. "Lunch", "Dinner"
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    days_of_week INTEGER[] DEFAULT '{0,1,2,3,4,5,6}', -- 0=Sunday
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reservation_shifts ENABLE ROW LEVEL SECURITY;

-- Policies
-- Owner: Full Access
CREATE POLICY "Owners can manage shifts" ON public.reservation_shifts
    FOR ALL
    TO authenticated
    USING (tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())))
    WITH CHECK (tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())));

-- Public: Read Only (To populate time selector)
CREATE POLICY "Public read shifts" ON public.reservation_shifts
    FOR SELECT
    TO anon
    USING (is_active = TRUE);


-- ============================================================
-- 4. RESERVATIONS (The actual bookings)
-- ============================================================

CREATE TABLE public.reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    guests INTEGER NOT NULL,
    high_chairs INTEGER DEFAULT 0,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Policies
-- Owner: Full Access (View, Update status)
CREATE POLICY "Owners can manage reservations" ON public.reservations
    FOR ALL
    TO authenticated
    USING (tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())))
    WITH CHECK (tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())));

-- Public: INSERT ONLY (Create booking)
CREATE POLICY "Public create reservations" ON public.reservations
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Public: NO SELECT (Privacy). Users cannot see other reservations.


-- ============================================================
-- 5. RESERVATION ASSIGNMENTS (Linking bookings to tables)
-- ============================================================

CREATE TABLE public.reservation_assignments (
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE NOT NULL,
    table_id UUID REFERENCES public.reservation_tables(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (reservation_id, table_id)
);

ALTER TABLE public.reservation_assignments ENABLE ROW LEVEL SECURITY;

-- Policies
-- Owner: Full Access
CREATE POLICY "Owners can manage assignments" ON public.reservation_assignments
    FOR ALL
    TO authenticated
    USING (
        reservation_id IN (
            SELECT id FROM public.reservations 
            WHERE tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid()))
        )
    )
    WITH CHECK (
        reservation_id IN (
            SELECT id FROM public.reservations 
            WHERE tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid()))
        )
    );
