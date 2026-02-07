import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin-dashboard/', '/nav-portal-login/'],
        },
        sitemap: 'https://nav-sikhiyo.vercel.app/sitemap.xml',
    }
}
