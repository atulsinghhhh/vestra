import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";
    const error = searchParams.get("error");
    const error_description = searchParams.get("error_description");

    if (error) {
         return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error_description || error)}`, request.url));
    }

    if (code) {
        const supabase = await createClient();
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

        if (!sessionError) {
            // Email verified, redirect to home or next param
            return NextResponse.redirect(new URL(next, request.url));
        } else {
             return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(sessionError.message)}`, request.url));
        }
    }

  // No code and no error, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
}
