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
