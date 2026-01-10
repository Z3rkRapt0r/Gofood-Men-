
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://www.gofoodmenu.it'; // Replace with actual domain

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/api/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
