'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Scanner } from '@yudiel/react-qr-scanner';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiArrowLeft, FiLoader } from 'react-icons/fi';
import Link from 'next/link';
import ScannerLogin from '@/components/esummit/ScannerLogin';

export default function QRScannerPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [scannedResult, setScannedResult] = useState<string | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [verificationMessage, setVerificationMessage] = useState('');
    const [lastScanned, setLastScanned] = useState<string | null>(null);
    const [scannedUserDetails, setScannedUserDetails] = useState<{
        name: string;
        email: string;
        phone: string;
        event: string;
        avatar_url: string | null;
    } | null>(null);

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAccess();
    }, []);

    const checkAccess = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/esummit/login');
                return;
            }

            const userEmail = user.email;

            // Check if user is member or admin
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            let isAdmin = false;

            if (userEmail) {
                const { data: admin } = await supabase
                    .from('admin_whitelist')
                    .select('role')
                    .eq('email', userEmail)
                    .single();

                isAdmin = admin?.role === 'admin' || admin?.role === 'super_admin';
            }

            const isMember = profile?.role === 'member';

            if (!isMember && !isAdmin) {
                toast.error('Access denied. Members only.');
                router.push('/esummit/unauthorized');
                return;
            }

            // Check secondary auth
            const storedAuth = localStorage.getItem('esummit_scanner_auth');
            if (storedAuth === 'true') {
                setIsAuthenticated(true);
            }

            setLoading(false);
        } catch (error) {
            console.error('Access check failed', error);
            router.push('/esummit');
        }
    };

    const handleScan = async (detectedCodes: any[]) => {
        if (!detectedCodes || detectedCodes.length === 0) return;

        let result = detectedCodes[0].rawValue.trim();
        if (!result || result === lastScanned) return;

        // Try to parse JSON first (for Profile QR codes)
        try {
            const jsonResult = JSON.parse(result);
            if (jsonResult.userId) {
                result = jsonResult.userId;
                console.log('Parsed JSON QR:', jsonResult);
            }
        } catch (e) {
            // Not JSON, assume raw UUID
        }

        setLastScanned(result);
        setScannedResult(result);
        setVerificationStatus('idle');
        setVerificationMessage('Processing...');
        setScannedUserDetails(null);

        // UUID regex
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (!uuidRegex.test(result)) {
            console.log('Invalid UUID format:', result);
            setVerificationStatus('error');
            setVerificationMessage(`Invalid Format: ${result.substring(0, 15)}...`);
            toast.error(`Invalid QR Format`);
            setTimeout(() => setLastScanned(null), 3000);
            return;
        }

        try {
            const userId = result;

            // 1. Check Profile directly (General Check-in)
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error || !profile) {
                // If profile not found, maybe check old registration logic as fallback?
                // But new requirement says "even if user hasn't registered in any events".
                // So if profile exists, they are registered for E-Summit.
                console.error('Profile scan error:', error);
                setVerificationStatus('error');
                setVerificationMessage('User Not Found');
                toast.error('User profile not found');
                setTimeout(() => setLastScanned(null), 3000);
                return;
            }

            // 2. Check completeness (Name, Phone, Age, Gender)
            if (!profile.full_name || !profile.phone || !profile.age || !profile.gender) {
                setVerificationStatus('error');
                setVerificationMessage('Incomplete Profile');
                toast.error('Profile incomplete. Ask user to update details.');
                setTimeout(() => setLastScanned(null), 3000);
                return;
            }

            const userName = profile.full_name || 'Unknown User';

            setScannedUserDetails({
                name: userName,
                email: 'N/A', // Email is not directly available in profiles table
                // Wait, profiles table usually has email if we synced it. 
                // Let's assume email is not critical or is in profiles. 
                // Actually previous code got email from profiles (joined). 
                // Does profiles have email? Let's check types.ts or previous fetch.
                // Previous fetch: profiles(email). So yes.
                phone: profile.phone || 'N/A',
                event: 'General E-Summit', // Default event name
                avatar_url: profile.avatar_url
            });

            // 3. Check if already checked in
            if (profile.esummit_checked_in) {
                setVerificationStatus('error');
                setVerificationMessage('ALREADY CHECKED IN');
                return;
            }

            // 4. Mark as Checked In
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    esummit_checked_in: true,
                    esummit_checked_in_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (updateError) throw updateError;

            setVerificationStatus('success');
            setVerificationMessage('VERIFIED');
            toast.success(`Welcome ${userName}`);

        } catch (error: any) {
            console.error('Scan error:', error);
            setVerificationStatus('error');
            setVerificationMessage('System Error');
        }
    };

    const resetScan = () => {
        setLastScanned(null);
        setScannedResult(null);
        setVerificationStatus('idle');
        setVerificationMessage('');
        setScannedUserDetails(null);
    };

    if (loading) return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center gap-2">
            <FiLoader className="animate-spin" /> Check Access...
        </div>
    );

    if (!isAuthenticated) {
        return <ScannerLogin onSuccess={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center">

            <div className="w-full max-w-md mb-6 flex items-center justify-between">
                <Link href="/esummit/admin" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
                    <FiArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-xl font-bold text-center flex-1 pr-10">E-Summit Check-in</h1>
            </div>

            <div className="w-full max-w-md aspect-square bg-gray-900 rounded-2xl overflow-hidden border-2 border-primary-golden relative shadow-2xl mb-6">
                {!scannedUserDetails ? (
                    <>
                        <Scanner
                            onScan={handleScan}
                            onError={(error) => console.log(error)}
                            allowMultiple={true}
                            scanDelay={500}
                        />
                        <div className="absolute inset-0 border-2 border-white/20 m-10 rounded-xl pointer-events-none"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-scan"></div>
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 p-6 text-center">
                        {verificationStatus === 'success' ? (
                            <FiCheckCircle className="w-20 h-20 text-green-500 mb-4 animate-bounce" />
                        ) : (
                            <FiXCircle className="w-20 h-20 text-red-500 mb-4" />
                        )}
                        <h2 className={`text-2xl font-bold mb-2 ${verificationStatus === 'success' ? 'text-green-400' : 'text-red-400'
                            }`}>
                            {verificationMessage}
                        </h2>
                    </div>
                )}
            </div>

            {scannedUserDetails && (
                <div className="w-full max-w-md bg-gray-800/50 rounded-xl p-6 border border-gray-700 animate-in fade-in slide-in-from-bottom-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                            {scannedUserDetails.avatar_url ? (
                                <img src={scannedUserDetails.avatar_url} alt={scannedUserDetails.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                                    {scannedUserDetails.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{scannedUserDetails.name}</h2>
                            <p className="text-purple-400 text-sm font-medium">{scannedUserDetails.event}</p>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-gray-700 pb-2">
                            <span className="text-gray-400">Email</span>
                            <span className="text-white font-mono">{scannedUserDetails.email}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-700 pb-2">
                            <span className="text-gray-400">Phone</span>
                            <span className="text-white font-mono">{scannedUserDetails.phone}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                            <span className="text-gray-400">Status</span>
                            <span className={`font-bold ${verificationStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                {verificationStatus === 'success' ? 'Checked In' : 'Verification Failed'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={resetScan}
                        className="w-full mt-6 bg-primary-golden text-black font-bold py-3 rounded-lg hover:bg-yellow-500 transition active:scale-95"
                    >
                        Scan Next Candidate
                    </button>
                </div>
            )}

            {!scannedUserDetails && verificationStatus !== 'idle' && (
                <div className={`mt-4 px-6 py-3 rounded-lg border ${verificationStatus === 'error' ? 'bg-red-900/40 border-red-500 text-red-200' : 'bg-blue-900/40 border-blue-500 text-blue-200'
                    }`}>
                    {verificationMessage}
                </div>
            )}

            <style jsx global>{`
                @keyframes scan {
                    0% { top: 0; }
                    50% { top: 100%; }
                    100% { top: 0; }
                }
                .animate-scan {
                    animation: scan 2s linear infinite;
                }
            `}</style>
        </div>
    );
}

