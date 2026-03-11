import { createServerClient } from '@/lib/supabase/server';
import ReferralsList from '@/components/esummit/admin/ReferralsList';

export const revalidate = 0;

export default async function ReferralsAdminPage() {
    const supabase = await createServerClient();

    const { data: referrals, error } = await supabase
        .from('campus_ambassadors')
        .select(`
            *,
            profile:profiles(full_name, avatar_url),
            user_passes(payment_status)
        `)
        .order('created_at', { ascending: false });

    // 1. Get referral codes from profiles for checked-in users
    const { data: profileReferrals } = await supabase
        .from('profiles')
        .select('id, applied_referral_code')
        .eq('esummit_checked_in', true)
        .not('applied_referral_code', 'is', null);

    // 2. Get referral codes from successful passes for checked-in users
    const { data: passReferrals } = await supabase
        .from('user_passes')
        .select('user_id, applied_referral_code, profiles!inner(esummit_checked_in)')
        .eq('payment_status', 'success')
        .eq('profiles.esummit_checked_in', true)
        .not('applied_referral_code', 'is', null);

    // 3. Create a map of unique users to their "final" referral code (Hierarchy: Pass > Profile)
    const userReferralMap = new Map<string, string>();

    // First, set from profiles
    (profileReferrals || []).forEach((p: any) => {
        userReferralMap.set(p.id, p.applied_referral_code.toUpperCase());
    });

    // Then, override with pass referrals (prioritizing purchase source)
    (passReferrals || []).forEach((pr: any) => {
        userReferralMap.set(pr.user_id, pr.applied_referral_code.toUpperCase());
    });

    // 4. Count unique users per CA code
    const countsMap: Record<string, number> = {};
    userReferralMap.forEach((code) => {
        countsMap[code] = (countsMap[code] || 0) + 1;
    });

    // Transform count data for the component
    const mappedReferrals = (referrals || []).map((r: any) => ({
        ...r,
        is_active: !!r.is_active, // Ensure it's a boolean
        referral_count: countsMap[r.referral_code.toUpperCase()] || 0
    }));

    if (error) {
        console.error('Error fetching referrals:', error);
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Referrals & CA Apps</h1>
                <p className="text-gray-400">Manage Campus Ambassador applications and promotional discounts.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-[#0b132b] border border-white/10 p-6 rounded-2xl shadow-xl">
                    <div className="text-[#3b82f6] text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Ambassadors</div>
                    <div className="text-4xl font-black text-white">{referrals?.filter(r => r.profile_id).length || 0}</div>
                </div>
                <div className="bg-[#0b132b] border border-white/10 p-6 rounded-2xl shadow-xl">
                    <div className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Generic Codes</div>
                    <div className="text-4xl font-black text-white">{referrals?.filter(r => !r.profile_id).length || 0}</div>
                </div>
            </div>

            <ReferralsList initialReferrals={mappedReferrals} />

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6">
                <h3 className="text-blue-400 font-bold mb-2 uppercase tracking-wider text-sm flex items-center gap-2">
                    💡 Pro Tip
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Codes with a <span className="text-white font-bold">Custom Discount %</span> will override the global base discount set in the settings panel.
                    Leave it empty to use the standard 10% (or whatever is currently configured).
                    Generic codes do not have a linked user profile.
                </p>
            </div>
        </div >
    );
}
