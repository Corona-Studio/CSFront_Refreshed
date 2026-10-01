# Marathon design system

CSFront uses Next.js App Router, React 19, Tailwind CSS 4 and source-owned shadcn/ui components. `/design-system` is the interactive component catalogue.

## Layers

- `src/app`: URL routes, server metadata, layouts, loading/error/404 boundaries and providers.
- `src/features`: domain pages and their query/mutation workflows.
- `src/components/ui`: shadcn primitives generated from the official registry. Add primitives with `pnpm dlx shadcn@latest add <component>`; use `@/lib/utils` for `cn`.
- `src/components/marathon`: product components built on those primitives: controls, panels, forms, data tables and the console shell.
- `src/helpers`, `src/requests`: platform/session/validation helpers and typed API contracts. API contracts do not depend on the view layer.

## Visual rules

Use `globals.css` semantic tokens (`background`, `card`, `foreground`, `muted`, `primary`, `border`) rather than vendor tokens or page-specific palettes. The light surface is ivory; the dark surface is warm charcoal. Bright amber orange marks the primary action and selected navigation. Danger, warning and success retain semantic colors.

Use square corners, thin rules, large tightly tracked headings, monospace identifiers and generous section spacing. Use `SectionHeading` to introduce marketing sections; use `Card` and `DataTable` for operations. Data tables scroll horizontally on small screens, while the console navigation becomes horizontal.

Bright amber orange `primary` is a fill, paired with `primary-foreground`. Use `primary-ink` for links and icons on ordinary surfaces; it is deep ochre in light mode and bright amber orange in dark mode. Hover surfaces use the quieter `accent` pair. Charts use independent `chart-1` through `chart-5` tokens (teal, copper, slate, violet, ochre), with lighter variants in dark mode and `chart-grid` for guides. Failed login trends use a dashed line as well as color. Do not use brand yellow for chart series on white cards. `/design-system` includes clearly labelled simulated chart data for visual review without authentication.

`Button` provides disabled/loading states. `Dialog` uses Radix focus trapping and focus restoration, prevents dismissal while confirming, and includes a labelled heading. `Form` uses React Hook Form; fields have associated labels and errors. `DataTable` distinguishes local lists from API pages, exposes sorting and respects loading/empty states. Keep API mutations in feature components.

The ASCII scene remains a client-only dynamically loaded component, with reduced-motion and GPU cleanup behavior preserved. CSS respects reduced motion globally. Theme preference and language remain compatible with existing storage keys.

## Authentication

Existing API sessions remain in IndexedDB/sessionStorage. The console layout validates the session before mounting protected children. This client gate is for navigation; the backend must continue verifying authentication and authorization on every endpoint. There are no new cookie sessions or fabricated server credentials in this migration.

## Deployment migration

Use Node.js 24 and `pnpm dev`, `pnpm build`, `pnpm start`. `vercel.json` selects the Next.js preset, installs with the frozen pnpm lockfile and resets the output directory to automatic detection. Clear old Vite output-directory settings (`dist`) in the Vercel project as well. SPA rewrite rules have been removed because App Router serves actual routes. Set `ENABLE_EXPERIMENTAL_COREPACK=1` in Vercel so the build uses the exact pnpm version specified by `packageManager`.

Rename `VITE_LX_BACKEND` to `NEXT_PUBLIC_LX_BACKEND` and `VITE_TURNSTILE_SITE_KEY` to `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in deployment settings. Both are build-time public values. Never expose `Turnstile__SecretKey`; it stays on the backend.

Environment files are ignored by Git; use `.env.example` for local setup and configure production values in Vercel before building. `.vercel/` contains local project bindings and credentials and must remain ignored.

Existing routes including `/auth/forgetPassword`, `/auth/resetPassword`, and dynamic contribution IDs are preserved. `/launcherx/download` redirects to `/lx/download`.

Run `pnpm quality` before shipping. Unit tests cover API contracts, redirect safety, avatar processing, platform detection, notification normalization, verification expiration, forms, table behavior and confirmation dialogs. Authenticated end-to-end validation still needs a test account and a running backend.
