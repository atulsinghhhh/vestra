"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (error) {
        router.replace(
          `/login?error=${encodeURIComponent(
            errorDescription || error
          )}`
        );
        return;
      }

      const { error: sessionError } =
        await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

      if (sessionError) {
        router.replace(
          `/login?error=${encodeURIComponent(
            sessionError.message
          )}`
        );
        return;
      }

      router.replace("/login");
    };

    handleCallback();
  }, []);

  return <p>Confirming your email…</p>;
}
