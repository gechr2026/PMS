export default defineNuxtConfig({
    app: {
        head: {
            title: 'Sales Admin | VRISTO - Multipurpose Tailwind Dashboard Template',
            titleTemplate: '%s | VRISTO - Multipurpose Tailwind Dashboard Template',
            htmlAttrs: {
                lang: 'en',
            },
            meta: [
                { charset: 'utf-8' },
                {
                    name: 'viewport',
                    content: 'width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no',
                },
                { hid: 'description', name: 'description', content: '' },
                { name: 'format-detection', content: 'telephone=no' },
            ],
            link: [
                { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' },
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap',
                },
            ],
        },
    },

    css: ['~/assets/css/app.css'],

    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },

    modules: ['@pinia/nuxt', '@nuxtjs/i18n'],

    i18n: {
        locales: [
            { code: 'da', file: 'da.json' },
            { code: 'de', file: 'de.json' },
            { code: 'el', file: 'fr.json' },
            { code: 'en', file: 'en.json' },
            { code: 'es', file: 'es.json' },
            { code: 'fr', file: 'fr.json' },
            { code: 'hu', file: 'hu.json' },
            { code: 'it', file: 'it.json' },
            { code: 'ja', file: 'ja.json' },
            { code: 'pl', file: 'pl.json' },
            { code: 'pt', file: 'pt.json' },
            { code: 'ru', file: 'ru.json' },
            { code: 'sv', file: 'sv.json' },
            { code: 'tr', file: 'tr.json' },
            { code: 'zh', file: 'zh.json' },
            { code: 'ae', file: 'ae.json' },
        ],
        lazy: true,
        defaultLocale: 'en',
        strategy: 'no_prefix',
        langDir: 'locales/',
    },

    vite: {
        optimizeDeps: { include: ['quill'] },
    },

    router: {
        options: { linkExactActiveClass: 'active' },
    },

    // Public runtime config — exposed to the client.
    // Override with NUXT_PUBLIC_SUPABASE_URL / NUXT_PUBLIC_SUPABASE_KEY env vars in prod.
    runtimeConfig: {
        public: {
            supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || 'https://zfhntrmbawjyztafmqrh.supabase.co',
            supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY || 'sb_publishable_tK-v5_UE_Tlw3yMGnFTCTQ_HVdsxbUW',
        },
    },

    // Security headers (F7 from 2026-05-23 review). Applied to every route.
    // CSP allows: Google Fonts CSS+font files, Supabase functions/realtime, self.
    // 'unsafe-inline' on script/style is required by Nuxt hydration + Vue runtime styles;
    // can be tightened to nonces later.
    routeRules: {
        '/**': {
            headers: {
                'X-Frame-Options': 'DENY',
                'X-Content-Type-Options': 'nosniff',
                'Referrer-Policy': 'strict-origin-when-cross-origin',
                'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
                'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), interest-cohort=()',
                'Content-Security-Policy': [
                    "default-src 'self'",
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                    "font-src 'self' https://fonts.gstatic.com data:",
                    "img-src 'self' data: blob:",
                    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
                    "frame-ancestors 'none'",
                    "base-uri 'self'",
                    "form-action 'self'",
                    "object-src 'none'",
                ].join('; '),
            },
        },
    },

    compatibilityDate: '2024-09-21',
});
