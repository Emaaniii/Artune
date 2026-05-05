// Server-side Supabase client (Server Components, Route Handlers, Server Actions).
// Auth context comes from the request cookies. Uses the publishable / anon key —
// RLS policies plus the user's JWT are what gate access.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function getSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(items) {
          // In Server Components Next forbids cookie writes — silently ignore.
          // The middleware refreshes the session on the next request.
          try {
            for (const { name, value, options } of items) {
              cookieStore.set(name, value, options);
            }
          } catch {
            /* read-only cookie context */
          }
        },
      },
    },
  );
}
