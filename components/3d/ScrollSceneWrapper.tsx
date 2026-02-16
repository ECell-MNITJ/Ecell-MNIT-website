'use client';

import dynamic from 'next/dynamic';

const ScrollScene = dynamic(() => import('./ScrollScene'), { ssr: false });

interface ScrollSceneWrapperProps {
    events: any[];
    startups: any[];
    stats: any[];
}

export default function ScrollSceneWrapper({ events, startups, stats }: ScrollSceneWrapperProps) {
    return <ScrollScene events={events} startups={startups} stats={stats} />;
}
