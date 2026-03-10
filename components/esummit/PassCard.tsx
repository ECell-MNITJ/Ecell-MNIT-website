'use client';

import { FiCheck, FiX } from 'react-icons/fi';
import Link from 'next/link';

interface PassCardProps {
    pass: {
        id: string;
        name: string;
        price: number;
        original_price?: number;
        description?: string;
        features: string[];
        is_active: boolean;
        is_popular?: boolean;
        is_sold_out?: boolean;
    };
    allPossibleFeatures?: string[];
    appliedDiscount?: {
        code: string;
        percentage: number;
    };
}

export default function PassCard({ pass, allPossibleFeatures = [], appliedDiscount }: PassCardProps) {
    const isFree = pass.price === 0;

    // Calculate price after referral discount
    const currentPrice = appliedDiscount
        ? Math.max(0, pass.price * (1 - appliedDiscount.percentage / 100))
        : pass.price;

    return (
        <div className={`relative flex flex-col h-full backdrop-blur-md border rounded-2xl p-8 transition-all duration-500 ${pass.is_popular
            ? 'bg-esummit-primary/10 border-esummit-primary/50 shadow-[0_20px_50px_rgba(37,99,235,0.2)] scale-[1.05] z-10'
            : 'bg-esummit-card/30 border-white/10 hover:border-esummit-primary/30 hover:bg-esummit-card/50'
            }`}>
            {pass.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-esummit-primary to-esummit-accent text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-esummit-primary/50 whitespace-nowrap">
                    Most Popular
                </div>
            )}

            <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-white via-esummit-accent to-white uppercase tracking-tighter mb-4">
                    {pass.name}
                </h3>
                <div className="flex flex-col items-center gap-1">
                    <span className={`text-4xl font-black ${isFree ? 'text-esummit-accent' : 'text-transparent bg-clip-text bg-gradient-to-tr from-white via-esummit-primary to-esummit-accent'}`}>
                        {isFree ? 'FREE' : `₹${Math.round(currentPrice)}`}
                    </span>
                    {appliedDiscount && appliedDiscount.percentage > 0 && (
                        <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider bg-green-500/10 px-2 py-0.5 rounded mt-1">
                            {appliedDiscount.percentage}% OFF Applied
                        </span>
                    )}
                </div>
            </div>

            <div className="flex-grow space-y-4 mb-8">
                {allPossibleFeatures.length > 0 ? (
                    allPossibleFeatures.map((feat, i) => {
                        const hasFeat = pass.features.includes(feat);
                        return (
                            <div key={i} className={`flex items-start gap-3 text-sm transition-opacity ${hasFeat ? 'text-gray-200' : 'text-gray-400'}`}>
                                {hasFeat ? (
                                    <div className="mt-1 bg-esummit-primary/20 rounded-full p-0.5 border border-esummit-primary/30">
                                        <FiCheck className="text-esummit-accent w-3.5 h-3.5" />
                                    </div>
                                ) : (
                                    <div className="mt-1 bg-red-500/10 rounded-full p-0.5 border border-red-500/30">
                                        <FiX className="text-red-500 w-3.5 h-3.5" />
                                    </div>
                                )}
                                <span className="leading-tight">{feat}</span>
                            </div>
                        );
                    })
                ) : (
                    pass.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm text-gray-200">
                            <div className="mt-1 bg-yellow-500/20 rounded-full p-0.5 border border-yellow-500/30">
                                <FiCheck className="text-yellow-500 w-3.5 h-3.5" />
                            </div>
                            <span className="leading-tight">{feat}</span>
                        </div>
                    ))
                )}
            </div>

            <div className="space-y-4">
                {pass.is_sold_out ? (
                    <button disabled className="w-full bg-gradient-to-r from-gray-300 to-gray-500 text-black font-bold py-3 rounded-xl cursor-not-allowed opacity-80">
                        Sold Out
                    </button>
                ) : (
                    <Link
                        href={`/esummit/checkout?passId=${pass.id}${appliedDiscount ? `&ref=${appliedDiscount.code}` : ''}`}
                        className={`block text-center w-full font-bold py-3 rounded-xl transition-all duration-300 ${isFree
                            ? 'bg-esummit-accent text-esummit-bg hover:bg-white shadow-[0_10px_20px_rgba(37,99,235,0.2)]'
                            : 'bg-esummit-primary text-white hover:bg-esummit-accent shadow-[0_10px_20px_rgba(37,99,235,0.4)]'
                            }`}
                    >
                        {isFree ? 'Get Pass' : 'Buy Now'}
                    </Link>
                )}
            </div>
        </div>
    );
}

