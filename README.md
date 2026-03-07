# The Specialist – Appointment Scheduler (MVP)

Production-minded Expo + Supabase appointment scheduler with strict modular architecture.

## Tech stack

- React Native (Expo) + Expo Router
- TypeScript strict mode
- Supabase (Auth + Database + RLS)
- React Query
- AsyncStorage (Supabase session persistence)
- @nkzw/create-context-hook
- expo-haptics
- React Hook Form + Zod

## Folder structure

```text
app/
   _layout.tsx
   index.tsx
   (auth)/
      _layout.tsx
      sign-in.tsx
      sign-up.tsx
   (client)/
      _layout.tsx
      services.tsx
      book.tsx
      appointments.tsx
   (admin)/
      _layout.tsx
      schedule.tsx
      services.tsx
      availability.tsx
constants/
   query-keys.ts
   roles.ts
   theme.ts
features/
   auth/
      auth.context.tsx
      auth.service.ts
   services/
      hooks/useServices.ts
      services.service.ts
   bookings/
      hooks/useAppointments.ts
      bookings.service.ts
   admin/
      hooks/useAdminSchedule.ts
      admin.service.ts
   components/
      Button.tsx
      Card.tsx
      EmptyState.tsx
      ErrorState.tsx
      Input.tsx
      LoadingSpinner.tsx
      ScreenWrapper.tsx
      SkeletonCard.tsx
hooks/
   useHapticFeedback.ts
lib/
   date.ts
   errors.ts
   providers.tsx
   query-client.ts
   supabase.ts
schemas/
   admin.schema.ts
   auth.schema.ts
   booking.schema.ts
types/
   domain.ts
   supabase.ts
supabase/sql/
   01_schema.sql
   02_rls_policies.sql
   03_rpc_booking.sql
```

## Security and integrity

- All data access is in service layer files (no direct Supabase calls in JSX)
- RLS enabled on all public tables
- Role-based policies for admin/client access
- Booking performed via secure RPC (`book_appointment`) with overlap checks
- DB-level unique constraint on `(service_id, appointment_date, start_time)`

## Setup

1. Install dependencies

```bash
npm install
```

2. Create `.env` with:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Apply SQL in order inside Supabase SQL editor:

- `supabase/sql/01_schema.sql`
- `supabase/sql/02_rls_policies.sql`
- `supabase/sql/03_rpc_booking.sql`

4. Run app

```bash
npm run start
```

## Auth flow

- Email/password sign-up and sign-in
- Verification handled by Supabase email confirmation
- Session restored automatically from AsyncStorage
- Role resolved from `public.users` and used for route guards
- Sign-out clears Supabase auth cache from AsyncStorage

## React Query hooks

- `useServices()`
- `useAppointments(userId)`
- `useAdminSchedule(date, weekRange)`
- Booking/admin mutations invalidate relevant query keys

## Booking logic

- Slot generation in `features/bookings/bookings.service.ts`
- Reads weekday availability, splits by service duration
- Removes past/overlapping slots
- Final conflict protection is always enforced in RPC (server-side)
