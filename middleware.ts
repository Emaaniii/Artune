// Refresh the Supabase auth session on every (non-static, non-callback) request.
//
// IMPORTANT: when the session is refreshed we must write the new cookies to
// BOTH the request (so the downstream route handler / Server Component sees
// them this turn) AND the response (so the browser receives them). If we only
// write to the response, the user gets bounced for one request after every
// refresh — see github.com/supabase/auth-helpers/discussions/4267.
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(items) {
          for (const { name, value } of items) {
            req.cookies.set(name, value);
          }
          response = NextResponse.next({ request: req });
          for (const { name, value, options } of items) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    // Skip Next internals, static files, and the K-Net callback (which arrives
    // unauthenticated and must not create or refresh a user session).
    "/((?!_next/static|_next/image|favicon.ico|images/|api/payment/callback).*)",
  ],
};
