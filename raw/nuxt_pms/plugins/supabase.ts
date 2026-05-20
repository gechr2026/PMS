// =============================================================
// Supabase client plugin (universal)
// - Runs on both server (no session yet) and client (with localStorage)
// - persistSession / autoRefreshToken are enabled only on the client
//   because they need localStorage which doesn't exist on the server.
// =============================================================
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();
    const isClient = typeof window !== 'undefined';

    const supabase: SupabaseClient = createClient(
        config.public.supabaseUrl as string,
        config.public.supabaseKey as string,
        {
            auth: {
                persistSession: isClient,
                autoRefreshToken: isClient,
                detectSessionInUrl: false,
                storageKey: 'pms-auth',
            },
        }
    );

    return {
        provide: { supabase },
    };
});
