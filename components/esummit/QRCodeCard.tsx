'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { createClient } from '@/lib/supabase/client';
import { FiLoader, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';

interface QRCodeCardProps {
    user: {
        id: string;
        email: string;
        full_name?: string;
    };
    profile?: {
        full_name?: string;
        esummit_id?: string;
        qr_code_url?: string | null;
    };
}

export default function QRCodeCard({ user, profile }: QRCodeCardProps) {
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(profile?.qr_code_url || null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        // If profile has a QR code, use it.
        if (profile?.qr_code_url) {
            setQrCodeUrl(profile.qr_code_url);
        } else if (!qrCodeUrl && !loading && !generating) {
            // If no QR code, generate one automatically
            generateAndSaveQRCode();
        }
    }, [profile, qrCodeUrl]);

    const generateAndSaveQRCode = async () => {
        if (generating || qrCodeUrl) return;

        try {
            setGenerating(true);
            console.log("Generating QR Code...");

            // 1. Generate QR Data (Stable: No Timestamp)
            const qrData = JSON.stringify({
                userId: user.id,
                email: user.email,
                name: profile?.full_name || user.full_name || 'Participant',
                type: 'esummit_attendance',
                // Removed timestamp to keep it stable
            });

            // 2. Create QR Code Image (Data URL)
            const dataUrl = await QRCode.toDataURL(qrData, {
                width: 400,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff',
                },
            });

            // 3. Convert Data URL to Blob for Upload
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = new File([blob], `qr-${user.id}.png`, { type: 'image/png' });

            // 4. Upload to Supabase Storage
            const filePath = `qr-${user.id}.png`;

            // Try to upload (upsert)
            const { error: uploadError } = await supabase.storage
                .from('qr-codes')
                .upload(filePath, file, {
                    upsert: true,
                    contentType: 'image/png',
                });

            if (uploadError) {
                console.error('Error uploading QR code:', uploadError);
                throw uploadError;
            }

            // 5. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('qr-codes')
                .getPublicUrl(filePath);

            // 6. Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ qr_code_url: publicUrl })
                .eq('id', user.id);

            if (updateError) {
                console.error('Error updating profile with QR code:', updateError);
                throw updateError;
            }

            // 7. Update Local State
            setQrCodeUrl(publicUrl);
            console.log("QR Code generated and saved:", publicUrl);

        } catch (error) {
            console.error("Failed to generate/save QR code:", error);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto transform hover:scale-105 transition-transform duration-300 relative">
            <div className="bg-white p-2 rounded-xl border-2 border-esummit-primary/20 relative min-w-[200px] min-h-[200px] flex items-center justify-center">
                {qrCodeUrl ? (
                    <img
                        src={qrCodeUrl}
                        alt="E-Summit Pass QR Code"
                        className="w-[200px] h-[200px] object-contain"
                    />
                ) : (
                    <div className="flex flex-col items-center text-esummit-primary/50">
                        <FiLoader className="w-8 h-8 animate-spin mb-2" />
                        <span className="text-xs font-bold uppercase tracking-wider">Generating Pass...</span>
                    </div>
                )}
            </div>

            <div className="text-center">
                <p className="text-gray-900 font-bold text-lg">
                    {profile?.full_name || user.full_name || 'Participant'}
                </p>
                <p className="text-gray-500 text-sm font-mono mt-1">
                    ID: {user.id.substring(0, 8).toUpperCase()}
                </p>
                <div className="mt-3 px-3 py-1 bg-esummit-primary/10 text-esummit-primary text-xs font-bold rounded-full uppercase tracking-wider inline-block">
                    E-Summit Pass
                </div>
            </div>

            {generating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                    <div className="flex flex-col items-center">
                        <FiRefreshCw className="w-8 h-8 text-esummit-primary animate-spin mb-2" />
                        <span className="text-esummit-primary font-bold text-sm">Securing your pass...</span>
                    </div>
                </div>
            )}

            <p className="text-xs text-gray-400 text-center px-4">
                Show this QR code at the registration desk for check-in.
            </p>
        </div>
    );
}
