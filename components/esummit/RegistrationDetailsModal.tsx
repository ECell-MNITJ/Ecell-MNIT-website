'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiUser, FiSmartphone, FiCalendar, FiSave, FiX, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface RegistrationDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
    user: any;
}

export default function RegistrationDetailsModal({ isOpen, onClose, onComplete, user }: RegistrationDetailsModalProps) {
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

    const initialNames = splitName(user?.user_metadata?.full_name || user?.full_name || '');

    const [formData, setFormData] = useState({
        first_name: initialNames.first,
        last_name: initialNames.last,
        phone: user?.phone || '',
        age: '',
        gender: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.first_name || !formData.last_name || !formData.phone || !formData.age || !formData.gender) {
            toast.error('Please fill in all details');
            return;
        }

        setLoading(true);
        try {
            // 1. Generate QR Code URL
            const qrData = user.id;
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrData}`;

            // 2. Combine Name
            const fullName = `${formData.first_name.trim()} ${formData.last_name.trim()}`;

            // 3. Update Profile
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    phone: formData.phone,
                    age: parseInt(formData.age),
                    gender: formData.gender,
                    qr_code_url: qrCodeUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            toast.success('Profile updated & QR Code generated!');
            onComplete();
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-1 h-6 bg-primary-golden rounded-full"></span>
                        Quick Registration
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
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
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-primary-golden focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>

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
