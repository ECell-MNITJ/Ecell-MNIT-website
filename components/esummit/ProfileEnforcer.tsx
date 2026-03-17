'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import RegistrationDetailsModal from './RegistrationDetailsModal';
import { usePathname } from 'next/navigation';

export default function ProfileEnforcer({ user }: { user: any }) {
    const supabase = createClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);
    const pathname = usePathname();

    useEffect(() => {
        if (!user) return;

        let active = true;

        if (pathname === '/esummit/login' || pathname === '/esummit/signup' || pathname === '/esummit/unauthorized') {
            return;
        }

        const runCheck = async () => {
            try {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single() as any;

                if (!active) return;

                if (error) {
                    if (error.code === 'PGRST116') {
                        setIsModalOpen(true);
                        return;
                    }
                    console.error('Error checking profile:', error);
                    return;
                }

                if (!profile) return;
                setProfileData(profile);

                const hasBasicDetails = profile.full_name && profile.phone && profile.age && profile.gender && profile.qr_code_url;
                const hasUserTypeDetails = !!profile.user_type;
                
                if (!hasBasicDetails || !hasUserTypeDetails) {
                    setIsModalOpen(true);
                }
            } catch (error) {
                if (active) console.error('Error in profile enforcer:', error);
            }
        };

        runCheck();

        return () => {
            active = false;
        };
    }, [user, pathname]);

    const handleComplete = () => {
        setIsModalOpen(false);
        // Optionally refresh or just let the user proceed
    };

    if (!user) return null;

    return (
        <RegistrationDetailsModal
            isOpen={isModalOpen}
            isMandatory={true}
            onClose={() => {
                // Strictly enforced: do not allow closing
            }}
            onComplete={handleComplete}
            user={user}
            profile={profileData}
        />
    );
}
