import Link from 'next/link';
import { FiAlertTriangle, FiHome } from 'react-icons/fi';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center shadow-2xl">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiAlertTriangle className="w-10 h-10 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Unauthorized Access</h1>
                <p className="text-gray-400 mb-8">
                    You do not have permission to access this page. This area is restricted to authorized E-Summit staff only.
                </p>

                <Link
                    href="/esummit"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-golden text-white font-bold rounded-xl hover:bg-white hover:text-primary-golden transition-colors"
                >
                    <FiHome />
                    Go Back Home
                </Link>
            </div>
        </div>
    );
}
