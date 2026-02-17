'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiDownload, FiSearch, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

export default function ParticipantsPage() {
    const supabase = createClient();
    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchParticipants();
    }, []);

    const fetchParticipants = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setParticipants(data || []);
        } catch (error) {
            console.error('Error fetching participants:', JSON.stringify(error, null, 2));
            toast.error(`Failed to load participants: ${(error as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        try {
            setExporting(true);
            const dataToExport = participants.map(p => ({
                ID: p.id,
                'Full Name': p.full_name,
                Email: p.email, // Note: Email might not be in profiles if not synced, usually in auth.users. 
                // But typically we query profiles. If email is needed, we might need a join or it might be in profile if added.
                // Checking types.ts, profile has no email. 
                // We might need to fetch emails from auth or if they are in profile.
                // For now, let's export what is in profile.
                Phone: p.phone,
                Gender: p.gender,
                Age: p.age,
                'QR Code URL': p.qr_code_url,
                Role: p.role,
                'Last Updated': new Date(p.updated_at || '').toLocaleDateString()
            }));

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Participants");
            XLSX.writeFile(wb, "E-Summit_Participants.xlsx");
            toast.success('Exported successfully!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export');
        } finally {
            setExporting(false);
        }
    };

    const filteredParticipants = participants.filter(p =>
        p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm) ||
        p.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-white">Participants ({participants.length})</h1>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search name, phone, ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-esummit-primary focus:border-transparent outline-none"
                        />
                    </div>
                    <button
                        onClick={fetchParticipants}
                        className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                        title="Refresh"
                    >
                        <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={exporting || participants.length === 0}
                        className="flex items-center gap-2 bg-esummit-primary text-white px-4 py-2 rounded-lg hover:bg-white hover:text-esummit-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        <FiDownload /> {exporting ? 'Exporting...' : 'Export Excel'}
                    </button>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/50 border-b border-gray-700">
                                <th className="p-4 text-gray-400 font-medium text-xs uppercase tracking-wider">User</th>
                                <th className="p-4 text-gray-400 font-medium text-xs uppercase tracking-wider">Contact</th>
                                <th className="p-4 text-gray-400 font-medium text-xs uppercase tracking-wider">Details</th>
                                <th className="p-4 text-gray-400 font-medium text-xs uppercase tracking-wider">Role</th>
                                <th className="p-4 text-gray-400 font-medium text-xs uppercase tracking-wider">QR Code</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        <div className="flex justify-center mb-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-esummit-primary"></div>
                                        </div>
                                        Loading participants...
                                    </td>
                                </tr>
                            ) : filteredParticipants.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        No participants found matching "{searchTerm}"
                                    </td>
                                </tr>
                            ) : (
                                filteredParticipants.map((participant) => (
                                    <tr key={participant.id} className="hover:bg-gray-800/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 overflow-hidden flex items-center justify-center text-esummit-primary font-bold">
                                                    {participant.avatar_url ? (
                                                        <img src={participant.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        participant.full_name?.charAt(0).toUpperCase() || '?'
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">{participant.full_name || 'N/A'}</div>
                                                    <div className="text-xs text-gray-500 font-mono" title={participant.id}>
                                                        ID: {participant.id.split('-')[0]}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-300">{participant.phone || '-'}</div>
                                            {/* Email not in profile usually, omit for now */}
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-300">
                                                <span className="text-gray-500">Age:</span> {participant.age || '-'}
                                            </div>
                                            <div className="text-sm text-gray-300">
                                                <span className="text-gray-500">Gender:</span> {participant.gender || '-'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${participant.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                                                participant.role === 'member' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-gray-700 text-gray-400'
                                                }`}>
                                                {participant.role || 'user'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {participant.qr_code_url ? (
                                                <a
                                                    href={participant.qr_code_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-esummit-primary hover:text-white transition-colors text-sm font-medium"
                                                >
                                                    <FiExternalLink /> View QR
                                                </a>
                                            ) : (
                                                <span className="text-gray-600 text-sm">Not generated</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-gray-800 bg-gray-800/30 text-xs text-gray-500 flex justify-between">
                    <span>Showing {filteredParticipants.length} of {participants.length} participants</span>
                </div>
            </div>
        </div>
    );
}
