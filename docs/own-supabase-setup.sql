-- JeevRakshak: full database setup for your own Supabase project.
-- Run this once in your project's SQL editor, on a fresh database.

CREATE TYPE public.app_role AS ENUM ('owner', 'vet');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text,
  village text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, village)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'village'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE WHEN COALESCE(NEW.raw_user_meta_data ->> 'role', 'owner') = 'vet'
      THEN 'vet'::public.app_role ELSE 'owner'::public.app_role END
  )
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();-- Animals owned by users
CREATE TABLE public.animals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  species text NOT NULL,
  breed text,
  sex text,
  age_years numeric,
  photo_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.animals TO authenticated;
GRANT ALL ON public.animals TO service_role;
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage own animals" ON public.animals FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Vets can view animals" ON public.animals FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'vet'));
CREATE INDEX animals_owner_idx ON public.animals(owner_id);

-- Vaccinations
CREATE TABLE public.vaccinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vaccine text NOT NULL,
  given_on date NOT NULL,
  next_due_on date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vaccinations TO authenticated;
GRANT ALL ON public.vaccinations TO service_role;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage own vaccinations" ON public.vaccinations FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Vets can view vaccinations" ON public.vaccinations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'vet'));
CREATE INDEX vaccinations_animal_idx ON public.vaccinations(animal_id);

-- Medical records
CREATE TABLE public.medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  record_date date NOT NULL,
  title text NOT NULL,
  diagnosis text,
  treatment text,
  vet_name text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_records TO authenticated;
GRANT ALL ON public.medical_records TO service_role;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage own medical records" ON public.medical_records FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Vets can view medical records" ON public.medical_records FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'vet'));
CREATE INDEX medical_records_animal_idx ON public.medical_records(animal_id);

-- Emergency / help cases
CREATE TYPE public.case_status AS ENUM ('new', 'accepted', 'in_progress', 'resolved', 'closed');

CREATE TABLE public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code text NOT NULL UNIQUE,
  reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_name text,
  reporter_phone text,
  animal_id uuid REFERENCES public.animals(id) ON DELETE SET NULL,
  species text NOT NULL,
  description text NOT NULL,
  photo_url text,
  latitude double precision,
  longitude double precision,
  address text,
  urgency text,
  ai_assessment jsonb,
  status public.case_status NOT NULL DEFAULT 'new',
  assigned_vet_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.cases TO authenticated;
GRANT ALL ON public.cases TO service_role;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reporters view own cases" ON public.cases FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id);
CREATE POLICY "Reporters create own cases" ON public.cases FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Vets view all cases" ON public.cases FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'vet'));
CREATE POLICY "Vets update cases" ON public.cases FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'vet')) WITH CHECK (public.has_role(auth.uid(), 'vet'));
CREATE INDEX cases_status_idx ON public.cases(status, created_at DESC);
CREATE INDEX cases_reporter_idx ON public.cases(reporter_id);

-- Vet notes on a case
CREATE TABLE public.case_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.case_notes TO authenticated;
GRANT ALL ON public.case_notes TO service_role;
ALTER TABLE public.case_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vets add notes" ON public.case_notes FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'vet') AND auth.uid() = author_id);
CREATE POLICY "Vets view notes" ON public.case_notes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'vet'));
CREATE POLICY "Reporters view notes on own cases" ON public.case_notes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id AND c.reporter_id = auth.uid()));
CREATE INDEX case_notes_case_idx ON public.case_notes(case_id);

-- Keep updated_at fresh
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER animals_touch BEFORE UPDATE ON public.animals
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER cases_touch BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE POLICY "Users upload own animal photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'animal-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users read own animal photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'animal-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update own animal photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'animal-photos' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'animal-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Vets read all animal photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'animal-photos' AND public.has_role(auth.uid(), 'vet'));


-- Private storage bucket for animal photos (10 MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('animal-photos', 'animal-photos', false, 10485760)
ON CONFLICT (id) DO NOTHING;
