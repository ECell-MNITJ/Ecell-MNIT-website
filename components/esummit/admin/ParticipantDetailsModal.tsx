'use client';

import { FiX, FiUser, FiSmartphone, FiCalendar, FiMail, FiMapPin, FiBriefcase, FiBookOpen, FiExternalLink, FiDownload, FiTrash2, FiUserPlus } from 'react-icons/fi';

interface ParticipantDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    participant: any;
    onPromoteToCA?: (id: string, name: string, college?: string) => void;
    onDeleteProfile?: (id: string) => void;
    isUpdating?: boolean;
}

export default function ParticipantDetailsModal({
    isOpen,
    onClose,
    participant,
    onPromoteToCA,
    onDeleteProfile,
    isUpdating
}: ParticipantDetailsModalProps) {
    if (!isOpen || !participant) return null;

    const getReferralCode = (p: any) => {
        if (!p.campus_ambassadors) return null;
        if (Array.isArray(p.campus_ambassadors)) {
            return p.campus_ambassadors[0]?.referral_code;
        }
        return p.campus_ambassadors.referral_code;
    };

    const referralCode = getReferralCode(participant);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-hidden">
            <div className="bg-gray-900 rounded-3xl w-full max-w-6xl h-[90vh] max-h-[850px] border border-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                {/* Header - Fixed */}
                <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900/80 backdrop-blur-md z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-8 bg-esummit-primary rounded-full"></div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Participant Dossier</h2>
                            <p className="text-[10px] text-gray-500 font-mono tracking-widest">{participant.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {onPromoteToCA && (
                            <button
                                onClick={() => onPromoteToCA(participant.id, participant.full_name, participant.college_name)}
                                disabled={isUpdating || !!referralCode}
                                className="hidden sm:flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white px-4 py-2 rounded-xl transition-all border border-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={referralCode ? `Already CA: ${referralCode}` : "Add as CA"}
                            >
                                <FiUserPlus className="text-lg" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                    {referralCode ? 'Active CA' : 'Add as CA'}
                                </span>
                            </button>
                        )}
                        {onDeleteProfile && (
                            <button
                                onClick={() => onDeleteProfile(participant.id)}
                                disabled={isUpdating || !!participant.user_type}
                                className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl transition-all border active:scale-95 disabled:opacity-50 ${!!participant.user_type ? 'bg-gray-800 border-gray-700 text-gray-600 grayscale cursor-not-allowed' : 'bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border-red-500/20'}`}
                                title={!!participant.user_type ? "Cannot delete active profile" : "Delete User"}
                            >
                                <FiTrash2 className="text-lg" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Delete</span>
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="group flex items-center gap-2 bg-gray-800 hover:bg-white text-gray-400 hover:text-black px-4 py-2 rounded-xl transition-all border border-gray-700 active:scale-95"
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Close</span>
                            <FiX className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Main Content Area - Side by Side */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-x divide-gray-800">
                    
                    {/* Left Panel: Profile & Identity (Fixed) */}
                    <div className="w-full md:w-[350px] shrink-0 p-6 flex flex-col justify-between bg-gray-800/10">
                        <div className="space-y-6">
                            {/* Photos Rack */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Profile Photo</label>
                                    <div className="aspect-square rounded-xl bg-gray-800 border border-gray-700 overflow-hidden relative group">
                                        {participant.avatar_url ? (
                                            <img src={participant.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <FiUser className="w-8 h-8 text-gray-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Security QR</label>
                                    <div className="aspect-square rounded-xl bg-white p-2 border border-gray-700 overflow-hidden">
                                        {participant.qr_code_url ? (
                                            <img src={participant.qr_code_url} alt="QR" className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">N/A</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Essential Data */}
                            <div className="space-y-4">
                                <CompactInfo icon={<FiUser />} label="Full Name" value={participant.full_name} />
                                <CompactInfo icon={<FiMail />} label="Email" value={participant.email} isEmail />
                                <CompactInfo icon={<FiSmartphone />} label="Phone" value={participant.phone} />
                                <div className="grid grid-cols-2 gap-3">
                                    <CompactInfo icon={<FiCalendar />} label="Age" value={participant.age} />
                                    <CompactInfo icon={<FiUser />} label="Sex" value={participant.gender} />
                                </div>
                            </div>
                        </div>

                        {/* Status Footer (Left) */}
                        <div className="pt-6 border-t border-gray-800 space-y-3">
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                <span className="text-gray-500 font-black">Check-in</span>
                                <span className={participant.esummit_checked_in ? 'text-green-400' : 'text-orange-500'}>
                                    {participant.esummit_checked_in ? 'Verified' : 'Pending'}
                                </span>
                            </div>
                            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-1000 ${participant.esummit_checked_in ? 'w-full bg-green-500' : 'w-1/4 bg-orange-500'}`}></div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Documents & Professional (Wide) */}
                    <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
                        
                        {/* Summary Header */}
                        <div className="grid grid-cols-3 gap-4 shrink-0">
                            <SummaryCard icon={<FiBriefcase />} label="Category" value={participant.user_type || 'Visitor'} />
                            <SummaryCard icon={<FiBookOpen />} label="Affiliation" value={participant.college_name || participant.company_name || 'N/A'} />
                            {referralCode ? (
                                <SummaryCard icon={<FiUserPlus />} label="CA Referral" value={referralCode} />
                            ) : (
                                <SummaryCard icon={<FiUser />} label="System Role" value={participant.role || 'User'} isRole />
                            )}
                        </div>

                        {/* Document Display Area */}
                        <div className="flex-1 min-h-0 space-y-3 flex flex-col">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1 shrink-0 flex items-center gap-2">
                                <FiExternalLink /> {participant.user_type === 'Student' ? 'Academic ID Verification' : 'Government ID Verification'}
                            </label>
                            <div className="flex-1 bg-gray-950 rounded-2xl border border-gray-800 overflow-hidden relative group shadow-2xl">
                                {participant.college_id_url || participant.govt_id_url ? (
                                    <>
                                        <img 
                                            src={participant.college_id_url || participant.govt_id_url} 
                                            alt="ID Document" 
                                            className="w-full h-full object-contain p-4"
                                        />
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <a 
                                                href={participant.college_id_url || participant.govt_id_url} 
                                                target="_blank"
                                                className="bg-white/10 hover:bg-white text-white hover:text-black p-3 rounded-xl backdrop-blur-md transition-all shadow-xl border border-white/10"
                                                title="Open Original"
                                            >
                                                <FiExternalLink className="text-xl" />
                                            </a>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 px-10 text-center">
                                        <FiBriefcase className="w-16 h-16 mb-4 text-gray-600" />
                                        <span className="text-sm font-black uppercase tracking-[0.3em] text-gray-500">Identity Documents Not Required</span>
                                        <p className="text-[10px] text-gray-600 mt-2 max-w-xs">ID upload functionality has been disabled to conserve storage space. Professional status verified during check-in.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Metadata Row */}
                        <div className="shrink-0 flex justify-between items-center text-[9px] text-gray-600 font-mono border-t border-gray-800 pt-4">
                            <span>Last Updated: {formatDate(participant.updated_at)}</span>
                            <span>Created: {formatDate(participant.created_at)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CompactInfo({ icon, label, value, isEmail }: { icon: any, label: string, value: any, isEmail?: boolean }) {
    return (
        <div className="space-y-0.5">
            <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1">
                {icon} {label}
            </label>
            <div className={`p-2.5 bg-gray-800/30 border border-gray-800 rounded-lg text-xs text-white truncate ${isEmail ? 'lowercase' : ''}`}>
                {value || 'Not Provided'}
            </div>
        </div>
    );
}

function SummaryCard({ icon, label, value, isRole }: { icon: any, label: string, value: any, isRole?: boolean }) {
    return (
        <div className="p-4 bg-gray-800/20 border border-gray-800 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-esummit-primary text-lg shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{label}</p>
                <h4 className={`text-xs font-black uppercase tracking-wider truncate ${
                    isRole && value === 'admin' ? 'text-purple-400' : 
                    label === 'CA Referral' ? 'text-emerald-400' : 'text-white'
                }`}>
                    {value}
                </h4>
            </div>
        </div>
    );
}

