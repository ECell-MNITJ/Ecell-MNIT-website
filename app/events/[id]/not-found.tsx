import Link from 'next/link';
import { FiArrowLeft, FiHome } from 'react-icons/fi';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-green via-gray-900 to-primary-green">
            <div className="container-custom text-center text-white py-20">
                <div className="text-9xl mb-6">🔍</div>
                <h1 className="font-heading text-5xl md:text-7xl mb-6">Event Not Found</h1>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                    Sorry, we couldn't find the event you're looking for. It may have been removed or the link might be incorrect.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/events"
                        className="inline-flex items-center justify-center gap-2 bg-primary-golden text-white font-semibold px-6 py-3 rounded-lg hover:shadow-xl transition-all"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                        Back to Events
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/20 transition-all border border-white/20"
                    >
                        <FiHome className="w-5 h-5" />
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
