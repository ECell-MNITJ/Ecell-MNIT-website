import type { Metadata } from "next";
import { Poppins, Bebas_Neue } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConditionalLayout from "@/components/ConditionalLayout";

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
    title: "E-Cell MNIT Jaipur",
    description: "Entrepreneurship Cell at Malaviya National Institute of Technology, Jaipur. Fostering innovation and entrepreneurship among students.",
    keywords: ["E-Cell", "MNIT Jaipur", "Entrepreneurship", "Startups", "Innovation", "Events"],
};

import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { getSiteSettings } from "@/lib/site-settings";

import { createServerClient } from "@/lib/supabase/server";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createServerClient();
    const settings = await getSiteSettings(supabase);

    return (
        <html lang="en" className={`${poppins.variable} ${bebasNeue.variable}`}>
            <body className="antialiased">
                <SiteSettingsProvider initialSettings={settings}>
                    <ConditionalLayout>
                        {children}
                    </ConditionalLayout>
                </SiteSettingsProvider>
            </body>
        </html>
    );
}
