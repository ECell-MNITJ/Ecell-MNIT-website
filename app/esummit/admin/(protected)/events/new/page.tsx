'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, type Database, EventDetails } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/supabase/storage';
import toast from 'react-hot-toast';
import { FiUpload, FiX } from 'react-icons/fi';
import AgendaEditor from '@/components/admin/AgendaEditor';
import SpeakerEditor from '@/components/admin/SpeakerEditor';
import GalleryEditor from '@/components/admin/GalleryEditor';

export default function NewESummitEvent() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
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
            console.log('Submitting event form...', { formData, eventDetails });
            let imageUrl = null;

            if (imageFile) {
                console.log('Uploading image...');
                imageUrl = await uploadImage(imageFile, 'event-images');
                console.log('Image uploaded:', imageUrl);
            }


            const eventData: Database['public']['Tables']['events']['Insert'] = {
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
                // registrations_open: formData.registrations_open, // Column missing in DB
                image_url: imageUrl,
                is_esummit: true, // IMPORTANT: Set E-Summit flag
                is_team_event: formData.is_team_event,
                min_team_size: formData.min_team_size,
                max_team_size: formData.max_team_size,
            };

            if (!formData.date) {
                toast.error('Date is required');
                setLoading(false);
                return;
            }

            console.log('Inserting event data...');

            // Attempt insert without select() to avoid RLS read policy issues
            const { error } = await supabase.from('events').insert(eventData as any);

            if (error) {
                console.error('Supabase Insert Error:', error.message);
                throw error;
            }

            console.log('Insert successful');
            toast.success('E-Summit Event created successfully!');
            router.refresh();
            router.push('/esummit/admin/events');
        } catch (error: any) {
            console.error('Submission error object:', error);
            console.error('Submission error message:', error.message);
            toast.error(error.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Add E-Summit Event</h1>
                <p className="text-gray-600">Create a new event for E-Summit</p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg max-w-2xl border border-purple-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Event Image</label>
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
                                <div className="w-48 h-32 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <FiUpload className="w-8 h-8 text-gray-400" />
                                </div>
                            )}
                            <label className="cursor-pointer bg-purple-50 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors">
                                <span>Choose Image</span>
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
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                        <input
                            id="title"
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                        <textarea
                            id="description"
                            rows={4}
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="detailed_description" className="block text-sm font-medium text-gray-700 mb-2">Detailed Description (Optional)</label>
                        <textarea
                            id="detailed_description"
                            rows={8}
                            value={formData.detailed_description}
                            onChange={(e) => setFormData({ ...formData, detailed_description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Add a comprehensive description, agenda, requirements, etc."
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">Date & Time *</label>
                            <input
                                id="date"
                                type="datetime-local"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                            <select
                                id="category"
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="General">General</option>
                                <option value="Workshop">Workshop</option>
                                <option value="Summit">Summit</option>
                                <option value="Competition">Competition</option>
                                <option value="Webinar">Webinar</option>
                                <option value="Networking">Networking</option>
                                <option value="Keynote">Keynote</option>
                                <option value="Panel">Panel Discussion</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                            id="location"
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="e.g., Main Auditorium, MNIT"
                        />
                    </div>

                    <div>
                        <label htmlFor="details_url" className="block text-sm font-medium text-gray-700 mb-2">Event Details URL (Optional)</label>
                        <input
                            id="details_url"
                            type="url"
                            value={formData.details_url}
                            onChange={(e) => setFormData({ ...formData, details_url: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="https://... (Leave empty to use default event page)"
                        />
                        <p className="text-sm text-gray-500 mt-1">If provided, users will be redirected to this URL when clicking "View Details"</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                            <select
                                id="status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="past">Past</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Featured Event</label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                    className="w-5 h-5 text-purple-600 focus:ring-purple-500 rounded"
                                />
                                <span className="text-gray-700">Mark as featured</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Registration Status</label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.registrations_open}
                                    onChange={(e) => setFormData({ ...formData, registrations_open: e.target.checked })}
                                    className="w-5 h-5 text-primary-golden focus:ring-primary-golden rounded"
                                />
                                <span className="text-gray-700">Registrations Open</span>
                            </label>
                            <p className="text-sm text-gray-500 mt-1">
                                Uncheck to close registrations for this event.
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6 mt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Registration Settings</h3>

                        <div className="mb-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_team_event}
                                    onChange={(e) => setFormData({ ...formData, is_team_event: e.target.checked })}
                                    className="w-5 h-5 text-purple-600 focus:ring-purple-500 rounded"
                                />
                                <span className="text-gray-700 font-medium">This is a Team Event</span>
                            </label>
                            <p className="text-sm text-gray-500 mt-1 ml-8">
                                Users will register as teams instead of individuals.
                            </p>
                        </div>

                        {formData.is_team_event && (
                            <div className="grid md:grid-cols-2 gap-4 ml-8">
                                <div>
                                    <label htmlFor="min_team_size" className="block text-sm font-medium text-gray-700 mb-2">Minimum Team Size</label>
                                    <input
                                        id="min_team_size"
                                        type="number"
                                        min="1"
                                        required={formData.is_team_event}
                                        value={formData.min_team_size}
                                        onChange={(e) => setFormData({ ...formData, min_team_size: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="max_team_size" className="block text-sm font-medium text-gray-700 mb-2">Maximum Team Size</label>
                                    <input
                                        id="max_team_size"
                                        type="number"
                                        min="1"
                                        required={formData.is_team_event}
                                        value={formData.max_team_size}
                                        onChange={(e) => setFormData({ ...formData, max_team_size: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pt-8 mt-8 space-y-8">
                        <h2 className="text-2xl font-bold text-gray-800">Comprehensive Details</h2>

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
                            className="flex-1 bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-500 transition-all disabled:opacity-50 hover:shadow-lg"
                        >
                            {loading ? 'Creating...' : 'Create E-Summit Event'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
