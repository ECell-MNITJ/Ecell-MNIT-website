'use client';


import GallerySection from '@/components/GallerySection';

export default function GalleryPage() {
    return (
        <div className="relative w-full min-h-screen text-white overflow-hidden">


            <main className="relative z-10 pt-36 pb-20">
                <div className="container mx-auto px-4 text-center mb-10">
                    <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-golden to-yellow-300">
                            E-Cell
                        </span> Gallery
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Capturing the moments that define our journey of innovation and entrepreneurship.
                    </p>
                </div>

                <GallerySection source="ecell" />
            </main>
        </div>
    );
}
