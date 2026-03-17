'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiUser, FiSmartphone, FiCalendar, FiSave, FiX, FiInfo, FiBriefcase, FiBookOpen, FiUpload, FiFileText, FiUserPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface RegistrationDetailsModalProps {
    isOpen: boolean;
    isMandatory?: boolean;
    onClose: () => void;
    onComplete: () => void;
    user: any;
    profile?: any;
}

export default function RegistrationDetailsModal({ isOpen, isMandatory = false, onClose, onComplete, user, profile }: RegistrationDetailsModalProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    // Helper to split full_name if available
    const splitName = (fullName: string) => {
        const parts = fullName.split(' ');
        if (parts.length > 1) {
            return { first: parts[0], last: parts.slice(1).join(' ') };
        }
        return { first: fullName, last: '' };
    };

    const initialNames = splitName(user?.user_metadata?.full_name || user?.full_name || profile?.full_name || '');

    const [formData, setFormData] = useState({
        first_name: initialNames.first,
        last_name: initialNames.last,
        phone: profile?.phone || user?.phone || '',
        age: profile?.age || '',
        gender: profile?.gender || '',
        user_type: profile?.user_type || '',
        college_name: profile?.college_name || '',
        company_name: profile?.company_name || '',
        referral_code: ''
    });


    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.first_name || !formData.last_name || !formData.phone || !formData.age || !formData.gender || !formData.user_type) {
            toast.error('Please fill in all required details');
            return;
        }

        if (formData.user_type === 'Student' && !formData.college_name) {
            toast.error('Please enter your college name');
            return;
        }

        if (formData.user_type === 'Founder' && !formData.company_name) {
            toast.error('Please enter your company name');
            return;
        }


        if (!/^\d{10}$/.test(formData.phone)) {
            toast.error('Phone number must be exactly 10 digits');
            return;
        }

        setLoading(true);
        console.log('Starting profile update for user:', user?.id);
        console.log('Form data:', formData);

        let updatePayload: any = {};

        try {
            if (!user?.id) {
                throw new Error('User session not found. Please log in again.');
            }

            // Move referral validation to the top for immediate feedback
            if (formData.referral_code.trim()) {
                const searchCode = formData.referral_code.trim().toUpperCase();
                console.log('Step 1: Validating referral code:', searchCode);
                
                const { data: ca, error: caError } = await supabase
                    .from('campus_ambassadors')
                    .select('referral_code')
                    .eq('referral_code', searchCode)
                    .maybeSingle(); // maybeSingle is better for "might not exist"
                
                if (caError) {
                    console.error('CRITICAL: Referral validation query FAILED');
                    console.error('Error details:', caError);
                    toast.error(`Database Error: ${caError.message || 'Could not validate referral code'}`);
                    setLoading(false);
                    return;
                }

                if (ca) {
                    console.log('Referral code matched:', ca.referral_code);
                    updatePayload.applied_referral_code = ca.referral_code;
                } else {
                    console.warn('Referral code NOT FOUND:', searchCode);
                    toast.error('Invalid Referral ID. Please enter a valid one or leave it blank.');
                    setLoading(false);
                    return; // Block submission
                }
            } else {
                console.log('Step 1: No referral code entered');
            }


            // 3. Generate QR Code URL
            console.log('Step 3: Generating QR payload');
            const qrData = user.id;
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrData}`;

            // 4. Combine Name
            const fullName = `${formData.first_name.trim()} ${formData.last_name.trim()}`;

            // 5. Build Update Payload
            updatePayload = {
                ...updatePayload,
                full_name: fullName,
                phone: formData.phone,
                age: parseInt(formData.age),
                gender: formData.gender,
                user_type: formData.user_type,
                qr_code_url: qrCodeUrl,
                updated_at: new Date().toISOString()
            };

            if (formData.user_type === 'Student') {
                updatePayload.college_name = formData.college_name;
            } else if (formData.user_type === 'Founder') {
                updatePayload.company_name = formData.company_name;
            }

            console.log('Step 4: Updating profile in DB with payload:', updatePayload);
            const { error: profileError } = await supabase
                .from('profiles')
                .update(updatePayload)
                .eq('id', user.id);

            if (profileError) {
                console.error('Supabase update error details:', profileError);
                throw profileError;
            }

            console.log('Profile update confirmed by DB!');
            toast.success('Profile updated & QR Code generated!');
            onComplete();
        } catch (error: any) {
            // Enhanced logging that won't show as empty object in most overlays
            const errorMsg = error.message || error.error_description || 'Unknown error occurred';
            const errorCode = error.code || 'NO_CODE';
            
            console.error('CRITICAL: Profile Save Failed');
            console.error('Message:', errorMsg);
            console.error('Code:', errorCode);
            console.error('Full details:', JSON.parse(JSON.stringify(error))); // Try to force enumeration
            console.error('Original Error Object:', error);

            toast.error(`Save Failed: ${errorMsg} (${errorCode})`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-1 h-6 bg-primary-golden rounded-full"></span>
                        Quick Registration
                    </h2>
                    {!isMandatory && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="p-6">
                    <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl mb-6 flex gap-3">
                        <FiInfo className="text-blue-400 w-5 h-5 shrink-0 mt-0.5" />
                        <p className="text-gray-300 text-sm">
                            Please provide your details. We need this to generate your unique Entry QR Code.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">First Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-primary-golden focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                    placeholder="Jane"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Last Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-primary-golden focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        {!profile?.phone && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Phone Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                        <FiSmartphone />
                                    </div>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setFormData({ ...formData, phone: val })
                                        }}
                                        pattern="\d{10}"
                                        title="Phone number must be exactly 10 digits"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-primary-golden focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                        placeholder="9876543210"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Age</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <FiCalendar />
                                </div>
                                <input
                                    type="number"
                                    required
                                    min="10"
                                    max="100"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-primary-golden focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                    placeholder="20"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Gender</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                        <FiUser />
                                    </div>
                                    <select
                                        required
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-primary-golden focus:border-transparent outline-none transition-all placeholder:text-gray-600 appearance-none"
                                    >
                                        <option value="" disabled>Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">User Type</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                        <FiBriefcase />
                                    </div>
                                    <select
                                        required
                                        value={formData.user_type}
                                        onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-primary-golden focus:border-transparent outline-none transition-all placeholder:text-gray-600 appearance-none"
                                    >
                                        <option value="" disabled>Select Type</option>
                                        <option value="Student">Student</option>
                                        <option value="Founder">Founder</option>
                                        <option value="Investor">Investor</option>
                                        <option value="Visitor">Visitor</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {formData.user_type === 'Student' && (
                            <div className="animate-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">College Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                        <FiBookOpen />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={formData.college_name}
                                        onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-primary-golden focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                        placeholder="MNIT Jaipur"
                                    />
                                </div>
                            </div>
                        )}

                        {formData.user_type === 'Founder' && (
                            <div className="animate-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Company Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                        <FiBriefcase />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={formData.company_name}
                                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-primary-golden focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                        placeholder="Startup Inc."
                                    />
                                </div>
                            </div>
                        )}

                        <div className="border-t border-gray-800 pt-4 mt-2">
                            <label className="text-sm font-medium text-gray-400 mb-1.5 ml-1 flex items-center gap-2">
                                Referral Code <span className="text-[10px] text-gray-600 font-bold uppercase">(Optional)</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <FiUserPlus className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={formData.referral_code}
                                    onChange={(e) => setFormData({ ...formData, referral_code: e.target.value.toUpperCase() })}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-primary-golden focus:border-transparent outline-none transition-all placeholder:text-gray-600 font-mono tracking-widest uppercase"
                                    placeholder="CA-1234"
                                />
                            </div>
                            <p className="text-[10px] text-gray-500 mt-2 ml-1">
                                If you were referred by a Campus Ambassador, enter their code here.
                            </p>
                        </div>


                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-primary-golden to-yellow-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-yellow-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <FiSave className="w-5 h-5" />
                                        Save & Get QR Code
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
