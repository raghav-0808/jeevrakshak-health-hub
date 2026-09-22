# Moving JeevRakshak to your own Supabase project

The app currently runs on the built-in Lovable Cloud backend. Switching it to your
own Supabase project is a two-part job: you connect the project, I re-point the app.

## 1. You: connect your project

In this project's settings, open the integrations/backend section and connect your
own Supabase project (you'll be asked to authorise Supabase and pick the project).
I can't do this step for you — it needs your Supabase login.

## 2. You: create the tables

Open your Supabase project's SQL editor and run `docs/own-supabase-setup.sql`
(in this repo) on a fresh database. It creates everything the app uses:

- `profiles`, `user_roles` + the `app_role` enum and `has_role()` helper
- `animals`, `vaccinations`, `medical_records`
- `cases`, `case_notes` + the `case_status` enum
- the signup trigger that fills in a profile and farmer/vet role
- row-level security policies and grants for every table
- the private `animal-photos` storage bucket and its policies

## 3. You: auth settings

In Authentication settings, enable Email sign-in and turn on auto-confirm
(so new accounts can sign in immediately, as they do today).

## 4. Me: repoint and retest

Once connected, tell me and I'll regenerate the database types, verify every
screen against the new project, and run the farmer, vet and emergency flows
end to end.

## Existing data

Accounts and rows currently in the Lovable Cloud backend do not move across
automatically. Tell me if you need the existing records exported and imported.
