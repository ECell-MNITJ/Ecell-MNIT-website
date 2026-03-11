'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import toast from 'react-hot-toast';

interface ImageCropperProps {
    src: string;
    aspectRatio?: number;
    onCropComplete: (blob: Blob) => void;
    onCancel: () => void;
}

export default function ImageCropper({ src, aspectRatio = 1, onCropComplete, onCancel }: ImageCropperProps) {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const imgRef = useRef<HTMLImageElement>(null);

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        const initialCrop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                aspectRatio,
                width,
                height
            ),
            width,
            height
        );
        setCrop(initialCrop);

        // Also set initial completed crop as pixel crop
        const pixelCrop: PixelCrop = {
            unit: 'px',
            x: (width - (width * 0.9)) / 2,
            y: (height - (height * 0.9)) / 2,
            width: width * 0.9,
            height: height * 0.9
        };
        // Adjust for aspect ratio
        if (aspectRatio > width / height) {
            pixelCrop.width = width * 0.9;
            pixelCrop.height = pixelCrop.width / aspectRatio;
        } else {
            pixelCrop.height = height * 0.9;
            pixelCrop.width = pixelCrop.height * aspectRatio;
        }
        pixelCrop.x = (width - pixelCrop.width) / 2;
        pixelCrop.y = (height - pixelCrop.height) / 2;

        setCompletedCrop(pixelCrop);
    }

    async function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        // Use natural resolution for the canvas
        canvas.width = crop.width * scaleX;
        canvas.height = crop.height * scaleY;

        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('No 2d context');
        }

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Canvas toBlob failed');
                    reject(new Error('Canvas is empty'));
                    return;
                }
                resolve(blob);
            }, 'image/jpeg', 0.95);
        });
    }

    const handleConfirm = async () => {
        if (!imgRef.current) return;

        if (!completedCrop || completedCrop.width === 0 || completedCrop.height === 0) {
            toast.error('Please select an area to crop');
            return;
        }

        try {
            const blob = await getCroppedImg(imgRef.current, completedCrop);
            onCropComplete(blob);
        } catch (e) {
            console.error('Error cropping image:', e);
            toast.error('Failed to crop image. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
            <div className="bg-white rounded-xl overflow-hidden max-w-2xl w-full flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-heading text-primary-green">Crop Image</h3>
                    <button
                        onClick={onCancel}
                        className="text-gray-500 hover:text-gray-700 p-1"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6 flex items-start justify-center bg-gray-100 min-h-[300px]">
                    {src && (
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={aspectRatio}
                            className="max-w-full shadow-lg"
                        >
                            <img
                                ref={imgRef}
                                alt="Crop me"
                                src={src}
                                crossOrigin="anonymous"
                                onLoad={onImageLoad}
                                className="max-w-full block"
                                style={{ maxHeight: '65vh' }}
                            />
                        </ReactCrop>
                    )}
                </div>

                <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-2 bg-primary-golden text-white rounded-lg hover:shadow-lg transition-all font-medium"
                    >
                        Apply Crop
                    </button>
                </div>
            </div>
        </div>
    );
}
