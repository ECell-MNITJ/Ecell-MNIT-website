import type { Metadata } from "next";
import { Poppins, Bebas_Neue } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConditionalLayout from "@/components/ConditionalLayout";
import { Toaster } from 'react-hot-toast';

const poppins = Poppins({
    weight: ['300', '400', '500', '600', '700', '800'],
    subsets: ["latin"],
    variable: '--font-poppins',
});

const bebasNeue = Bebas_Neue({
    weight: ['400'],
    subsets: ["latin"],
    variable: '--font-bebas',
});

export const metadata: Metadata = {
    metadataBase: new URL('https://www.ecellmnit.org'),
    title: "E-Cell MNIT Jaipur",
    description: "Entrepreneurship Cell at Malaviya National Institute of Technology, Jaipur. Fostering innovation and entrepreneurship among students.",
    keywords: [
        "E-Cell", "Ecell", "MNIT Jaipur", "Malaviya National Institute of Technology",
        "Entrepreneurship", "Startups", "Innovation", "Events", "Business",
        "Student Startup", "Incubation", "E-Cell MNIT Jaipur", "ecell", "e-cell",
        "ecellmnit", "e-cellmnit", "ecellmnitjaipur", "e-cellmnitjaipur",
        "esummit", "e-summit", "esummitmnit", "e-summitmnit", "esummitmnitjaipur", "e-summitmnitjaipur",
        "esummit2026", "e-summit2026", "esummit2026mnit", "e-summit2026mnit", "esummit2026mnitjaipur", "e-summit2026mnitjaipur"
    ],
};

import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { getSiteSettings } from "@/lib/site-settings";
import { createServerClient } from "@/lib/supabase/server";
import StructuredData, { getSiteSchema, getBreadcrumbSchema, getNavigationSchema } from "@/components/SEO/StructuredData";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createServerClient();
    const settings = await getSiteSettings(supabase);
    const baseUrl = 'https://www.ecellmnit.org';

    const ecellSchema = getSiteSchema(baseUrl);
    const ecellBreadcrumbs = getBreadcrumbSchema(baseUrl, [
        { name: 'Home', item: '/' },
        { name: 'E-Summit', item: '/esummit' },
        { name: 'Events', item: '/events' },
        { name: 'Startups', item: '/startups' },
        { name: 'About', item: '/about' },
    ]);
    const ecellNavigation = getNavigationSchema(baseUrl, [
        { name: 'E-Summit 2026', url: '/esummit' },
        { name: 'Events', url: '/events' },
        { name: 'Startups', url: '/startups' },
        { name: 'Gallery', url: '/gallery' },
        { name: 'About Us', url: '/about' },
        { name: 'Contact', url: '/contact' },
    ]);

    return (
        <html lang="en" className={`${poppins.variable} ${bebasNeue.variable}`} suppressHydrationWarning>
            <body className="antialiased" suppressHydrationWarning>
                <StructuredData data={ecellSchema} />
                <StructuredData data={ecellBreadcrumbs} />
                <StructuredData data={ecellNavigation} />
                <SiteSettingsProvider initialSettings={settings}>
                    <ConditionalLayout>
                        <Toaster position="top-right" />
                        {children}
                    </ConditionalLayout>
                </SiteSettingsProvider>
            </body>
        </html>
    );
}
