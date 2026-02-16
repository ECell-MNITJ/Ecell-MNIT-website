'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const PageLayout3D = dynamic(() => import('./PageLayout3D'), { ssr: false });

interface PageLayout3DWrapperProps {
    children: React.ReactNode;
    pages?: number;
    mobilePages?: number;
}

export default function PageLayout3DWrapper({ children, pages, mobilePages }: PageLayout3DWrapperProps) {
    return <PageLayout3D pages={pages} mobilePages={mobilePages}>{children}</PageLayout3D>;
}
