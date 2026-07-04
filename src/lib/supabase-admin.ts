import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// 관리자 전용 클라이언트: service_role 키로 RLS를 우회합니다.
// 반드시 'use server' 서버 액션/서버 컴포넌트에서만 호출하세요. 클라이언트 번들에 절대 노출되면 안 됩니다.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
