-- Animals owned by users
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
