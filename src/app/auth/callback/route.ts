import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    
    try {
      const { error, data } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error("Exchange code error:", error);
        return NextResponse.redirect(`${origin}/login?error=auth_code_error`);
      }

      if (data?.session) {
        // Successfully authenticated, redirect to home
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (err) {
      console.error("Callback error:", err);
      return NextResponse.redirect(`${origin}/login?error=auth_code_error`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=invalid_code`);
}
