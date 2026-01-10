import { createClient } from "@/lib/supabase/server";
import LandingPage from "@/components/LandingPage";
import Dashboard from "@/components/Dashboard";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <LandingPage />;
  }

  return <Dashboard user={user} />;
}
