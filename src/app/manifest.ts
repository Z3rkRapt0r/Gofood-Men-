import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Gofood Menù',
        short_name: 'Gofood',
        description: 'Menu digitale multilingua, gestione allergeni e setup immediato.',
        start_url: '/',
        display: 'standalone',
        background_color: '#FFF8E7',
        theme_color: '#8B0000',
        icons: [
            {
                src: '/web-app-manifest-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable'
            },
            {
                src: '/web-app-manifest-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
            },
            {
                src: '/icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            }
        ],
    };
}
