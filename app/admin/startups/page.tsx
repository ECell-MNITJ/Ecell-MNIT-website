'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient, type Database } from '@/lib/supabase/client';
import { FiPlus, FiEdit2, FiTrash2, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';

type Startup = Database['public']['Tables']['startups']['Row'];

export default function StartupList() {
    const [startups, setStartups] = useState<Startup[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchStartups();
    }, []);

    const fetchStartups = async () => {
        try {
            const { data, error } = await supabase
                .from('startups')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setStartups(data || []);
        } catch (error) {
            toast.error('Failed to load startups');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this startup?')) return;

        try {
            const { error } = await supabase
                .from('startups')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Startup deleted successfully');
            fetchStartups();
        } catch (error) {
            toast.error('Failed to delete startup');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-golden border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-heading text-primary-green mb-2">
                        Startups
                    </h1>
                    <p className="text-gray-600">Manage incubated and associated startups</p>
                </div>
                <Link
                    href="/admin/startups/new"
                    className="flex items-center gap-2 bg-primary-golden text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                    <FiPlus /> Add New Startup
                </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {startups.map((startup) => (
                    <div key={startup.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden">
                                    {startup.logo_url ? (
                                        <img src={startup.logo_url} alt={startup.name} className="w-full h-full object-contain p-1" />
                                    ) : (
                                        <span className="text-2xl font-bold text-gray-300">{startup.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link
                                        href={`/admin/startups/${startup.id}`}
                                        className="p-2 text-primary-golden hover:bg-primary-golden/10 rounded-full transition-colors"
                                    >
                                        <FiEdit2 />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(startup.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-1">{startup.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${startup.status === 'active' ? 'bg-green-100 text-green-700' :
                                        startup.status === 'acquired' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {startup.status}
                                </span>
                                {startup.founded_year && <span>• Since {startup.founded_year}</span>}
                            </div>

                            <p className="text-gray-600 text-sm line-clamp-2 mb-4 h-10">
                                {startup.description || 'No description provided.'}
                            </p>

                            {startup.website_url && (
                                <a
                                    href={startup.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary-golden flex items-center gap-1 hover:underline"
                                >
                                    Visit Website <FiExternalLink />
                                </a>
                            )}
                        </div>
                    </div>
                ))}

                {startups.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 mb-4">No startups added yet.</p>
                        <Link
                            href="/admin/startups/new"
                            className="text-primary-golden font-medium hover:underline"
                        >
                            Add your first startup
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
