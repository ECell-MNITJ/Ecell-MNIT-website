'use client';

import Link from 'next/link';
import { MdEmail, MdArrowForward, MdHome } from 'react-icons/md';

export default function VerifyEmail() {
    return (
        <div className="min-h-screen pt-32 pb-12 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/10 text-center">
                <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-primary-golden/10 rounded-full border border-primary-golden/20">
                        <MdEmail className="w-12 h-12 text-primary-golden animate-pulse" />
                    </div>
                </div>

                <h1 className="text-3xl font-heading text-primary-golden mb-4">
                    Verify Email
                </h1>

                <p className="text-gray-300 mb-8 leading-relaxed">
                    A verification link has been sent to your email address.
                    Please check your inbox and click the link to continue.
                </p>

                <div className="space-y-4">
                    <Link
                        href="/login"
                        className="w-full inline-flex items-center justify-center bg-gradient-to-r from-primary-golden to-yellow-700 text-black font-bold py-3 px-6 rounded-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
                    >
                        Go to Login
                        <MdArrowForward className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                        href="/"
                        className="w-full inline-flex items-center justify-center text-gray-400 hover:text-primary-golden transition-colors text-sm py-2"
                    >
                        <MdHome className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-700/50 text-xs text-gray-500">
                    <p>Didn't receive the email? Check your spam folder or try signing up again.</p>
                </div>
            </div>
        </div>
    );
}
