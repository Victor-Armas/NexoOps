import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const envSchema = z.object({
  VITE_SUPABASE_URL: z.url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
});

const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = envSchema.parse(
  import.meta.env,
);

export const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);
