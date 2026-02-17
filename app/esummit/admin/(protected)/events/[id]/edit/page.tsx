'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient, type Database, EventDetails } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/supabase/storage';
import toast from 'react-hot-toast';
import { FiUpload, FiX } from 'react-icons/fi';
import AgendaEditor from '@/components/admin/AgendaEditor';
import SpeakerEditor from '@/components/admin/SpeakerEditor';
import GalleryEditor from '@/components/admin/GalleryEditor';

export default function EditESummitEvent() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        detailed_description: '',
        date: '',
        category: 'General',
        location: '',

        details_url: '',
        status: 'upcoming' as 'upcoming' | 'ongoing' | 'past',
        featured: false,
        registrations_open: true,
        image_url: '',
        is_team_event: false,
        min_team_size: 1,
        max_team_size: 1,
    });
    const [eventDetails, setEventDetails] = useState<EventDetails>({
        agenda: [],
        speakers: [],
        gallery: [],
        faq: []
    });
    const [showCustomCategory, setShowCustomCategory] = useState(false);

    const CATEGORIES = [
        { value: 'General', label: 'General' },
        { value: 'Workshop', label: 'Workshop' },
        { value: 'Summit', label: 'Summit' },
        { value: 'Competition', label: 'Competition' },
        { value: 'Webinar', label: 'Webinar' },
        { value: 'Networking', label: 'Networking' },
        { value: 'Keynote', label: 'Keynote' },
        { value: 'Panel', label: 'Panel Discussion' },
    ];

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'Other') {
            setShowCustomCategory(true);
            setFormData(prev => ({ ...prev, category: '' }));
        } else {
            setShowCustomCategory(false);
            setFormData(prev => ({ ...prev, category: value }));
        }
    };

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('id', id)
                .single<Database['public']['Tables']['events']['Row']>();

            if (error) throw error;
            if (!data) throw new Error('Event not found');

            if (data) {
                const isCustom = !CATEGORIES.some(c => c.value === data.category);
                setShowCustomCategory(isCustom);
            }

            setFormData({
                title: data.title,
                description: data.description,
                detailed_description: data.detailed_description || '',
                date: data.date,
                category: data.category,
                location: data.location || '',

                details_url: data.details_url || '',
                status: data.status,
                featured: data.featured,
                registrations_open: true, // DB column missing, defaulting to true
                // registrations_open: data.registrations_open ?? true,

                image_url: data.image_url || '',
                is_team_event: data.is_team_event || false,
                min_team_size: data.min_team_size || 1,
                max_team_size: data.max_team_size || 1,
            });

            if (data.event_details) {
                setEventDetails(data.event_details as EventDetails);
            }

            if (data.image_url) {
                setImagePreview(data.image_url);
            }
        } catch (error: any) {
            toast.error('Failed to load event');
        } finally {
            setFetching(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image must be less than 5MB');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = formData.image_url;

            // Upload new image if selected
            if (imageFile) {
                imageUrl = await uploadImage(imageFile, 'event-images', formData.image_url);
            }

            const eventData: Database['public']['Tables']['events']['Update'] = {
                title: formData.title,
                description: formData.description,
                detailed_description: formData.detailed_description,
                event_details: eventDetails as any,
                date: new Date(formData.date).toISOString(),
                category: formData.category,
                location: formData.location,

                details_url: formData.details_url,
                status: formData.status,
                featured: formData.featured,
                // registrations_open: formData.registrations_open,
                image_url: imageUrl,
                is_team_event: formData.is_team_event,
                min_team_size: formData.min_team_size,
                max_team_size: formData.max_team_size,
            };

            const { error } = await supabase
                .from('events')
                .update(eventData as any)
                .eq('id', id);

            if (error) throw error;

            toast.success('Event updated successfully!');
            router.refresh();
            router.push('/esummit/admin/events');
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error(error.message || 'Failed to update event');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Edit E-Summit Event
                </h1>
                <p className="text-gray-400">Update event details</p>
            </div>

            <div className="bg-gray-900 rounded-xl p-8 shadow-lg max-w-2xl border border-gray-800">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Event Image</label>
                        <div className="flex items-center gap-6">
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-48 h-32 rounded-lg object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImageFile(null);
                                            setImagePreview(null);
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                    >
                                        <FiX className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-48 h-32 rounded-lg bg-gray-800 flex items-center justify-center border border-gray-700">
                                    <FiUpload className="w-8 h-8 text-gray-500" />
                                </div>
                            )}
                            <label className="cursor-pointer bg-purple-900/40 text-purple-400 px-4 py-2 rounded-lg hover:bg-purple-900/60 transition-colors border border-purple-500/30">
                                <span>Change Image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                        <input
                            id="title"
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                        <textarea
                            id="description"
                            rows={4}
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="detailed_description" className="block text-sm font-medium text-gray-300 mb-2">Detailed Description (Optional)</label>
                        <textarea
                            id="detailed_description"
                            rows={8}
                            value={formData.detailed_description}
                            onChange={(e) => setFormData({ ...formData, detailed_description: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                            placeholder="Add a comprehensive description, agenda, requirements, etc."
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">Date & Time *</label>
                            <input
                                id="date"
                                type="datetime-local"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                            <div className="space-y-2">
                                <select
                                    id="category"
                                    required
                                    value={showCustomCategory ? 'Other' : (CATEGORIES.some(c => c.value === formData.category) ? formData.category : 'Other')}
                                    onChange={handleCategoryChange}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                    <option value="Other">Other (Custom)</option>
                                </select>

                                {showCustomCategory && (
                                    <input
                                        type="text"
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="Enter custom category"
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                        <input
                            id="location"
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                            placeholder="e.g., Main Auditorium, MNIT"
                        />
                    </div>

                    <div>
                        <label htmlFor="details_url" className="block text-sm font-medium text-gray-300 mb-2">Event Details URL (Optional)</label>
                        <input
                            id="details_url"
                            type="url"
                            value={formData.details_url}
                            onChange={(e) => setFormData({ ...formData, details_url: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                        />
                        <p className="text-sm text-gray-500 mt-1">If provided, users will be redirected to this URL when clicking "View Details"</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">Status *</label>
                            <select
                                id="status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="past">Past</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Featured Event</label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                    className="w-5 h-5 text-purple-600 focus:ring-purple-500 rounded bg-gray-800 border-gray-600"
                                />
                                <span className="text-gray-300">Mark as featured</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Registration Status</label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.registrations_open}
                                    onChange={(e) => setFormData({ ...formData, registrations_open: e.target.checked })}
                                    className="w-5 h-5 text-primary-golden focus:ring-primary-golden rounded bg-gray-800 border-gray-600"
                                />
                                <span className="text-gray-300">Registrations Open</span>
                            </label>
                            <p className="text-sm text-gray-500 mt-1">
                                Uncheck to close registrations for this event.
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-6 mt-6">
                        <h3 className="text-lg font-medium text-white mb-4">Registration Settings</h3>

                        <div className="mb-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_team_event}
                                    onChange={(e) => setFormData({ ...formData, is_team_event: e.target.checked })}
                                    className="w-5 h-5 text-purple-600 focus:ring-purple-500 rounded bg-gray-800 border-gray-600"
                                />
                                <span className="text-gray-300 font-medium">This is a Team Event</span>
                            </label>
                            <p className="text-sm text-gray-500 mt-1 ml-8">
                                Users will register as teams instead of individuals.
                            </p>
                        </div>

                        {formData.is_team_event && (
                            <div className="grid md:grid-cols-2 gap-4 ml-8">
                                <div>
                                    <label htmlFor="min_team_size" className="block text-sm font-medium text-gray-300 mb-2">Minimum Team Size</label>
                                    <input
                                        id="min_team_size"
                                        type="number"
                                        min="1"
                                        required={formData.is_team_event}
                                        value={formData.min_team_size}
                                        onChange={(e) => setFormData({ ...formData, min_team_size: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="max_team_size" className="block text-sm font-medium text-gray-300 mb-2">Maximum Team Size</label>
                                    <input
                                        id="max_team_size"
                                        type="number"
                                        min="1"
                                        required={formData.is_team_event}
                                        value={formData.max_team_size}
                                        onChange={(e) => setFormData({ ...formData, max_team_size: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-800 pt-8 mt-8 space-y-8">
                        <h2 className="text-2xl font-bold text-white">Comprehensive Details</h2>

                        <AgendaEditor
                            agenda={eventDetails.agenda || []}
                            onChange={(agenda) => setEventDetails({ ...eventDetails, agenda })}
                        />

                        <SpeakerEditor
                            speakers={eventDetails.speakers || []}
                            onChange={(speakers) => setEventDetails({ ...eventDetails, speakers })}
                        />

                        <GalleryEditor
                            gallery={eventDetails.gallery || []}
                            onChange={(gallery) => setEventDetails({ ...eventDetails, gallery })}
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Update Event'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 border-2 border-gray-600 rounded-lg hover:bg-gray-800 transition-colors text-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
