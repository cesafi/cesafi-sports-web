# Workspace Rules

## Architecture & Data Flow
- **Stack:** Next.js 15 (React 19), TypeScript 5+, Supabase (PostgreSQL), Tailwind CSS 4.0, Shadcn/UI, TanStack React Query v5, Zod v4, Cloudinary.
- **Data Flow Architecture:**
  1. **Client Components** → Custom Hooks (React Query)
  2. **Hooks** → Server Actions (Next.js)
  3. **Server Actions** → Service Layer (classes extending `BaseService`)
  4. **Services** → Supabase Database
- **Caching:** Leverage React Query with smart invalidation for state management.

## Adding New Entities Workflow
Whenever adding a new entity/feature, follow this strict sequence:
1. **Database**: Add table to Supabase.
2. **Types**: Regenerate `database.types.ts`.
3. **Validation**: Create Zod schemas for insert/update in `src/lib/validations/`.
4. **Service**: Implement a service class extending `BaseService` in `src/services/`.
5. **Actions**: Create Server Actions in `src/actions/` combining validation and service calls.
6. **Hooks**: Implement TanStack React Query hooks in `src/hooks/`.
7. **Components**: Build UI components utilizing Shadcn/UI and Tailwind in `src/components/`.

## Security Rules & Zod Usage
- **Validation:** ALWAYS use Zod schemas at the Server Action level to parse and validate all incoming data. Never blindly trust client inputs.
- **Authentication/Authorization:** Utilize Supabase Auth and Row-Level Security (RLS) policies. Role-Based Access is managed via middleware and route configuration.
- **Environment Variables:** Never commit sensitive credentials. Use `.env.local` for local secrets.

## Replicating CEL Components
Whenever requested to match a component from the CESAFI Esports League (CEL) reference codebase:
- Take into account EVERYTHING: colors, padding, margins, roundedness, layout structure, text sizes, and font families.
- To ensure exact matching, directly copy and paste the CEL component code into the target file, then adjust the display values (texts, icons) to fit the CESAFI Sports context. Do not try to manually recreate styles piece-by-piece when a direct copy is possible.

## Routing Updates
Whenever you create or delete a page or route in the application, ALWAYS update `src/lib/routes.ts`. You must add the path to the appropriate `PUBLIC_ROUTES` or `PROTECTED_ROUTES` arrays, and ensure you also update `ROUTE_PATTERNS` to match the exact string or the dynamic path using regex (e.g. `^\/standings(?:\/.*)?$`).
