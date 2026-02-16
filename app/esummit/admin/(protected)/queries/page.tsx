'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiMail, FiCalendar, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Query {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    source: string;
    created_at: string;
    status: string;
}

export default function ESummitQueriesPage() {
    const [queries, setQueries] = useState<Query[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        fetchQueries();
    }, []);

    const fetchQueries = async () => {
        try {
            const { data, error } = await supabase
                .from('contact_messages')
                .select('*')
                .eq('source', 'esummit')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setQueries(data || []);
        } catch (error) {
            console.error('Error fetching queries:', error);
            toast.error('Failed to load queries');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) return <div className="p-8 text-center">Loading queries...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Contact Queries</h1>

            {queries.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-500">No queries found.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {queries.map((query) => (
                        <div key={query.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{query.subject}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1">
                                            <FiMail className="w-4 h-4" /> {query.email}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FiClock className="w-4 h-4" /> {formatDate(query.created_at)}
                                        </span>
                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium uppercase">
                                            {query.name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{query.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
