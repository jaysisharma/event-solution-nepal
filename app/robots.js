export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/admin/',
        },
        sitemap: 'https://eventsolutionnepal.com.np/sitemap.xml',
    }
}
