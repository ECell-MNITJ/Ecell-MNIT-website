import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function POST(request: Request) {
    const requestUrl = new URL(request.url);
    const supabase = await createServerClient();

    await supabase.auth.signOut();

    return redirect('/login');
}
