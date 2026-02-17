'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiDownload, FiSearch, FiRefreshCw, FiExternalLink, FiCheckCircle, FiXCircle } from 'react-icons/fi';
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

        // Real-time subscription
        const channel = supabase
            .channel('participants_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'profiles'
                },
                (payload) => {
                    console.log('Real-time update:', payload);
                    if (payload.eventType === 'INSERT') {
                        setParticipants((prev) => [payload.new, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setParticipants((prev) =>
                            prev.map((p) => (p.id === payload.new.id ? payload.new : p))
                        );
                        if (payload.new.esummit_checked_in) {
                            toast.success(`Check-in: ${payload.new.full_name || 'User'}`);
                        }
                    } else if (payload.eventType === 'DELETE') {
                        setParticipants((prev) => prev.filter((p) => p.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
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
                Email: p.email,
                Phone: p.phone,
                Gender: p.gender,
                Age: p.age,
                'Checked In': p.esummit_checked_in ? 'Yes' : 'No',
                'Check-in Time': p.esummit_checked_in_at ? new Date(p.esummit_checked_in_at).toLocaleString() : '-',
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

    const checkedInCount = participants.filter(p => p.esummit_checked_in).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Participants ({participants.length})</h1>
                    <p className="text-esummit-primary font-medium mt-1">
                        Live Checked In: <span className="text-white text-lg font-bold">{checkedInCount}</span>
                    </p>
                </div>
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
                                <th className="p-4 text-gray-400 font-medium text-xs uppercase tracking-wider">Status</th>
                                <th className="p-4 text-gray-400 font-medium text-xs uppercase tracking-wider">Contact</th>
                                <th className="p-4 text-gray-400 font-medium text-xs uppercase tracking-wider">Details</th>
                                <th className="p-4 text-gray-400 font-medium text-xs uppercase tracking-wider">Role</th>
                                <th className="p-4 text-gray-400 font-medium text-xs uppercase tracking-wider">QR Code</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        <div className="flex justify-center mb-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-esummit-primary"></div>
                                        </div>
                                        Loading participants...
                                    </td>
                                </tr>
                            ) : filteredParticipants.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        No participants found matching "{searchTerm}"
                                    </td>
                                </tr>
                            ) : (
                                filteredParticipants.map((participant) => (
                                    <tr key={participant.id} className={`hover:bg-gray-800/30 transition-colors group ${participant.esummit_checked_in ? 'bg-green-900/10' : ''}`}>
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
                                            {participant.esummit_checked_in ? (
                                                <div className="flex flex-col">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 w-fit">
                                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                        Checked In
                                                    </span>
                                                    {participant.esummit_checked_in_at && (
                                                        <span className="text-[10px] text-gray-500 mt-1 ml-1">
                                                            {new Date(participant.esummit_checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-700/50 text-gray-400 border border-gray-600/30">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-300">{participant.phone || '-'}</div>
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
