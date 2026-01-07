import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has completed onboarding
  const { data: measurements } = await supabase
    .from("user_measurements")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: skinProfile } = await supabase
    .from("user_skin_profile")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: location } = await supabase
    .from("user_location")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  // If all data exists, redirect to outfit page
  if (measurements && skinProfile && location) {
    redirect("/outfit");
  }

  // Otherwise, redirect to onboarding
  redirect("/onboarding");
}
