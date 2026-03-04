

interface StructuredDataProps {
    data: any;
}

export default function StructuredData({ data }: StructuredDataProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

export const getSiteSchema = (baseUrl: string) => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'E-Cell MNIT Jaipur',
    'url': baseUrl,
    'potentialAction': {
        '@type': 'SearchAction',
        'target': `${baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
    }
});

export const getBreadcrumbSchema = (baseUrl: string, items: { name: string, item: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': item.item.startsWith('http') ? item.item : `${baseUrl}${item.item}`
    }))
});

export const getNavigationSchema = (baseUrl: string, items: { name: string, url: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': items.map((item, index) => ({
        '@type': 'SiteNavigationElement',
        'position': index + 1,
        'name': item.name,
        'url': item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
});
