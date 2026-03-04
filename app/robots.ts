import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ecellmnit.org';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/esummit/admin/'], // Add any paths you want to hide from search engines
        },
        sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/esummit/sitemap.xml`],
    };
}
