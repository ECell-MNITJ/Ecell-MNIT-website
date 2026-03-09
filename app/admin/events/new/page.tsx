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
import RichTextEditor from '@/components/admin/RichTextEditor';

export default function NewEvent() {
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
    const [showCustomCategory, setShowCustomCategory] = useState(false);

    const CATEGORIES = [
        'General', 'Workshop', 'Summit', 'Competition',
        'Webinar', 'Networking', 'Keynote', 'Panel'
    ];

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'Other') {
            setShowCustomCategory(true);
            setFormData({ ...formData, category: '' });
        } else {
            setShowCustomCategory(false);
            setFormData({ ...formData, category: value });
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

        if (!formData.detailed_description.replace(/<[^>]*>/g, '').trim()) {
            toast.error('Detailed description is required');
            return;
        }

        setLoading(true);

        try {
            let imageUrl = null;

            if (imageFile) {
                imageUrl = await uploadImage(imageFile, 'event-images');
            }


            const eventData: Database['public']['Tables']['events']['Insert'] = {
                title: formData.title,
                description: formData.description,
                detailed_description: formData.detailed_description,
                event_details: eventDetails as any,
                date: formData.date,
                category: formData.category,
                location: formData.location,

                details_url: formData.details_url,
                status: formData.status,
                featured: formData.featured,
                registrations_open: formData.registrations_open,
                image_url: imageUrl,
                is_team_event: formData.is_team_event,
                min_team_size: formData.min_team_size,
                max_team_size: formData.max_team_size,
            };

            const { error } = await supabase.from('events').insert(eventData as any);


            if (error) throw error;

            toast.success('Event created successfully!');
            router.push('/admin/events');
        } catch (error: any) {
            toast.error(error.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-heading text-primary-green mb-2">Add Event</h1>
                <p className="text-gray-600">Create a new event</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
                {/* Left Column - Main Content */}
                <div className="flex-1 bg-white rounded-xl p-8 shadow-lg space-y-6">
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
                            <label className="cursor-pointer bg-primary-golden/10 text-primary-golden px-4 py-2 rounded-lg hover:bg-primary-golden/20 transition-colors">
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="detailed_description" className="block text-sm font-medium text-gray-700 mb-2">Detailed Description (Required)</label>
                        <RichTextEditor
                            value={formData.detailed_description}
                            onChange={(value) => setFormData({ ...formData, detailed_description: value })}
                            placeholder="Add a comprehensive description, agenda, requirements, etc."
                        />
                        {formData.detailed_description.replace(/<[^>]*>/g, '').trim().length === 0 && (
                            <p className="mt-1 text-sm text-red-500">Detailed description is required</p>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pt-8 mt-8 space-y-8">
                        <h2 className="text-2xl font-heading text-primary-green">Comprehensive Details</h2>

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
                </div>

                {/* Right Column - Settings */}
                <div className="w-full lg:w-96 bg-gray-50 rounded-xl p-6 shadow-lg border border-gray-200 flex flex-col space-y-6 h-fit sticky top-6">
                    <h3 className="text-lg font-heading text-primary-green border-b border-gray-200 pb-2">Event Settings</h3>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                        <select
                            id="status"
                            value={formData.status}
                            onChange={(e) => {
                                const newStatus = e.target.value as any;
                                setFormData({
                                    ...formData,
                                    status: newStatus,
                                    ...(newStatus === 'past' ? { registrations_open: false } : {})
                                });
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent"
                        >
                            <option value="upcoming">Upcoming</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="past">Past</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">Date & Time *</label>
                        <input
                            id="date"
                            type="datetime-local"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                        <div className="space-y-2">
                            <select
                                id="category"
                                required
                                value={showCustomCategory ? 'Other' : formData.category}
                                onChange={handleCategoryChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent"
                                />
                            )}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                            id="location"
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent"
                            placeholder="https://... (Leave empty for default)"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Featured Event</label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.featured}
                                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                className="w-5 h-5 text-primary-golden focus:ring-primary-golden rounded"
                            />
                            <span className="text-gray-700">Mark as featured</span>
                        </label>
                    </div>

                    <div className="border-t border-gray-200 pt-6 mt-2">
                        <h3 className="text-md font-semibold text-gray-900 mb-4">Registration Settings</h3>

                        <div className="mb-4">
                            <label className={`flex items-center gap-3 ${formData.status === 'past' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                                <input
                                    type="checkbox"
                                    checked={formData.registrations_open}
                                    onChange={(e) => setFormData({ ...formData, registrations_open: e.target.checked })}
                                    disabled={formData.status === 'past'}
                                    className="w-5 h-5 text-primary-golden focus:ring-primary-golden rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <span className={`${formData.status === 'past' ? 'text-gray-400' : 'text-gray-700'} font-medium`}>
                                    Registrations Open {formData.status === 'past' && '(Disabled)'}
                                </span>
                            </label>
                        </div>

                        <div className="mb-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_team_event}
                                    onChange={(e) => setFormData({ ...formData, is_team_event: e.target.checked })}
                                    className="w-5 h-5 text-primary-golden focus:ring-primary-golden rounded"
                                />
                                <span className="text-gray-700 font-medium">This is a Team Event</span>
                            </label>
                        </div>

                        {formData.is_team_event && (
                            <div className="grid grid-cols-2 gap-4 ml-8">
                                <div>
                                    <label htmlFor="min_team_size" className="block text-xs font-medium text-gray-700 mb-1">Min Team Size</label>
                                    <input
                                        id="min_team_size"
                                        type="number"
                                        min="1"
                                        required={formData.is_team_event}
                                        value={formData.min_team_size}
                                        onChange={(e) => setFormData({ ...formData, min_team_size: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="max_team_size" className="block text-xs font-medium text-gray-700 mb-1">Max Team Size</label>
                                    <input
                                        id="max_team_size"
                                        type="number"
                                        min="1"
                                        required={formData.is_team_event}
                                        value={formData.max_team_size}
                                        onChange={(e) => setFormData({ ...formData, max_team_size: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary-golden to-yellow-700 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Event'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="w-full px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
