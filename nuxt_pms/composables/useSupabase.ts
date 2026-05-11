// =============================================================
// useSupabase — typed accessor for the shared Supabase client
// (provided by plugins/supabase.ts on both server and client)
// =============================================================
import type { SupabaseClient } from '@supabase/supabase-js';

export const useSupabase = (): SupabaseClient => {
    const { $supabase } = useNuxtApp();
    if (!$supabase) {
        throw new Error('Supabase client not initialised. Make sure plugins/supabase.ts is loaded.');
    }
    return $supabase as SupabaseClient;
};
