'use client';

import Link from 'next/link';
import { MdEmail, MdArrowForward, MdHome } from 'react-icons/md';
import { motion } from 'framer-motion';

export default function VerifyEmail() {
    return (
        <div className="min-h-screen pt-32 pb-12 flex items-center justify-center p-4 bg-esummit-background text-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-esummit-card/80 backdrop-blur-xl rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] p-8 border border-esummit-primary/20 text-center"
            >
                <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-esummit-primary/10 rounded-full border border-esummit-primary/20">
                        <MdEmail className="w-12 h-12 text-esummit-primary animate-pulse" />
                    </div>
                </div>

                <h1 className="text-3xl font-heading text-transparent bg-clip-text bg-gradient-to-r from-esummit-primary to-esummit-accent mb-4">
                    Verify Email
                </h1>

                <p className="text-esummit-secondary/70 mb-8 leading-relaxed font-light">
                    A verification link has been sent to your email address.
                    Please check your inbox and click the link to continue your E-Summit journey.
                </p>

                <div className="space-y-4">
                    <Link
                        href="/esummit/login"
                        className="w-full inline-flex items-center justify-center bg-gradient-to-r from-esummit-primary to-esummit-accent text-white font-bold py-3 px-6 rounded-lg hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:scale-[1.02] transition-all duration-300 group"
                    >
                        Go to Login
                        <MdArrowForward className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                        href="/esummit"
                        className="w-full inline-flex items-center justify-center text-esummit-secondary/50 hover:text-esummit-primary transition-colors text-sm py-2"
                    >
                        <MdHome className="w-4 h-4 mr-2" />
                        Back to E-Summit Home
                    </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-esummit-primary/10 text-xs text-esummit-secondary/40">
                    <p>Didn't receive the email? Check your spam folder or try signing up again.</p>
                </div>
            </motion.div>
        </div>
    );
}
