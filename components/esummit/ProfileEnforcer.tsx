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

        let active = true;

        if (pathname === '/esummit/login' || pathname === '/esummit/signup' || pathname === '/esummit/unauthorized') {
            return;
        }

        const runCheck = async () => {
            try {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('full_name, phone, age, gender, qr_code_url')
                    .eq('id', user.id)
                    .single();

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

                const isIncomplete = !profile.full_name || !profile.phone || !profile.age || !profile.gender || !profile.qr_code_url;
                if (isIncomplete) {
                    setIsModalOpen(true);
                }
            } catch (error) {
                if (active) console.error('Error in profile enforcer:', error);
            } finally {
                if (active) setChecking(false);
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
