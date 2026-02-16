'use client';

import { QRCodeSVG } from 'qrcode.react';

interface QRCodeCardProps {
    user: {
        id: string;
        email: string;
        full_name?: string;
    };
    profile?: {
        full_name?: string;
        esummit_id?: string;
    };
}

export default function QRCodeCard({ user, profile }: QRCodeCardProps) {
    // Data to encode in the QR code
    // We can encode a JSON string with user details for easy scanning
    const qrData = JSON.stringify({
        userId: user.id,
        email: user.email,
        name: profile?.full_name || user.full_name || 'Participant',
        type: 'esummit_attendance',
        timestamp: new Date().toISOString()
    });

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto transform hover:scale-105 transition-transform duration-300">
            <div className="bg-white p-2 rounded-xl border-2 border-esummit-primary/20">
                <QRCodeSVG
                    value={qrData}
                    size={200}
                    level="H" // High error correction
                    includeMargin={true}
                    imageSettings={{
                        src: "/images/ecell-logo-dark.png", // Assuming we have a logo, or we can omit this
                        x: undefined,
                        y: undefined,
                        height: 24,
                        width: 24,
                        excavate: true,
                    }}
                />
            </div>

            <div className="text-center">
                <p className="text-gray-900 font-bold text-lg">
                    {profile?.full_name || 'Participant'}
                </p>
                <p className="text-gray-500 text-sm font-mono mt-1">
                    ID: {user.id.substring(0, 8).toUpperCase()}
                </p>
                <div className="mt-3 px-3 py-1 bg-esummit-primary/10 text-esummit-primary text-xs font-bold rounded-full uppercase tracking-wider inline-block">
                    E-Summit Pass
                </div>
            </div>

            <p className="text-xs text-gray-400 text-center px-4">
                Show this QR code at the registration desk for check-in.
            </p>
        </div>
    );
}
