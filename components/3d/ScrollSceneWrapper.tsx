'use client';

import dynamic from 'next/dynamic';

const ScrollScene = dynamic(() => import('./ScrollScene'), { ssr: false });

interface ScrollSceneWrapperProps {
    events: any[];
    startups: any[];
    stats: any[];
    settings: any;
}

export default function ScrollSceneWrapper({ events, startups, stats, settings }: ScrollSceneWrapperProps) {
    return <ScrollScene events={events} startups={startups} stats={stats} settings={settings} />;
}
