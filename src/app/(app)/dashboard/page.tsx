import { createClient } from "@/lib/supabase/server";
import Dashboard from "@/components/Dashboard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return <Dashboard user={user} />;
}
