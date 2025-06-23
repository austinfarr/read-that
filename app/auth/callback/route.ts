import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const originalOrigin = searchParams.get("origin");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to the original origin (where the user started the login)
      const redirectUrl = originalOrigin
        ? `${originalOrigin}${next}`
        : `${new URL(request.url).origin}${next}`;
      const response = NextResponse.redirect(redirectUrl);

      // Force cache refresh to ensure client-side auth state syncs
      response.headers.set(
        "Cache-Control",
        "no-cache, no-store, max-age=0, must-revalidate"
      );
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");

      return response;
    }
  }

  // Return the user to an error page with instructions
  const errorOrigin = originalOrigin || new URL(request.url).origin;
  return NextResponse.redirect(`${errorOrigin}/auth/auth-code-error`);
}
