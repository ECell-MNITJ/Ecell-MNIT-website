'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import RegistrationDetailsModal from './RegistrationDetailsModal';
import { usePathname } from 'next/navigation';

export default function ProfileEnforcer({ user }: { user: any }) {
    const supabase = createClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [checking, setChecking] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        if (!user) return;

        // Skip check on unauthorized or login pages to avoid loops or annoyance
        if (pathname === '/esummit/login' || pathname === '/esummit/signup' || pathname === '/esummit/unauthorized') {
            return;
        }

        checkProfile();
    }, [user, pathname]);

    const checkProfile = async () => {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('full_name, phone, age, gender, qr_code_url')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error checking profile:', error);
                return;
            }

            if (!profile) return;

            // Check if any required field is missing
            const isIncomplete = !profile.full_name || !profile.phone || !profile.age || !profile.gender || !profile.qr_code_url;

            if (isIncomplete) {
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error('Error in profile enforcer:', error);
        } finally {
            setChecking(false);
        }
    };

    const handleComplete = () => {
        setIsModalOpen(false);
        // Optionally refresh or just let the user proceed
    };

    if (!user) return null;

    return (
        <RegistrationDetailsModal
            isOpen={isModalOpen}
            onClose={() => {
                // Determine if we should allow closing.
                // If it's strictly enforced, maybe don't allow close?
                // For now, allow close but it might pop up again on navigation.
                setIsModalOpen(false);
            }}
            onComplete={handleComplete}
            user={user}
        />
    );
}
