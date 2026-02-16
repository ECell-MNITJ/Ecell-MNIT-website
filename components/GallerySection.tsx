'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiZoomIn, FiLayers } from 'react-icons/fi';
import Image from 'next/image';

interface GallerySectionProps {
    source: 'ecell' | 'esummit';
    className?: string;
}

interface GalleryImage {
    id: string;
    url: string;
    caption?: string;
    section_id?: string | null;
    collection_id?: string | null;
}

interface GalleryCollection {
    id: string;
    title: string;
    section_id: string | null;
    cover_image_url: string | null;
    images: GalleryImage[];
}

interface GallerySectionData {
    id: string;
    title: string;
    display_order: number;
    // Items can be a mix of standalone images OR collections
    collections: GalleryCollection[];
    standaloneImages: GalleryImage[];
}

export default function GallerySection({ source, className = '' }: GallerySectionProps) {
    const [sections, setSections] = useState<GallerySectionData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState<GalleryImage[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, [source]);

    const fetchData = async () => {
        try {
            // 1. Fetch Sections
            const { data: sectionsData } = await supabase
                .from('gallery_sections')
                .select('*')
                .eq('source', source)
                .order('display_order', { ascending: true })
                .order('created_at', { ascending: false });

            // 2. Fetch Collections
            const { data: collectionsData } = await supabase
                .from('gallery_collections')
                .select('*')
                .eq('category', source)
                .order('date', { ascending: false });

            // 3. Fetch Images
            let imageQuery = supabase
                .from('gallery_images')
                .select('*')
                .order('created_at', { ascending: false });

            if (source === 'esummit') {
                imageQuery = imageQuery.eq('category', 'esummit');
            } else {
                imageQuery = imageQuery.eq('category', 'ecell');
            }
            const { data: imagesData } = await imageQuery;

            const allImages: GalleryImage[] = (imagesData || []).map(img => ({
                id: img.id,
                url: img.image_url,
                caption: img.caption || '',
                section_id: img.section_id,
                collection_id: img.collection_id
            }));

            // --- Grouping Logic ---

            const groupedSections: GallerySectionData[] = [];

            // Helper to find images for a collection
            const getCollectionImages = (colId: string) => allImages.filter(img => img.collection_id === colId);

            // A. Process explicitly defined Sections
            sectionsData?.forEach(section => {
                const sectionCols = collectionsData?.filter(c => c.section_id === section.id) || [];
                const sectionStandaloneImages = allImages.filter(img => img.section_id === section.id && !img.collection_id);

                // Map collections to include their images
                const mappedCols = sectionCols.map(c => ({
                    ...c,
                    images: getCollectionImages(c.id)
                })).filter(c => c.images.length > 0); // Only show empty collections? Maybe not.

                if (mappedCols.length > 0 || sectionStandaloneImages.length > 0) {
                    groupedSections.push({
                        id: section.id,
                        title: section.title,
                        display_order: section.display_order,
                        collections: mappedCols,
                        standaloneImages: sectionStandaloneImages
                    });
                }
            });

            // B. Process "Uncategorized" (everything else)
            // Collections without section_id
            const looseCollections = collectionsData?.filter(c => !c.section_id) || [];
            const mappedLooseCols = looseCollections.map(c => ({
                ...c,
                images: getCollectionImages(c.id)
            })).filter(c => c.images.length > 0);

            // Images without section_id AND without collection_id
            const looseImages = allImages.filter(img => !img.section_id && !img.collection_id);

            if (mappedLooseCols.length > 0 || looseImages.length > 0) {
                groupedSections.push({
                    id: 'uncategorized',
                    title: 'Memories & Highlights',
                    display_order: 9999,
                    collections: mappedLooseCols,
                    standaloneImages: looseImages
                });
            }

            setSections(groupedSections);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const openLightbox = (images: GalleryImage[], index = 0) => {
        setLightboxImages(images);
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % lightboxImages.length);
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
    };

    if (isLoading) return <div className="py-20 text-center text-primary-golden">Loading gallery...</div>;
    if (sections.length === 0) return null;

    return (
        <section className={`py-12 ${className}`}>
            <div className="container-custom mx-auto px-4 space-y-24">
                {sections.map(section => (
                    <div key={section.id} className="space-y-8">
                        {/* Section Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <h2 className={`text-3xl md:text-5xl font-heading font-bold ${section.id === 'uncategorized' ? 'text-white' : 'text-primary-golden'}`}>
                                {section.id === 'uncategorized' ? <><span className="text-primary-golden">Memories</span> & Highlights</> : section.title}
                            </h2>
                        </motion.div>

                        {/* Mixed Grid: Collections (Albums) + Standalone Images */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                            {/* Render Collections as Album Cards */}
                            {section.collections.map((col, idx) => (
                                <motion.div
                                    key={`col-${col.id}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => openLightbox(col.images, 0)}
                                    className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border-2 border-primary-golden/20 hover:border-primary-golden transition-colors"
                                >
                                    {/* Cover Image (First in collection or override) */}
                                    <img
                                        src={col.cover_image_url || col.images[0]?.url}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        alt={col.title}
                                    />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5">
                                        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-white mb-2 border border-white/10">
                                                <FiLayers className="text-primary-golden" /> {col.images.length} Photos
                                            </span>
                                            <h3 className="text-xl font-bold text-white leading-tight mb-1">{col.title}</h3>
                                            <p className="text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 mt-2">
                                                View Album <FiZoomIn />
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Render Standalone Images */}
                            {section.standaloneImages.map((img, idx) => (
                                <motion.div
                                    key={`img-${img.id}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: (section.collections.length + idx) * 0.05 }}
                                    onClick={() => openLightbox(section.standaloneImages, idx)} // Clicking standalone opens standalone slideshow
                                    className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer bg-zinc-900"
                                >
                                    <img
                                        src={img.url}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <FiZoomIn className="text-white text-3xl" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {lightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex items-center justify-center pt-24"
                        onClick={() => setLightboxOpen(false)}
                    >
                        {/* Close Button */}
                        <button className="absolute top-28 right-6 text-white/50 hover:text-white p-2 z-50 transition-colors" onClick={() => setLightboxOpen(false)}>
                            <FiX size={32} />
                        </button>

                        {/* Navigation Buttons */}
                        <button className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-50" onClick={prevImage}>
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-50" onClick={nextImage}>
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>

                        {/* Main Image */}
                        <motion.div
                            key={currentImageIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative max-w-7xl max-h-[90vh] w-full px-4 flex flex-col items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={lightboxImages[currentImageIndex]?.url}
                                className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl"
                            />
                            {lightboxImages[currentImageIndex]?.caption && (
                                <p className="mt-4 text-white/90 text-lg font-medium text-center">{lightboxImages[currentImageIndex].caption}</p>
                            )}
                            <div className="mt-2 text-white/40 text-sm">
                                {currentImageIndex + 1} / {lightboxImages.length}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
