import { createClient } from "./server";

export type UserLocationRow = {
  id: string;
  user_id: string;
  city: string;
  country: string;
  weather_preferences: any | null;
};

export async function getUserLocationByUserId(userId: string): Promise<UserLocationRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_location")
    .select("id,user_id,city,country,weather_preferences")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as UserLocationRow | null;
}
