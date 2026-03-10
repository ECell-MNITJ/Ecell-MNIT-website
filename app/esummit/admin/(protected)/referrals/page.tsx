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

    // Transform count data for the component
    const mappedReferrals = (referrals || []).map((r: any) => ({
        ...r,
        is_active: !!r.is_active, // Ensure it's a boolean
        referral_count: r.user_passes?.filter((p: any) => p.payment_status === 'success').length || 0
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
