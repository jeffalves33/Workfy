
-- ============================================
-- WORKFY DATABASE SCHEMA - FULL MVP
-- ============================================

-- 0) Extensions
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 1) ENUMs
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.space_type AS ENUM ('MEETING_ROOM', 'OFFICE', 'CLINIC', 'COWORKING', 'STUDIO', 'TRAINING_ROOM');
CREATE TYPE public.verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE public.reservation_status AS ENUM ('PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'REJECTED');
CREATE TYPE public.payment_status AS ENUM ('WAITING_PIX', 'PROOF_SUBMITTED', 'CONFIRMED', 'REJECTED', 'REFUNDED');
CREATE TYPE public.document_type AS ENUM ('ID', 'PROOF', 'ALVARA', 'OTHER');
CREATE TYPE public.document_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE public.payout_status AS ENUM ('PENDING', 'SENT');
CREATE TYPE public.contract_status AS ENUM ('DRAFT', 'ACCEPTED', 'VOID');

-- 2) Base tables

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  cpf_cnpj TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- venues
CREATE TABLE public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT '',
  zip_code TEXT,
  lat NUMERIC,
  lng NUMERIC,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- spaces
CREATE TABLE public.spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type public.space_type NOT NULL DEFAULT 'MEETING_ROOM',
  description TEXT NOT NULL DEFAULT '',
  capacity INT NOT NULL DEFAULT 1,
  area_m2 NUMERIC,
  base_price_cents INT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  min_duration_min INT NOT NULL DEFAULT 60,
  cleaning_fee_cents INT NOT NULL DEFAULT 0,
  rules TEXT,
  cancellation_policy TEXT,
  verification_status public.verification_status NOT NULL DEFAULT 'PENDING',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;

-- space_photos
CREATE TABLE public.space_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);
ALTER TABLE public.space_photos ENABLE ROW LEVEL SECURITY;

-- amenities
CREATE TABLE public.amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL
);
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;

-- space_amenities
CREATE TABLE public.space_amenities (
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE NOT NULL,
  amenity_id UUID REFERENCES public.amenities(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (space_id, amenity_id)
);
ALTER TABLE public.space_amenities ENABLE ROW LEVEL SECURITY;

-- space_opening_hours
CREATE TABLE public.space_opening_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL
);
ALTER TABLE public.space_opening_hours ENABLE ROW LEVEL SECURITY;

-- availability_blocks (blocked times)
CREATE TABLE public.availability_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;

-- reservations (with overlap exclusion)
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE NOT NULL,
  tenant_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status public.reservation_status NOT NULL DEFAULT 'PENDING_PAYMENT',
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  attendees_count INT NOT NULL DEFAULT 1,
  notes TEXT,
  subtotal_cents INT NOT NULL DEFAULT 0,
  platform_fee_cents INT NOT NULL DEFAULT 0,
  total_cents INT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Prevent overlapping active reservations on the same space
  EXCLUDE USING gist (
    space_id WITH =,
    tstzrange(start_at, end_at) WITH &&
  ) WHERE (status NOT IN ('CANCELLED', 'REJECTED'))
);
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  method TEXT NOT NULL DEFAULT 'PIX_MANUAL',
  status public.payment_status NOT NULL DEFAULT 'WAITING_PIX',
  pix_key TEXT,
  pix_copy_paste TEXT,
  proof_url TEXT,
  confirmed_by_admin_id UUID REFERENCES auth.users(id),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- payouts
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  host_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount_cents INT NOT NULL,
  status public.payout_status NOT NULL DEFAULT 'PENDING',
  due_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE NOT NULL,
  uploader_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doc_type public.document_type NOT NULL,
  file_url TEXT NOT NULL,
  status public.document_status NOT NULL DEFAULT 'PENDING',
  reviewed_by_admin_id UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- contracts
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  status public.contract_status NOT NULL DEFAULT 'DRAFT',
  version TEXT NOT NULL DEFAULT 'v1',
  pdf_url TEXT,
  accepted_at TIMESTAMPTZ,
  accepted_ip TEXT,
  accepted_user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- conversations
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES public.spaces(id) ON DELETE SET NULL,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- conversation_participants
CREATE TABLE public.conversation_participants (
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_read_at TIMESTAMPTZ,
  PRIMARY KEY (conversation_id, user_id)
);
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- favorites
CREATE TABLE public.favorites (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, space_id)
);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- audit_log
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 3) Helper functions (SECURITY DEFINER to avoid RLS recursion)

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

CREATE OR REPLACE FUNCTION public.is_space_owner(_space_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.spaces WHERE id = _space_id AND owner_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.is_venue_owner(_venue_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.venues WHERE id = _venue_id AND owner_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conv_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = _conv_id AND user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.get_reservation_tenant(_reservation_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_user_id FROM public.reservations WHERE id = _reservation_id
$$;

CREATE OR REPLACE FUNCTION public.get_reservation_space_owner(_reservation_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.owner_id FROM public.reservations r
  JOIN public.spaces s ON s.id = r.space_id
  WHERE r.id = _reservation_id
$$;

-- 4) Triggers for updated_at

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_venues_updated_at BEFORE UPDATE ON public.venues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_spaces_updated_at BEFORE UPDATE ON public.spaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 5) Auto-create profile on signup

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6) RLS Policies

-- profiles: public read, own update
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- user_roles: public read, admin manage
CREATE POLICY "Anyone can view roles" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manages roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- venues: public read, authenticated create, owner manage
CREATE POLICY "Anyone can view venues" ON public.venues FOR SELECT USING (true);
CREATE POLICY "Authenticated create venues" ON public.venues FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner updates venue" ON public.venues FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner deletes venue" ON public.venues FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- spaces: public read, owner manage
CREATE POLICY "Anyone can view active spaces" ON public.spaces FOR SELECT USING (true);
CREATE POLICY "Owner creates space" ON public.spaces FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner updates space" ON public.spaces FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner deletes space" ON public.spaces FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- space_photos: public read, space owner manage
CREATE POLICY "Anyone views photos" ON public.space_photos FOR SELECT USING (true);
CREATE POLICY "Owner manages photos" ON public.space_photos FOR INSERT TO authenticated WITH CHECK (public.is_space_owner(space_id));
CREATE POLICY "Owner updates photos" ON public.space_photos FOR UPDATE TO authenticated USING (public.is_space_owner(space_id));
CREATE POLICY "Owner deletes photos" ON public.space_photos FOR DELETE TO authenticated USING (public.is_space_owner(space_id));

-- amenities: public read
CREATE POLICY "Anyone views amenities" ON public.amenities FOR SELECT USING (true);
CREATE POLICY "Admin manages amenities" ON public.amenities FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- space_amenities: public read, space owner manage
CREATE POLICY "Anyone views space amenities" ON public.space_amenities FOR SELECT USING (true);
CREATE POLICY "Owner manages space amenities" ON public.space_amenities FOR INSERT TO authenticated WITH CHECK (public.is_space_owner(space_id));
CREATE POLICY "Owner deletes space amenities" ON public.space_amenities FOR DELETE TO authenticated USING (public.is_space_owner(space_id));

-- space_opening_hours: public read, space owner manage
CREATE POLICY "Anyone views hours" ON public.space_opening_hours FOR SELECT USING (true);
CREATE POLICY "Owner manages hours" ON public.space_opening_hours FOR INSERT TO authenticated WITH CHECK (public.is_space_owner(space_id));
CREATE POLICY "Owner updates hours" ON public.space_opening_hours FOR UPDATE TO authenticated USING (public.is_space_owner(space_id));
CREATE POLICY "Owner deletes hours" ON public.space_opening_hours FOR DELETE TO authenticated USING (public.is_space_owner(space_id));

-- availability_blocks
CREATE POLICY "Anyone views blocks" ON public.availability_blocks FOR SELECT USING (true);
CREATE POLICY "Owner manages blocks" ON public.availability_blocks FOR INSERT TO authenticated WITH CHECK (public.is_space_owner(space_id));
CREATE POLICY "Owner deletes blocks" ON public.availability_blocks FOR DELETE TO authenticated USING (public.is_space_owner(space_id));

-- reservations: tenant sees own, space owner sees theirs, admin sees all
CREATE POLICY "View own reservations" ON public.reservations FOR SELECT TO authenticated
  USING (tenant_user_id = auth.uid() OR public.is_space_owner(space_id) OR public.is_admin());
CREATE POLICY "Create reservation" ON public.reservations FOR INSERT TO authenticated
  WITH CHECK (tenant_user_id = auth.uid());
CREATE POLICY "Update own reservation" ON public.reservations FOR UPDATE TO authenticated
  USING (tenant_user_id = auth.uid() OR public.is_space_owner(space_id) OR public.is_admin());

-- payments: tenant + admin
CREATE POLICY "View payments" ON public.payments FOR SELECT TO authenticated
  USING (public.get_reservation_tenant(reservation_id) = auth.uid() OR public.is_admin() OR public.get_reservation_space_owner(reservation_id) = auth.uid());
CREATE POLICY "Create payment" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (public.get_reservation_tenant(reservation_id) = auth.uid());
CREATE POLICY "Update payment" ON public.payments FOR UPDATE TO authenticated
  USING (public.get_reservation_tenant(reservation_id) = auth.uid() OR public.is_admin());

-- payouts: host + admin
CREATE POLICY "View payouts" ON public.payouts FOR SELECT TO authenticated
  USING (host_user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Admin manages payouts" ON public.payouts FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin updates payouts" ON public.payouts FOR UPDATE TO authenticated USING (public.is_admin());

-- documents: uploader + admin
CREATE POLICY "View documents" ON public.documents FOR SELECT TO authenticated
  USING (uploader_user_id = auth.uid() OR public.is_admin() OR public.is_space_owner(space_id));
CREATE POLICY "Upload documents" ON public.documents FOR INSERT TO authenticated
  WITH CHECK (uploader_user_id = auth.uid());
CREATE POLICY "Update documents" ON public.documents FOR UPDATE TO authenticated
  USING (uploader_user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Delete documents" ON public.documents FOR DELETE TO authenticated
  USING (uploader_user_id = auth.uid());

-- contracts: tenant + host + admin
CREATE POLICY "View contracts" ON public.contracts FOR SELECT TO authenticated
  USING (public.get_reservation_tenant(reservation_id) = auth.uid() OR public.get_reservation_space_owner(reservation_id) = auth.uid() OR public.is_admin());
CREATE POLICY "Create contracts" ON public.contracts FOR INSERT TO authenticated
  WITH CHECK (public.get_reservation_tenant(reservation_id) = auth.uid());
CREATE POLICY "Update contracts" ON public.contracts FOR UPDATE TO authenticated
  USING (public.get_reservation_tenant(reservation_id) = auth.uid() OR public.is_admin());

-- conversations: participants only
CREATE POLICY "View conversations" ON public.conversations FOR SELECT TO authenticated
  USING (public.is_conversation_participant(id) OR public.is_admin());
CREATE POLICY "Create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (true);

-- conversation_participants
CREATE POLICY "View participants" ON public.conversation_participants FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_conversation_participant(conversation_id) OR public.is_admin());
CREATE POLICY "Add self as participant" ON public.conversation_participants FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Remove self" ON public.conversation_participants FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- messages: conversation participants only
CREATE POLICY "View messages" ON public.messages FOR SELECT TO authenticated
  USING (public.is_conversation_participant(conversation_id) OR public.is_admin());
CREATE POLICY "Send messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND public.is_conversation_participant(conversation_id));

-- favorites: own only
CREATE POLICY "View own favorites" ON public.favorites FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Add favorite" ON public.favorites FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Remove favorite" ON public.favorites FOR DELETE TO authenticated USING (user_id = auth.uid());

-- audit_log: admin only read, system insert
CREATE POLICY "Admin views audit log" ON public.audit_log FOR SELECT TO authenticated USING (public.is_admin());

-- 7) Seed amenities
INSERT INTO public.amenities (code, label) VALUES
  ('wifi', 'Wi-Fi'),
  ('monitor', 'Monitor/TV'),
  ('coffee', 'Café'),
  ('air_conditioning', 'Ar-condicionado'),
  ('parking', 'Estacionamento'),
  ('printer', 'Impressora'),
  ('projector', 'Projetor'),
  ('whiteboard', 'Quadro branco'),
  ('kitchen', 'Cozinha'),
  ('reception', 'Recepção'),
  ('security', 'Segurança 24h'),
  ('accessibility', 'Acessibilidade');

-- 8) Storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'uploads');
CREATE POLICY "Anyone can view uploads" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY "Users can update own uploads" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own uploads" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
